import React from 'react';

export const ProgressBar = ({ hierarchy, currentLevel }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm">
        {hierarchy.map((level, index) => (
          <React.Fragment key={level}>
            <span className={`${level === currentLevel ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              {level}
            </span>
            {index < hierarchy.length - 1 && (
              <span className="text-gray-400">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 