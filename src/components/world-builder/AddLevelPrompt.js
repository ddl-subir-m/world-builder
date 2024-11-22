import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import mockAI from '../../utils/mockAI';
import { isNameUnique } from '../../utils/validation';

const AddLevelPrompt = ({ onAddLevel, onComplete, worldData }) => {
    const [newLevelName, setNewLevelName] = useState('');
    const [suggestedLevels, setSuggestedLevels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
  
    useEffect(() => {
      const loadSuggestions = async () => {
        setIsLoading(true);
        const suggestions = await mockAI.suggestLevels(worldData);
        setSuggestedLevels(suggestions);
        setIsLoading(false);
      };
      loadSuggestions();
    }, [worldData]);
  
    const handleAddLevel = (levelName) => {
      if (!levelName.trim()) {
        setError('Level name cannot be empty');
        return;
      }
      
      if (!isNameUnique(levelName, worldData.hierarchy)) {
        setError(`A level named "${levelName}" already exists`);
        return;
      }
  
      setError('');
      onAddLevel(levelName);
      setNewLevelName('');
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-medium">Add Another Level?</h3>
          <p className="text-sm mt-2">Choose a name for the next level in your world hierarchy</p>
          {worldData.hierarchy.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              Current hierarchy: {worldData.hierarchy.join(' → ')}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin" />
              <span className="ml-2">Getting suggestions...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {suggestedLevels.map(level => (
                <button
                  key={level}
                  onClick={() => handleAddLevel(level)}
                  className="p-4 rounded-lg border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <span className="block font-medium capitalize">{level}</span>
                  <span className="text-sm text-gray-500">Add {level} level</span>
                </button>
              ))}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className={`input-field flex-1 ${error ? 'border-red-500' : ''}`}
                placeholder="Or enter a custom level name..."
                value={newLevelName}
                onChange={(e) => {
                  setNewLevelName(e.target.value);
                  setError('');
                }}
              />
              <button
                onClick={() => handleAddLevel(newLevelName)}
                disabled={!newLevelName || !!error}
                className="button-primary bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
              >
                Add Custom
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
        
        <div className="flex gap-4">
         <button
          onClick={onComplete}
          className="flex-1 button-primary bg-blue-600 text-white hover:bg-blue-700"
        >
          Complete World Building
        </button>
        <button
          onClick={() => setNewLevelName('')}
          className="flex-1 button-primary border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Add Another Level
        </button>
        </div>
      </div>
    );
};

export default AddLevelPrompt;