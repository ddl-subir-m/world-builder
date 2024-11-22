import React from 'react';
import { useWorldBuilder } from './hooks/useWorldBuilder';
import { CompletionScreen } from './components/world-builder/CompletionScreen';
import { GenerationPhase } from './components/world-builder/GenerationPhase';



export default function WorldBuilder() {
  const { state, actions } = useWorldBuilder();

  const handleWorldCreation = async () => {
    if (state.worldDescription.length < 50) return;
    actions.setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    actions.setIsGenerating(false);
    actions.setWorldData(prev => ({
      ...prev,
      world: { description: state.worldDescription, generated: true },
      hierarchy: [],
      entities: {}
    }));
    actions.setCurrentLevel('addLevel');
  };

  const handleComplete = () => {
    actions.setIsComplete(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {state.isComplete ? (
          <CompletionScreen worldData={state.worldData} actions={actions} />
        ) : (
          <GenerationPhase
            state={state}
            actions={actions}
            onWorldCreation={handleWorldCreation}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
