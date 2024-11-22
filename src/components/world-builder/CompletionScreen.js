import React, { useState } from 'react';
import { CheckCircle, Package, Loader, Edit2, Save, Plus, X } from 'lucide-react';

export const CompletionScreen = ({ worldData, actions }) => {
  const [generatingInventory, setGeneratingInventory] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleGenerateInventory = async () => {
    setGeneratingInventory(true);
    const newInventory = await actions.generateInventory(worldData.world.description);
    setHasUnsavedChanges(true);
    actions.updateInventory(newInventory);
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

  const handleSaveChanges = () => {
    setHasUnsavedChanges(false);
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
              {worldData.hierarchy.join(' → ')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">World Inventory</h3>
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
              className="button-primary flex items-center gap-1"
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
        )}
      </div>
    </div>
  );
};