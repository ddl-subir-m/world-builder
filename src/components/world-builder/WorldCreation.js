import React from 'react';
import { Globe, Loader } from 'lucide-react';

export const WorldCreation = ({ 
  worldDescription, 
  isGenerating, 
  onDescriptionChange, 
  onCreateWorld 
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">Describe your world in detail to begin the creation process.</p>
      </div>
      <textarea
        className="input-field h-48 resize-none"
        placeholder="Describe your world in rich detail..."
        value={worldDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
      <button
        onClick={onCreateWorld}
        disabled={isGenerating || worldDescription.length < 50}
        className={`button-primary w-full flex items-center justify-center gap-2 ${
          worldDescription.length >= 50
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader className="animate-spin" size={16} />
            Generating...
          </>
        ) : (
          <>
            <Globe size={16} />
            Create World
          </>
        )}
      </button>
    </div>
  );
}; 