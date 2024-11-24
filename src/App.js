import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useWorldBuilder } from './hooks/useWorldBuilder';
import { CompletionScreen } from './components/world-builder/CompletionScreen';
import { GenerationPhase } from './components/world-builder/GenerationPhase';
import { Game } from './components/game/Game';

export default function App() {
  const { state, actions } = useWorldBuilder();

  const handleWorldCreation = async (description) => {
    if (description.length < 50) return;
    actions.setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    actions.setIsGenerating(false);
    actions.setWorldData(prev => ({
      ...prev,
      world: { 
        description, 
        generated: true 
      },
      hierarchy: [],
      entities: {}
    }));
    actions.setCurrentLevel('addLevel');
  };

  const handleComplete = () => {
    actions.setIsComplete(true);
  };

  const WorldBuilder = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {state.isComplete ? (
          <CompletionScreen worldData={state.worldData} actions={actions} />
        ) : (
          <GenerationPhase
            state={{
              ...state,
              levels: state.worldData.hierarchy
            }}
            actions={actions}
            onWorldCreation={handleWorldCreation}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WorldBuilder />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}
