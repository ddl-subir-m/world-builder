import React, { useState } from 'react';
import { Globe, Loader, Wand2 } from 'lucide-react';
import mockAI from '../../utils/gameAI';

export const WorldCreation = ({ isGenerating, onCreateWorld }) => {
  const [description, setDescription] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhanceDescription = async () => {
    setIsEnhancing(true);
    try {
      const enhancedDescription = await mockAI.enhanceDescription(description);
      setDescription(enhancedDescription);
    } catch (error) {
      console.error('Failed to enhance description:', error);
    }
    setIsEnhancing(false);
  };

  const isDescriptionValid = description.length >= 50;

  const handleCreateWorld = () => {
    onCreateWorld(description);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">Describe your world in detail to begin the creation process.</p>
      </div>
      <div className="relative">
        <textarea
          className="input-field h-48 resize-none"
          placeholder="Describe your world in rich detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isGenerating}
        />
        <button
          onClick={handleEnhanceDescription}
          disabled={isEnhancing || !isDescriptionValid}
          className={`absolute bottom-4 right-4 px-3 py-2 rounded-md flex items-center gap-2 text-sm
            ${isDescriptionValid
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {isEnhancing ? (
            <>
              <Loader className="animate-spin" size={14} />
              Enhancing...
            </>
          ) : (
            <>
              <Wand2 size={14} />
              Enhance Description
            </>
          )}
        </button>
      </div>
      <button
        onClick={handleCreateWorld}
        disabled={isGenerating || !isDescriptionValid}
        className={`button-primary w-full flex items-center justify-center gap-2 ${
          isDescriptionValid
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