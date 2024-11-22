import React from 'react';
import { ChevronRight, Loader } from 'lucide-react';

export const AssociationPhase = ({ state, actions }) => {
  const handleGenerateEntities = async () => {
    actions.setIsGenerating(true);
    const entities = await actions.generateEntities(state.currentLevel, state.entityCount);
    actions.setWorldData(prev => ({
      ...prev,
      entities: {
        ...prev.entities,
        [state.currentLevel]: entities
      }
    }));
    actions.setIsGenerating(false);
    actions.setShowGeneratedEntities(true);
    
    // Auto-connect if there's only one parent
    if (state.worldData.hierarchy.length > 1) {
      actions.autoConnectSingleParent(state.currentLevel);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="font-medium capitalize">Creating {state.currentLevel}</p>
        <p className="text-sm mt-2">How many {state.currentLevel} would you like to create?</p>
      </div>
      <div>
        <label className="block mb-2">Number of {state.currentLevel}:</label>
        <input
          type="number"
          min="1"
          max="10"
          className="input-field"
          value={state.entityCount}
          onChange={(e) => actions.setEntityCount(parseInt(e.target.value) || 0)}
        />
      </div>

      <button
        onClick={handleGenerateEntities}
        disabled={state.isGenerating || state.entityCount === 0}
        className={`button-primary w-full flex items-center justify-center gap-2 ${
          state.entityCount > 0
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {state.isGenerating ? (
          <>
            <Loader className="animate-spin" size={16} />
            Generating...
          </>
        ) : (
          <>
            <ChevronRight size={16} />
            Generate {state.currentLevel}
          </>
        )}
      </button>
    </div>
  );
}; 