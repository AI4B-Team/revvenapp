import React from 'react';

const FileFormatIcons: React.FC = () => {
  const formats = [
    { label: 'JPG', color: 'bg-sky-400', textColor: 'text-white' },
    { label: 'PNG', color: 'bg-purple-500', textColor: 'text-white' },
    { label: 'GIF', color: 'bg-orange-400', textColor: 'text-white' },
    { label: 'BMP', color: 'bg-cyan-500', textColor: 'text-white' },
    { label: 'MP4', color: 'bg-emerald-500', textColor: 'text-white' },
    { label: 'MOV', color: 'bg-rose-500', textColor: 'text-white' },
  ];

  return (
    <div className="flex items-center gap-3 mt-4">
      {formats.map((format) => (
        <div key={format.label} className="flex flex-col items-center">
          <div className="relative w-10 h-12">
            {/* Document body */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200 rounded-md shadow-sm">
              {/* Folded corner */}
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-gray-300 rounded-bl-sm" 
                   style={{ 
                     clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                   }} 
              />
              <div className="absolute top-0 right-0 w-2.5 h-2.5"
                   style={{
                     background: 'linear-gradient(135deg, transparent 50%, #d1d5db 50%)',
                   }}
              />
            </div>
            {/* Label badge */}
            <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 ${format.color} rounded text-[7px] font-bold ${format.textColor} shadow-sm whitespace-nowrap`}>
              {format.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileFormatIcons;