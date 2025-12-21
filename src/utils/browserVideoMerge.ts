import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

interface VideoClip {
  id: string;
  name: string;
  src: string;
  startTime?: number;
  duration?: number;
}

interface MergeProgress {
  stage: 'loading' | 'downloading' | 'processing' | 'finalizing';
  progress: number;
  message: string;
}

type ProgressCallback = (progress: MergeProgress) => void;

const loadFFmpeg = async (onProgress?: ProgressCallback): Promise<FFmpeg> => {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  ffmpeg = new FFmpeg();

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  ffmpeg.on('progress', ({ progress }) => {
    onProgress?.({
      stage: 'processing',
      progress: Math.round(progress * 100),
      message: `Processing... ${Math.round(progress * 100)}%`,
    });
  });

  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Loading video processor...',
  });

  // Load FFmpeg with CDN URLs for WASM files
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  onProgress?.({
    stage: 'loading',
    progress: 100,
    message: 'Video processor ready',
  });

  return ffmpeg;
};

export const mergeVideosInBrowser = async (
  clips: VideoClip[],
  projectTitle: string,
  onProgress?: ProgressCallback
): Promise<Blob> => {
  if (clips.length === 0) {
    throw new Error('No clips to merge');
  }

  // Sort clips by startTime
  const sortedClips = [...clips].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));

  const ff = await loadFFmpeg(onProgress);

  // Download all video files
  const inputFiles: string[] = [];
  
  for (let i = 0; i < sortedClips.length; i++) {
    const clip = sortedClips[i];
    const inputName = `input${i}.mp4`;
    
    onProgress?.({
      stage: 'downloading',
      progress: Math.round(((i + 1) / sortedClips.length) * 100),
      message: `Downloading clip ${i + 1}/${sortedClips.length}...`,
    });

    try {
      const fileData = await fetchFile(clip.src);
      await ff.writeFile(inputName, fileData);
      inputFiles.push(inputName);
    } catch (error) {
      console.error(`Failed to download clip ${i}:`, error);
      throw new Error(`Failed to download clip: ${clip.name}`);
    }
  }

  onProgress?.({
    stage: 'processing',
    progress: 0,
    message: 'Merging clips...',
  });

  const outputName = `${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_merged.mp4`;

  if (inputFiles.length === 1) {
    // Single file - just copy it
    await ff.exec(['-i', inputFiles[0], '-c', 'copy', outputName]);
  } else {
    // Create concat file for FFmpeg
    const concatContent = inputFiles.map(f => `file '${f}'`).join('\n');
    await ff.writeFile('concat.txt', concatContent);

    // Merge using concat demuxer
    await ff.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c', 'copy',
      outputName,
    ]);

    // Cleanup concat file
    await ff.deleteFile('concat.txt');
  }

  onProgress?.({
    stage: 'finalizing',
    progress: 90,
    message: 'Preparing download...',
  });

  // Read the output file
  const data = await ff.readFile(outputName);
  
  // Convert FileData to ArrayBuffer for Blob creation
  let arrayBuffer: ArrayBuffer;
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    arrayBuffer = encoder.encode(data).buffer as ArrayBuffer;
  } else {
    // Create a new ArrayBuffer from the Uint8Array to avoid SharedArrayBuffer issues
    arrayBuffer = new Uint8Array(data).buffer as ArrayBuffer;
  }
  
  // Cleanup input files
  for (const inputFile of inputFiles) {
    try {
      await ff.deleteFile(inputFile);
    } catch {
      // Ignore cleanup errors
    }
  }
  
  // Cleanup output file
  try {
    await ff.deleteFile(outputName);
  } catch {
    // Ignore cleanup errors
  }

  onProgress?.({
    stage: 'finalizing',
    progress: 100,
    message: 'Complete!',
  });

  return new Blob([arrayBuffer], { type: 'video/mp4' });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
