import OpenAI from 'openai';
import { AI_PROMPTS } from '../config/aiPrompts';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const mockAI = {
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
          model: "gpt-4o-mini",
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
          temperature: 0.7,
          max_tokens: 100,
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
          model: "gpt-4o-mini",
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
          temperature: 0.8,
          max_tokens: 30,
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
          model: "gpt-4-turbo-preview",
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
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a fantasy character creator. You must respond with valid JSON only."
            },
            {
              role: "user",
              content: `Create a detailed NPC for ${entityName} (a ${entityType}) following this exact JSON structure:
{
  "name": "Unique fantasy name",
  "role": "Character's role or profession",
  "description": "Physical appearance and notable features",
  "personality": "Character traits and mannerisms",
  "background": "Brief history",
  "desires": "Hopes and ambitions",
  "fears": "Personal fears and worries",
  "goal": "Current primary motivation"
}

Requirements:
- Character should fit the world context: ${worldContext.world.description}
- Name must be unique (existing NPCs: ${existingNPCs.map(npc => npc.name).join(', ')})
- Keep each field concise (1-2 sentences)
- Ensure character fits the location's theme
- Return only the JSON object, no additional text`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
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
  
    // generateName() {
    //   const firstNames = ['Aldrich', 'Beatrice', 'Cedric', 'Diana', 'Edmund', 'Freya', 'Gareth', 'Helena'];
    //   const lastNames = ['Blackwood', 'Stormwind', 'Ironheart', 'Silverleaf', 'Dawnweaver', 'Nightshade'];
      
    //   return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    // },
  
    pluralize(word) {
      // Special cases dictionary
      const specialCases = {
        'empire': 'empires',
        'state': 'states',
        'city': 'cities',
        'country': 'countries',
        'territory': 'territories',
        'duchy': 'duchies',
        'colony': 'colonies',
        'municipality': 'municipalities',
        'principality': 'principalities'
      };

      // Return from special cases if it exists
      if (specialCases[word.toLowerCase()]) {
        return specialCases[word.toLowerCase()];
      }

      // General rules
      if (word.endsWith('s')) return word; // Already plural
      if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
      return word + 's';
    },
  
    async enhanceDescription(description) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a fantasy world description enhancer. 
              Take the provided world description and enhance it by adding 2-3 fantasy elements.
              Requirements:
              - Keep the original meaning and tone
              - Add mystical or magical elements naturally
              - Focus on world-building elements
              - Return only the enhanced description, no explanations
              - Keep similar length to original
              - Maintain second-person perspective if present`
            },
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
        
        // Fallback to template-based enhancement if API fails
        const enhancements = [
          'ancient magical forces',
          'mythical creatures',
          'legendary artifacts',
          'mysterious prophecies',
          'forgotten civilizations',
          'celestial phenomena'
        ];
        
        const selectedEnhancements = enhancements
          .sort(() => Math.random() - 0.5)
          .slice(0, 2 + Math.floor(Math.random() * 2));
        
        return `${description} This realm is marked by ${selectedEnhancements.join(' and ')}, which shape its destiny and influence its inhabitants.`;
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
        
        // Fallback to template-based response if API fails
        const templates = [
          `You find yourself in ${gameData.world.description}. As a newcomer to these lands, your arrival has been noted by the local inhabitants, who regard you with a mixture of curiosity and caution.`,
          `Standing at the threshold of ${gameData.world.description}, you feel the weight of destiny upon your shoulders. The air is thick with possibility as you survey the lands before you.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
      }
    },
  
    async handleGameAction(gameData, userMessage, messageHistory) {
      try {
        // First, get the game master's response
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            AI_PROMPTS.gameMaster,
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
        
        // Enhanced fallback responses
        const fallbackEndings = [
          `The Academy halls stretch before you - the bustling Great Hall echoes with activity to the north, while the serene Meditation Gardens beckon from the east. Through a window, you spot movement in the distant Astronomy Tower. What will you do?`,
          `As the magical timepiece strikes ${new Date().getHours()}, you notice Sage Evelyn organizing scrolls in the library, while Master Theron appears to be conducting an experiment in his workshop. What will you do?`,
          `A mysterious magical resonance emanates from deeper within the Academy, and whispers of unusual activity in the Underground Archives have caught your attention. What will you do?`
        ];
        
        return {
          content: `You attempt to ${userMessage}. ${fallbackEndings[Math.floor(Math.random() * fallbackEndings.length)]}`,
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
            {
              role: "system",
              content: `You are an inventory management assistant.
              Analyze the player action and game response to determine if any items should be added or removed.
              Look for explicit mentions of items being picked up, dropped, removed, or discarded.
              
              Return a JSON response in this exact format:
              {
                "changes": [
                  {
                    "item": "exact item name from inventory",
                    "quantity": number (-1 for removal, +1 for addition)
                  }
                ]
              }
              
              Example for removing a wand:
              {
                "changes": [
                  {
                    "item": "Novice Duelist Wand",
                    "quantity": -1
                  }
                ]
              }`
            },
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

  export default mockAI;