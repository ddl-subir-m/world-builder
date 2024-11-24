import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Loader, Edit2, Save, Plus, X, Code, Play } from 'lucide-react';
import gameAI from '../../utils/gameAI';

export const CompletionScreen = ({ worldData, actions }) => {
  const [generatingInventory, setGeneratingInventory] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  const [pluralizedHierarchy, setPluralizedHierarchy] = useState([]);

  useEffect(() => {
    const pluralizeHierarchy = async () => {
      try {
        const pluralized = await Promise.all(
          worldData.hierarchy.map(level => gameAI.pluralize(level))
        );
        setPluralizedHierarchy(pluralized);
      } catch (error) {
        console.error('Failed to pluralize hierarchy:', error);
        setPluralizedHierarchy(worldData.hierarchy);
      }
    };

    pluralizeHierarchy();
  }, [worldData.hierarchy]);

  const handleGenerateInventory = async () => {
    setGeneratingInventory(true);
    try {
      const newInventory = await gameAI.generateInventory({
        world: worldData.world,
        hierarchy: worldData.hierarchy,
        entities: worldData.entities
      });
      setHasUnsavedChanges(true);
      actions.updateInventory(newInventory);
    } catch (error) {
      console.error('Failed to generate inventory:', error);
    }
    setGeneratingInventory(false);
  };

  const handleUpdateItem = (itemId, updates) => {
    const updatedInventory = worldData.inventory.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    setHasUnsavedChanges(true);
    actions.updateInventory(updatedInventory);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const item = {
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      ...newItem
    };

    const updatedInventory = [...worldData.inventory, item];
    setHasUnsavedChanges(true);
    actions.updateInventory(updatedInventory);
    setNewItem({ name: '', quantity: 1 });
    setShowAddItem(false);
  };

  const handleSaveInventory = () => {
    setHasUnsavedChanges(false);
  };

  const generateGameEngineJSON = async () => {
    const timestamp = new Date().toISOString();
    
    // Helper function to build the entity hierarchy
    const buildEntityHierarchy = async (level, parentEntity = null) => {
      const entities = worldData.entities[level] || [];
      
      return Promise.all(entities.map(async entity => {
        // Find the next level in hierarchy
        const levelIndex = worldData.hierarchy.indexOf(level);
        const nextLevel = worldData.hierarchy[levelIndex + 1];
        
        // Build the base entity without id
        const entityData = {
          name: entity.name,
          description: entity.description,
          npcs: (entity.npcs || []).map(npc => ({
            name: npc.name,
            role: npc.role,
            description: npc.description,
            personality: npc.personality,
            goal: npc.goal
          }))
        };
        
        // If there's a next level, add its plural name as a key with nested entities
        if (nextLevel) {
          const pluralKey = await gameAI.pluralize(nextLevel);
          entityData[pluralKey] = await buildEntityHierarchy(nextLevel, entity);
        }
        
        return entityData;
      }));
    };

    // Start building from the top level
    const topLevel = worldData.hierarchy[0];
    const pluralTopLevel = await gameAI.pluralize(topLevel);
    
    return {
      world: {
        description: worldData.world.description,
        hierarchy: worldData.hierarchy,
        [pluralTopLevel]: await buildEntityHierarchy(topLevel)
      },
      player: {
        inventory: worldData.inventory.map(item => ({
          name: item.name,
          quantity: item.quantity,
          category: item.category || 'misc',
          description: item.description || `A ${item.name}`
        }))
      },
      metadata: {
        version: "1.0",
        created: timestamp,
        lastModified: timestamp
      }
    };
  };

  // Helper function to get all NPCs from the world data
  const getAllNPCs = () => {
    const npcs = [];
    
    const traverseEntities = (entities, location = []) => {
      Object.entries(entities).forEach(([level, levelEntities]) => {
        levelEntities.forEach(entity => {
          if (entity.npcs) {
            entity.npcs.forEach(npc => {
              npcs.push({
                ...npc,
                location: [...location, entity.name]
              });
            });
          }
          
          // Recursively check child entities
          Object.entries(entity).forEach(([key, value]) => {
            if (Array.isArray(value) && key !== 'npcs') {
              traverseEntities({ [key]: value }, [...location, entity.name]);
            }
          });
        });
      });
    };

    traverseEntities({ [worldData.hierarchy[0]]: worldData.entities[worldData.hierarchy[0]] });
    return npcs;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          <h2 className="text-2xl font-bold">World Creation Complete!</h2>
          <p className="text-gray-600">
            Your world has been successfully created with {worldData.hierarchy.length} levels
          </p>
          <div className="mt-6">
            <h3 className="font-medium mb-2">World Hierarchy:</h3>
            <p className="text-gray-600 bg-gray-50 py-2 px-4 rounded-md inline-block">
              {pluralizedHierarchy.join(' → ')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-medium mb-4">Notable Characters</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {getAllNPCs().map((npc, index) => (
            <div key={index} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{npc.name}</h4>
                  <p className="text-sm text-gray-600">{npc.role}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {npc.location.join(' → ')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{npc.description}</p>
              <div className="mt-3">
                <p className="text-sm">
                  <span className="text-gray-500">Personality:</span> {npc.personality}
                </p>
              </div>
            </div>
          ))}
        </div>
        {getAllNPCs().length === 0 && (
          <p className="text-gray-500 text-center py-4">No NPCs have been created yet.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-medium">Player Inventory</h3>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-600 mt-1">You have unsaved changes</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddItem(true)}
              className="button-secondary flex items-center gap-1"
            >
              <Plus size={16} />
              Add Item
            </button>
            <button
              onClick={handleGenerateInventory}
              disabled={generatingInventory}
              className="button-secondary flex items-center gap-1"
            >
              {generatingInventory ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <Package size={16} />
              )}
              {worldData.inventory.length ? 'Regenerate Inventory' : 'Generate Inventory'}
            </button>
          </div>
        </div>

        {showAddItem && (
          <div className="bg-white p-4 rounded-lg border mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Add New Item</h4>
              <button onClick={() => setShowAddItem(false)} className="text-gray-500 hover:text-gray-700">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-field"
                  />
                </div>
              </div>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim()}
                className="button-primary bg-blue-600 text-white hover:bg-blue-700 w-full"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        {worldData.inventory.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {worldData.inventory.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border hover:border-gray-300 transition-colors">
                  {editingItem === item.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                        className="input-field"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="input-field w-24"
                        />
                      </div>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="button-secondary w-full flex items-center justify-center gap-1"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <button
                        onClick={() => setEditingItem(item.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t pt-6 mt-6">
              <button
                onClick={handleSaveInventory}
                disabled={!hasUnsavedChanges}
                className={`button-primary w-full flex items-center justify-center gap-2 ${
                  hasUnsavedChanges 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100'
                }`}
              >
                <Save size={16} />
                {hasUnsavedChanges ? 'Save Inventory Changes' : 'Inventory Saved'}
              </button>
              {!hasUnsavedChanges && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  All changes are saved
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-medium">Game Engine Data</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="button-secondary flex items-center gap-2"
            >
              <Code size={16} />
              {showJSON ? 'Hide' : 'Show'} JSON
            </button>
            <button
              onClick={async () => {
                // Store game data in localStorage
                const gameData = await generateGameEngineJSON();
                localStorage.setItem('gameEngineData', JSON.stringify(gameData));
                // Navigate to game page
                window.location.href = '/game';
              }}
              className="button-primary bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Play size={16} />
              Start Game
            </button>
          </div>
        </div>

        {showJSON && (
          <div className="mt-4">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[500px] text-sm">
              {JSON.stringify(generateGameEngineJSON(), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};