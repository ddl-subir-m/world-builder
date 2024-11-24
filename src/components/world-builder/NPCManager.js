import React, { useState } from 'react';
import { UserPlus, Edit2, Save, Trash2, Plus, X, Loader } from 'lucide-react';
import mockAI from '../../utils/mockAI';

export const NPCManager = ({ entity, entityType, onNPCsUpdate, worldData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingNPC, setEditingNPC] = useState(null);
  const [npcs, setNPCs] = useState(entity.npcs || []);
  const [showNewNPCForm, setShowNewNPCForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newNPC, setNewNPC] = useState({
    name: '',
    role: '',
    description: '',
    personality: '',
    goal: ''
  });

  const handleGenerateNPC = async () => {
    setIsGenerating(true);
    try {
      const newNPC = await mockAI.generateNPCs(
        entityType, 
        entity.name,
        worldData,
        npcs
      );
      
      const updatedNPCs = [...npcs, newNPC];
      setNPCs(updatedNPCs);
      onNPCsUpdate(updatedNPCs);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error('Failed to generate NPC:', error);
    }
    setIsGenerating(false);
  };

  const handleUpdateNPC = (npcId, updates) => {
    const updatedNPCs = npcs.map(npc =>
      npc.id === npcId ? { ...npc, ...updates } : npc
    );
    setNPCs(updatedNPCs);
    onNPCsUpdate(updatedNPCs);
  };

  const handleDeleteNPC = (npcId) => {
    const updatedNPCs = npcs.filter(npc => npc.id !== npcId);
    setNPCs(updatedNPCs);
    onNPCsUpdate(updatedNPCs);
  };

  const handleCreateNPC = () => {
    if (!newNPC.name || !newNPC.role) return;

    const npcToAdd = {
      id: `npc-${Math.random().toString(36).substr(2, 9)}`,
      ...newNPC
    };

    const updatedNPCs = [...npcs, npcToAdd];
    setNPCs(updatedNPCs);
    onNPCsUpdate(updatedNPCs);
    
    // Reset form
    setNewNPC({
      name: '',
      role: '',
      description: '',
      personality: '',
      goal: ''
    });
    setShowNewNPCForm(false);
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Notable NPCs</h4>
        <div className="flex gap-2">
          {showSuccess && (
            <div className="text-sm text-green-600 bg-green-50 py-1 px-3 rounded-full flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              NPC created successfully
            </div>
          )}
          <button
            onClick={handleGenerateNPC}
            className="button-secondary flex items-center gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            Generate NPC
          </button>
          <button
            onClick={() => setShowNewNPCForm(true)}
            className="button-secondary flex items-center gap-2"
          >
            <Plus size={16} />
            Create NPC
          </button>
        </div>
      </div>

      {showNewNPCForm && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-medium">Create New NPC</h5>
            <button
              onClick={() => setShowNewNPCForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="NPC Name"
              className="input-field"
              value={newNPC.name}
              onChange={(e) => setNewNPC(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Role (e.g., Guard Captain, Merchant)"
              className="input-field"
              value={newNPC.role}
              onChange={(e) => setNewNPC(prev => ({ ...prev, role: e.target.value }))}
            />
            <textarea
              placeholder="Description"
              className="input-field"
              value={newNPC.description}
              onChange={(e) => setNewNPC(prev => ({ ...prev, description: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Personality Traits"
              className="input-field"
              value={newNPC.personality}
              onChange={(e) => setNewNPC(prev => ({ ...prev, personality: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Goals and Motivations"
              className="input-field"
              value={newNPC.goal}
              onChange={(e) => setNewNPC(prev => ({ ...prev, goal: e.target.value }))}
            />
            <button
              onClick={handleCreateNPC}
              className="button-primary bg-blue-600 text-white w-full"
              disabled={!newNPC.name || !newNPC.role}
            >
              Create NPC
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {npcs.map(npc => (
          <div key={npc.id} className="bg-white p-4 rounded-lg border">
            {editingNPC === npc.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="input-field"
                  value={npc.name}
                  onChange={(e) => handleUpdateNPC(npc.id, { name: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  value={npc.role}
                  onChange={(e) => handleUpdateNPC(npc.id, { role: e.target.value })}
                />
                <textarea
                  className="input-field"
                  value={npc.description}
                  onChange={(e) => handleUpdateNPC(npc.id, { description: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  value={npc.personality}
                  onChange={(e) => handleUpdateNPC(npc.id, { personality: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field"
                  value={npc.goal}
                  onChange={(e) => handleUpdateNPC(npc.id, { goal: e.target.value })}
                />
                <button
                  onClick={() => setEditingNPC(null)}
                  className="button-secondary flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{npc.name}</h5>
                    <p className="text-sm text-gray-600">{npc.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingNPC(npc.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteNPC(npc.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm mt-2">{npc.description}</p>
                {npc.personality && (
                  <p className="text-sm mt-1 text-gray-600">
                    <strong>Personality:</strong> {npc.personality}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 