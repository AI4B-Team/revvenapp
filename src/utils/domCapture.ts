import { toPng } from 'html-to-image';

/**
 * Capture a DOM element to a PNG blob.
 * Note: This captures the in-app DOM, not the OS/window outside the browser.
 */
export async function captureElementToPngBlob(el: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
  });

  const res = await fetch(dataUrl);
  return await res.blob();
}
