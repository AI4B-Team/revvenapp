import React from 'react';

const FileFormatIcons: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mt-4">
      {/* JPG - Image/landscape theme */}
      <div className="flex flex-col items-center">
        <div className="relative w-11 h-14">
          {/* Document body */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md shadow-sm border border-gray-200">
            {/* Folded corner */}
            <div className="absolute top-0 right-0 w-3 h-3">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-200 rounded-bl-sm"></div>
            </div>
            {/* Image icon - mountains and sun */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-7 h-5">
              <div className="absolute top-0 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[10px] border-b-teal-400"></div>
              <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[7px] border-b-teal-300"></div>
            </div>
          </div>
          {/* Label badge */}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-teal-500 rounded text-[8px] font-bold text-white shadow-sm">
            JPG
          </div>
        </div>
      </div>

      {/* PNG - Transparency/checkerboard theme */}
      <div className="flex flex-col items-center">
        <div className="relative w-11 h-14">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md shadow-sm border border-gray-200">
            <div className="absolute top-0 right-0 w-3 h-3">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-200 rounded-bl-sm"></div>
            </div>
            {/* Checkerboard pattern for transparency */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 grid grid-cols-3 gap-0.5 overflow-hidden rounded">
              <div className="w-2 h-2 bg-purple-300"></div>
              <div className="w-2 h-2 bg-purple-100"></div>
              <div className="w-2 h-2 bg-purple-300"></div>
              <div className="w-2 h-2 bg-purple-100"></div>
              <div className="w-2 h-2 bg-purple-400"></div>
              <div className="w-2 h-2 bg-purple-100"></div>
              <div className="w-2 h-2 bg-purple-300"></div>
              <div className="w-2 h-2 bg-purple-100"></div>
              <div className="w-2 h-2 bg-purple-300"></div>
            </div>
          </div>
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-500 rounded text-[8px] font-bold text-white shadow-sm">
            PNG
          </div>
        </div>
      </div>

      {/* GIF - Animation/motion theme */}
      <div className="flex flex-col items-center">
        <div className="relative w-11 h-14">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md shadow-sm border border-gray-200">
            <div className="absolute top-0 right-0 w-3 h-3">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-200 rounded-bl-sm"></div>
            </div>
            {/* Motion/animation circles */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-orange-500 rounded text-[8px] font-bold text-white shadow-sm">
            GIF
          </div>
        </div>
      </div>

      {/* BMP - Pixel/bitmap theme */}
      <div className="flex flex-col items-center">
        <div className="relative w-11 h-14">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md shadow-sm border border-gray-200">
            <div className="absolute top-0 right-0 w-3 h-3">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-200 rounded-bl-sm"></div>
            </div>
            {/* Pixel grid pattern */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 grid grid-cols-4 gap-px w-6 h-5">
              <div className="bg-cyan-400"></div>
              <div className="bg-cyan-300"></div>
              <div className="bg-cyan-500"></div>
              <div className="bg-cyan-300"></div>
              <div className="bg-cyan-300"></div>
              <div className="bg-cyan-500"></div>
              <div className="bg-cyan-300"></div>
              <div className="bg-cyan-400"></div>
              <div className="bg-cyan-500"></div>
              <div className="bg-cyan-300"></div>
              <div className="bg-cyan-400"></div>
              <div className="bg-cyan-300"></div>
            </div>
          </div>
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-500 rounded text-[8px] font-bold text-white shadow-sm">
            BMP
          </div>
        </div>
      </div>

      {/* MP4 - Video/play theme */}
      <div className="flex flex-col items-center">
        <div className="relative w-11 h-14">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md shadow-sm border border-gray-200">
            <div className="absolute top-0 right-0 w-3 h-3">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-200 rounded-bl-sm"></div>
            </div>
            {/* Play button */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-emerald-500 ml-0.5"></div>
            </div>
          </div>
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 rounded text-[8px] font-bold text-white shadow-sm">
            MP4
          </div>
        </div>
      </div>

      {/* MOV - Film/movie theme */}
      <div className="flex flex-col items-center">
        <div className="relative w-11 h-14">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md shadow-sm border border-gray-200">
            <div className="absolute top-0 right-0 w-3 h-3">
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gray-200 rounded-bl-sm"></div>
            </div>
            {/* Film strip */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-7 h-5 bg-rose-100 rounded-sm overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-300 flex flex-col justify-around">
                <div className="w-0.5 h-0.5 bg-rose-100 mx-auto"></div>
                <div className="w-0.5 h-0.5 bg-rose-100 mx-auto"></div>
                <div className="w-0.5 h-0.5 bg-rose-100 mx-auto"></div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-300 flex flex-col justify-around">
                <div className="w-0.5 h-0.5 bg-rose-100 mx-auto"></div>
                <div className="w-0.5 h-0.5 bg-rose-100 mx-auto"></div>
                <div className="w-0.5 h-0.5 bg-rose-100 mx-auto"></div>
              </div>
              <div className="absolute inset-1 bg-rose-200 rounded-sm"></div>
            </div>
          </div>
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-rose-500 rounded text-[8px] font-bold text-white shadow-sm">
            MOV
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileFormatIcons;