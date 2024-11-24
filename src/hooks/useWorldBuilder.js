import { useState } from 'react';
import mockAI from '../utils/mockAI';

export const useWorldBuilder = () => {
  const [currentPhase, setCurrentPhase] = useState('generation');
  const [worldData, setWorldData] = useState({
    world: { description: '', generated: false },
    hierarchy: [],
    entities: {},
    associations: {},
    inventory: [],
    npcs: {} 
  });
  const [currentLevel, setCurrentLevel] = useState('world');
  const [isGenerating, setIsGenerating] = useState(false);
  const [entityCount, setEntityCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showGeneratedEntities, setShowGeneratedEntities] = useState(false);

  const generateEntities = async (level, count) => {
    const singularLevel = level.endsWith('s') ? level.slice(0, -1) : level;
    const entities = [];
    
    console.log('Starting generation for level:', level, 'Count:', count);
    
    for (let i = 0; i < count; i++) {
      try {
        console.log(`Generating entity ${i + 1} of ${count}`);
        
        const worldContext = {
          world: worldData.world,
          hierarchy: worldData.hierarchy,
          entities: worldData.entities,
          associations: worldData.associations
        };

        // Generate name
        const name = await mockAI.generateEntityName(singularLevel, worldContext, i);
        console.log('Generated name:', name);

        // Generate description
        const description = await mockAI.generateEntityDescription(singularLevel, name, worldContext);
        console.log('Generated description:', description);
        
        entities.push({
          id: `${level}-${i}`,
          name,
          description,
          needsDescription: false
        });
      } catch (error) {
        console.error(`Failed to generate entity ${i + 1}:`, error);
        
        entities.push({
          id: `${level}-${i}`,
          name: `${singularLevel} ${i + 1}`, // Fallback name
          description: '',
          needsDescription: true
        });
      }
    }
    
    console.log('Generated entities:', entities);
    return entities;
  };

  const autoConnectSingleParent = (childLevel) => {
    const parentLevel = worldData.hierarchy[worldData.hierarchy.indexOf(childLevel) - 1];
    const parentEntities = worldData.entities[parentLevel] || [];
    const childEntities = worldData.entities[childLevel] || [];

    if (parentEntities.length === 1) {
      const newAssociations = {};
      childEntities.forEach(child => {
        newAssociations[child.id] = parentEntities[0].id;
      });
      setWorldData(prev => ({
        ...prev,
        associations: { ...prev.associations, ...newAssociations }
      }));
      return true;
    }
    return false;
  };

  const updateEntity = (level, entityId, updates) => {
    setWorldData(prev => ({
      ...prev,
      entities: {
        ...prev.entities,
        [level]: prev.entities[level].map(entity =>
          entity.id === entityId ? { ...entity, ...updates } : entity
        )
      }
    }));
  };

  const updateInventory = (inventory) => {
    setWorldData(prev => ({
      ...prev,
      inventory
    }));
  };

  return {
    state: {
      currentPhase,
      worldData,
      currentLevel,
      isGenerating,
      entityCount,
      isComplete,
      showGeneratedEntities
    },
    actions: {
      setCurrentPhase,
      setWorldData,
      setCurrentLevel,
      setIsGenerating,
      setEntityCount,
      setIsComplete,
      setShowGeneratedEntities,
      generateEntities,
      autoConnectSingleParent,
      generateInventory: mockAI.generateInventory,
      updateEntity,
      updateInventory
    }
  };
}; 