import React, { useState } from 'react';
import { WorldCreation } from './WorldCreation';
import AddLevelPrompt from './AddLevelPrompt';
import { ChevronRight, Loader } from 'lucide-react';

export const GenerationPhase = ({ state, actions, onWorldCreation, onComplete }) => {
  const [editingEntity, setEditingEntity] = useState(null);
  
  const handleEntityUpdate = (entityId, updates) => {
    actions.setWorldData(prev => ({
      ...prev,
      entities: {
        ...prev.entities,
        [state.currentLevel]: prev.entities[state.currentLevel].map(entity =>
          entity.id === entityId ? { ...entity, ...updates } : entity
        )
      }
    }));
  };

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
    
    if (state.worldData.hierarchy.length > 1) {
      actions.autoConnectSingleParent(state.currentLevel);
    }
  };

  const handleAssociation = (childId, parentId) => {
    actions.setWorldData(prev => ({
      ...prev,
      associations: {
        ...prev.associations,
        [childId]: parentId
      }
    }));
  };


  if (state.currentLevel === 'world' && !state.worldData.world.generated) {
    return <WorldCreation {...{ worldDescription: state.worldDescription, isGenerating: state.isGenerating, 
                              onDescriptionChange: actions.setWorldDescription, onCreateWorld: onWorldCreation }} />;
  }

  if (state.currentLevel === 'addLevel') {
    return (
      <AddLevelPrompt
        onAddLevel={(levelName) => {
          actions.setWorldData(prev => ({
            ...prev,
            hierarchy: [...prev.hierarchy, levelName]
          }));
          actions.setCurrentLevel(levelName);
          actions.setShowGeneratedEntities(false);
          actions.setEntityCount(0);
        }}
        onComplete={() => actions.setIsComplete(true)}
        worldData={state.worldData}
      />
    );
  }

  if (!state.showGeneratedEntities) {
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
        <button onClick={handleGenerateEntities} disabled={state.isGenerating || state.entityCount === 0}
          className={`button-primary w-full flex items-center justify-center gap-2 ${
            state.entityCount > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
          {state.isGenerating ? (
            <><Loader className="animate-spin" size={16} />Generating...</>
          ) : (
            <><ChevronRight size={16} />Generate {state.currentLevel}</>
          )}
        </button>
      </div>
    );
  }

  // Show generated entities with parent association
  const currentLevelIndex = state.worldData.hierarchy.indexOf(state.currentLevel);
  const parentLevel = currentLevelIndex > 0 ? state.worldData.hierarchy[currentLevelIndex - 1] : null;
  const parentEntities = parentLevel ? state.worldData.entities[parentLevel] || [] : [];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-medium">Generated {state.currentLevel}</h3>
        <p className="text-sm mt-2">Here are your generated {state.currentLevel}:</p>
      </div>

      {parentLevel && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Associate with {parentLevel}</h4>
          <p className="text-sm text-gray-600 mb-4">Select a parent {parentLevel} for each {state.currentLevel}</p>
        </div>
      )}

      <div className="grid gap-4">
        {state.worldData.entities[state.currentLevel]?.map((entity) => (
          <div key={entity.id} className="card p-4">
            {editingEntity === entity.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="input-field"
                  value={entity.name}
                  onChange={(e) => handleEntityUpdate(entity.id, { name: e.target.value })}
                />
                <textarea
                  className="input-field"
                  value={entity.description}
                  onChange={(e) => handleEntityUpdate(entity.id, { description: e.target.value })}
                />
                <button
                  onClick={() => setEditingEntity(null)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{entity.name}</h4>
                  <button
                    onClick={() => setEditingEntity(entity.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">{entity.description}</p>
                
                {parentLevel && (
                  <div className="mt-4">
                    <label className="text-sm font-medium">
                      {`Parent ${parentLevel.endsWith('s') ? parentLevel.slice(0, -1) : parentLevel}:`}
                    </label>
                    <div className="flex flex-col gap-1">
                      <select
                        className="input-field mt-1"
                        value={state.worldData.associations[entity.id] || ''}
                        onChange={(e) => handleAssociation(entity.id, e.target.value)}
                      >
                        <option value=""></option>
                        {parentEntities.map(parent => (
                          <option key={parent.id} value={parent.id}>{parent.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onComplete}
          className="flex-1 button-primary bg-blue-600 text-white hover:bg-blue-700"
        >
          Complete World Building
        </button>
        <button
          onClick={() => actions.setCurrentLevel('addLevel')}
          className="flex-1 button-primary border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Add Next Level
        </button>
      </div>
    </div>
  );
};