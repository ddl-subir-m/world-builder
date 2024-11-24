export const AI_MODELS = {
  // Core world-building models
  worldBuilder: "gpt-4o-mini",
  levelSuggestions: "gpt-4o-mini",
  entityGeneration: "gpt-4o-mini",
  descriptionEnhancer: "gpt-4o-mini",
  
  // Game mechanics models
  inventoryGeneration: "gpt-4o-mini",
  gameStart: "gpt-4o-mini",
  // gameMaster: "gpt-4o-mini"
  gameMaster: "gpt-4o",
  
  // NPC generation
  npcGeneration: "gpt-4o-mini",
  
  // Default fallback model
  default: "gpt-4o-mini"
};

export const AI_CONFIG = {
  temperature: {
    creative: 0.8,    // For names and descriptions
    balanced: 0.7,    // For most generation tasks
    precise: 0.3      // For structured data
  },
  maxTokens: {
    short: 30,        // For names
    medium: 150,      // For descriptions
    long: 250,        // For enhanced descriptions
    veryLong: 500     // For complex generations
  }
}; 