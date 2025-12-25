import React from 'react';

const FileFormatIcons: React.FC = () => {
  const formats = [
    { label: 'JPG', color: 'bg-sky-400' },
    { label: 'PNG', color: 'bg-purple-500' },
    { label: 'GIF', color: 'bg-orange-400' },
    { label: 'BMP', color: 'bg-cyan-500' },
    { label: 'MP4', color: 'bg-emerald-500' },
    { label: 'MOV', color: 'bg-rose-500' },
  ];

  return (
    <div className="flex items-center gap-4 mt-4">
      {formats.map((format) => (
        <div key={format.label} className="relative">
          {/* Document body */}
          <div className="relative w-10 h-12">
            <svg viewBox="0 0 40 48" className="w-full h-full">
              {/* Paper background */}
              <path 
                d="M0 4 C0 1.79 1.79 0 4 0 L28 0 L40 12 L40 44 C40 46.21 38.21 48 36 48 L4 48 C1.79 48 0 46.21 0 44 Z" 
                fill="#f3f4f6" 
              />
              {/* Folded corner */}
              <path 
                d="M28 0 L28 8 C28 10.21 29.79 12 32 12 L40 12 Z" 
                fill="#d1d5db" 
              />
            </svg>
          </div>
          {/* Label badge - overlapping left side */}
          <div 
            className={`absolute bottom-2 -left-1 px-2 py-0.5 ${format.color} rounded text-[8px] font-bold text-white shadow-sm`}
          >
            {format.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileFormatIcons;