import OpenAI from 'openai';
import { AI_PROMPTS } from '../config/aiPrompts';
import { AI_MODELS, AI_CONFIG } from '../config/aiConfig';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const gameAI = {
    async suggestLevels(context) {
      try {
        console.log('Full context received:', context);
        
        const worldDescription = context.worldData?.world?.description;
        const currentHierarchy = context.hierarchy || [];
        
        console.log('Sending context to OpenAI:', {
          worldDescription,
          currentHierarchy
        });

        if (!worldDescription) {
          console.warn('World description is missing in suggestLevels');
        }

        const response = await openai.chat.completions.create({
          model: AI_MODELS.levelSuggestions,
          messages: [
            AI_PROMPTS.levelSuggestions,
            {
              role: "user",
              content: JSON.stringify({
                worldDescription: worldDescription || "A fantasy world",
                currentHierarchy: currentHierarchy,
                currentLevel: context.currentLevel
              })
            }
          ],
          temperature: AI_CONFIG.temperature.balanced,
          max_tokens: AI_CONFIG.maxTokens.medium,
          response_format: { type: "json_object" }
        });

        console.log('Raw OpenAI response:', response.choices[0].message.content);
        
        const parsedResponse = JSON.parse(response.choices[0].message.content);
        console.log('Parsed suggestions:', parsedResponse.suggestions);
        
        return parsedResponse.suggestions;
      } catch (error) {
        console.error('OpenAI API Error:', error);
        return ['regions', 'territories', 'settlements', 'locations'];
      }
    },
  
    async generateEntityName(level, worldContext, index) {
      try {
        console.log('Generating name for:', level, 'Index:', index);
        console.log('World context:', JSON.stringify(worldContext, null, 2));
        
        const response = await openai.chat.completions.create({
          model: AI_MODELS.entityGeneration,
          messages: [
            AI_PROMPTS.entityName,
            {
              role: "user",
              content: JSON.stringify({
                worldDescription: worldContext.world.description,
                hierarchy: worldContext.hierarchy,
                entityType: level,
                entityNumber: index + 1
              })
            }
          ],
          temperature: AI_CONFIG.temperature.creative,
          max_tokens: AI_CONFIG.maxTokens.short,
          presence_penalty: 0.6,
          frequency_penalty: 0.8
        });

        console.log('OpenAI Response:', response);
        return response.choices[0].message.content.trim();
      } catch (error) {
        console.error('OpenAI API Error Details:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        throw error;
      }
    },
  
    async generateEntityDescription(level, entityName, worldContext) {
      try {
        console.log('Generating description for:', entityName);
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.entityDescription,
            {
              role: "user",
              content: JSON.stringify({
                worldDescription: worldContext.world.description,
                hierarchy: worldContext.hierarchy,
                currentLevel: level,
                entityName: entityName
              })
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
          presence_penalty: 0.2,
          frequency_penalty: 0.3
        });

        console.log('OpenAI Response:', response);
        return response.choices[0].message.content.trim();
      } catch (error) {
        console.error('OpenAI API Error Details:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        throw error;
      }
    },
  
    async generateInventory(worldContext) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.inventoryGeneration,
            {
              role: "user",
              content: `Create a starting inventory of 4-6 items for a player in this world. Follow this JSON structure:
{
  "items": [
    {
      "name": "Item name",
      "category": "weapons|armor|supplies|tools",
      "description": "Brief item description with world context",
      "quantity": number
    }
  ]
}

World Context:
${JSON.stringify({
  worldDescription: worldContext.world.description,
  hierarchy: worldContext.hierarchy,
  entities: worldContext.entities
})}

Requirements:
- Items should fit the world's theme and setting
- Include a mix of categories
- Descriptions should reference world elements
- Quantities should be reasonable for starting items
- Items should be useful for adventure/exploration
- No extremely powerful or rare items`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" }
        });

        const inventoryData = JSON.parse(response.choices[0].message.content);
        
        return inventoryData.items.map(item => ({
          id: `${item.category}-${Math.random().toString(36).substr(2, 9)}`,
          ...item
        }));
      } catch (error) {
        console.error('OpenAI API Error:', error);
        // Fallback to basic inventory if API fails
        return [
          {
            id: 'supplies-fallback1',
            name: 'Basic Supplies',
            category: 'supplies',
            description: 'Essential items for survival.',
            quantity: 1
          }
        ];
      }
    },
  
    async generateNPCs(entityType, entityName, worldContext, existingNPCs = []) {
      const isNameUnique = (name, existingNames) => {
        return !existingNames.some(
          existingName => existingName.toLowerCase() === name.toLowerCase()
        );
      };

      try {
        const response = await openai.chat.completions.create({
          model: AI_MODELS.npcGeneration,
          messages: [
            AI_PROMPTS.npcGeneration,
            {
              role: "user",
              content: `Create a detailed NPC for ${entityName} (a ${entityType}) following this exact JSON structure:
              ${AI_PROMPTS.npcGenerationPrompt.content}

              Requirements:
              - Character should fit the world context: ${worldContext.world.description}
              - Name must be unique (existing NPCs: ${existingNPCs.map(npc => npc.name).join(', ')})
              - Keep each field concise (1-2 sentences)
              - Ensure character fits the location's theme
              - Return only the JSON object, no additional text`
            }
          ],
          temperature: AI_CONFIG.temperature.balanced,
          max_tokens: AI_CONFIG.maxTokens.veryLong,
          response_format: { type: "json_object" }
        });

        let npcData;
        try {
          npcData = JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
          console.error('JSON Parse Error:', response.choices[0].message.content);
          throw new Error('Failed to parse NPC data');
        }
        
        // Validate the required fields
        const requiredFields = ['name', 'role', 'description', 'personality', 'background', 'desires', 'fears', 'goal'];
        const missingFields = requiredFields.filter(field => !npcData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Invalid NPC data: Missing fields: ${missingFields.join(', ')}`);
        }

        // Verify name uniqueness
        if (!isNameUnique(npcData.name, existingNPCs.map(npc => npc.name))) {
          throw new Error('Generated name is not unique. Please try again.');
        }

        return {
          id: `npc-${Math.random().toString(36).substr(2, 9)}`,
          ...npcData
        };
      } catch (error) {
        console.error('OpenAI API Error Details:', {
          message: error.message,
          response: error.response?.data,
          rawError: error
        });
        throw new Error(
          error.message === 'Failed to parse NPC data' 
            ? 'Failed to generate valid NPC data. Please try again.' 
            : error.message
        );
      }
    },
  
  
    async pluralize(word) {
      try {
        const response = await openai.chat.completions.create({
          model: AI_MODELS.default,
          messages: [
            AI_PROMPTS.pluralizer,
            {
              role: "user",
              content: word
            }
          ],
          temperature: AI_CONFIG.temperature.precise,
          max_tokens: AI_CONFIG.maxTokens.short
        });

        return response.choices[0].message.content.trim();
      } catch (error) {
        console.error('OpenAI Pluralization Error:', error);
        // Fallback to basic pluralization rules
        if (word.endsWith('s')) return word;
        if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
        return word + 's';
      }
    },
  
    async enhanceDescription(description) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.descriptionEnhancer,
            {
              role: "user",
              content: description
            }
          ],
          temperature: 0.7,
          max_tokens: 250,
          presence_penalty: 0.2,
          frequency_penalty: 0.3
        });

        return response.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API Error:', error);
        return error.message;
      }
    },
  
    async generateGameStart(gameData) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.gameStart,
            {
              role: "user",
              content: JSON.stringify({
                worldDescription: gameData.world.description,
                hierarchy: gameData.world.hierarchy,
                playerInventory: gameData.player.inventory
              })
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
          presence_penalty: 0.3,
          frequency_penalty: 0.3
        });

        return response.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API Error:', error);
        
        return error.message;
      }
    },
  
    async handleGameAction(gameData, userMessage, messageHistory) {
      try {
        // First, get the game master's response
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.gameMaster,
            ...messageHistory.slice(-5).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: "user",
              content: JSON.stringify({
                worldData: gameData,
                playerAction: userMessage,
                previousMessages: messageHistory.slice(-10),
                currentTime: new Date().getHours() // Add time context
              })
            }
          ],
          temperature: 0.8,
          max_tokens: 250
        });

        const aiResponse = response.choices[0].message.content;
        // Then check for inventory changes based on the AI's response
        const inventoryChanges = await this.inventoryAssistant(gameData, userMessage, aiResponse);
        
        return {
          content: aiResponse,
          inventoryChanges: inventoryChanges.changes || []
        };
      } catch (error) {
        console.error('OpenAI API Error:', error);

        return {
          content: error.message,
          inventoryChanges: []
        };
      }
    },
  
    async inventoryAssistant(gameData, userMessage, aiResponse) {
      try {
        console.log('Inventory Assistant Input:', {
          inventory: gameData.inventory,
          playerAction: userMessage,
          gameResponse: aiResponse
        });

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.inventoryAssistant,
            {
              role: "user",
              content: JSON.stringify({
                inventory: gameData.inventory,
                playerAction: userMessage,
                gameResponse: aiResponse
              })
            }
          ],
          temperature: 0.3,
          max_tokens: 150,
          response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);
        console.log('Inventory Changes Detected:', result);
        return result;
      } catch (error) {
        console.error('Inventory Assistant Error:', error);
        return {
          valid: true,
          changes: [],
          message: null
        };
      }
    }
  };

  export default gameAI;