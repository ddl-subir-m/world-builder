import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import mockAI from '../../utils/gameAI';
import { isNameUnique } from '../../utils/validation';

export const AddLevelPrompt = ({ onAddLevel, onComplete, worldData }) => {
  const [newLevel, setNewLevel] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const suggestedLevels = await mockAI.suggestLevels({
        worldData: worldData,
        hierarchy: worldData.hierarchy,
        currentLevel: worldData.hierarchy[worldData.hierarchy.length - 1]
      });
      setSuggestions(suggestedLevels);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
    setLoadingSuggestions(false);
  }, [worldData]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleAddLevel = () => {
    if (!newLevel.trim()) {
      setError('Please enter a level name');
      return;
    }
    
    if (!isNameUnique(newLevel, worldData.hierarchy)) {
      setError('This level already exists');
      return;
    }

    onAddLevel(newLevel);
    setNewLevel('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm">Add levels to your world's hierarchy (e.g., kingdoms, provinces, cities)</p>
      </div>
      
      {worldData.hierarchy.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Current Hierarchy:</h3>
          <div className="flex flex-wrap gap-2">
            {worldData.hierarchy.map((level) => (
              <span key={level} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {level}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-2">Suggested Levels:</h3>
        <div className="flex flex-wrap gap-2">
          {loadingSuggestions ? (
            <Loader className="animate-spin" size={16} />
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setNewLevel(suggestion)}
                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100"
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="Enter new level..."
          value={newLevel}
          onChange={(e) => setNewLevel(e.target.value)}
        />
        <button
          onClick={handleAddLevel}
          className="button-primary bg-blue-600 text-white px-4"
        >
          Add Level
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <button
        onClick={onComplete}
        disabled={worldData.hierarchy.length === 0}
        className={`button-primary w-full ${
          worldData.hierarchy.length > 0
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        Complete Hierarchy
      </button>
      
      {worldData.hierarchy.length === 0 && (
        <p className="text-amber-600 text-sm">
          Please add at least one level before completing the hierarchy.
        </p>
      )}
    </div>
  );
};

export default AddLevelPrompt;