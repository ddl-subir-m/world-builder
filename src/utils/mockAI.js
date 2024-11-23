const mockAI = {
    async suggestLevels(context) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const suggestions = {
        world: ['kingdoms', 'empires', 'realms', 'continents'],
        kingdoms: ['provinces', 'cities', 'strongholds', 'duchies'],
        empires: ['regions', 'states', 'territories', 'colonies'],
        provinces: ['towns', 'villages', 'outposts', 'settlements'],
        cities: ['districts', 'quarters', 'neighborhoods', 'wards'],
        default: ['locations', 'landmarks', 'settlements', 'points of interest']
      };
      
      const lastLevel = context.hierarchy[context.hierarchy.length - 1] || 'world';
      return suggestions[lastLevel] || suggestions.default;
    },
  
    async generateEntityDescription(level, entityName) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const templates = {
        kingdoms: [
          `A mighty kingdom known as ${entityName}, renowned for its powerful armies and ancient traditions.`,
          `The prosperous realm of ${entityName}, where trade and culture flourish in equal measure.`,
          `${entityName}, a mysterious kingdom shrouded in legends and magical phenomena.`
        ],
        provinces: [
          `${entityName}, a rich province famous for its abundant resources and skilled craftsmen.`,
          `The strategic province of ${entityName}, protecting vital trade routes and military positions.`,
          `A peaceful province called ${entityName}, known for its agricultural wealth and scenic beauty.`
        ],
        cities: [
          `${entityName}, a bustling metropolis where ancient architecture meets modern innovation.`,
          `The fortified city of ${entityName}, standing proud with its imposing walls and towers.`,
          `A cultural hub known as ${entityName}, where artists and scholars gather from across the realm.`
        ],
        default: [
          `${entityName}, a remarkable place with its own unique identity and customs.`,
          `The distinguished ${level} of ${entityName}, holding significant importance in the realm.`,
          `${entityName}, a notable ${level} with a rich history and vibrant present.`
        ]
      };
      
      const levelTemplates = templates[level] || templates.default;
      return levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
    },
  
    async generateInventory(worldDescription, entityDescriptions) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic categories of items
      const categories = {
        weapons: ['Rusty Sword', 'Hunter\'s Bow', 'Magic Staff', 'Dagger'],
        armor: ['Leather Armor', 'Traveler\'s Cloak', 'Sturdy Boots', 'Protective Amulet'],
        supplies: ['Healing Potion', 'Trail Rations', 'Torch', 'Rope'],
        tools: ['Lockpicks', 'Map', 'Compass', 'Writing Kit']
      };
      
      // Generate random items from categories, ensuring total is 5 or less
      const inventory = [];
      const allCategories = Object.entries(categories);
      
      // Shuffle categories
      const shuffledCategories = allCategories.sort(() => Math.random() - 0.5);
      
      // Take one item from each category until we have 5 items
      for (let i = 0; i < Math.min(5, shuffledCategories.length); i++) {
        const [category, items] = shuffledCategories[i];
        const randomItem = items[Math.floor(Math.random() * items.length)];
        
        inventory.push({
          id: `${category}-${Math.random().toString(36).substr(2, 9)}`,
          name: randomItem,
          category,
          description: `A useful ${category.slice(0, -1)} for your journey.`,
          quantity: Math.floor(Math.random() * 3) + 1
        });
      }
      
      return inventory;
    },
  
    async generateNPCs(entityType, entityName) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const roles = {
        kingdoms: ['King', 'Queen', 'Royal Advisor', 'Court Wizard', 'General', 'High Priest'],
        provinces: ['Governor', 'Sheriff', 'Local Hero', 'Merchant Leader', 'Militia Captain'],
        cities: ['Mayor', 'Guard Captain', 'Guild Master', 'Tavern Keeper', 'Court Mage'],
        default: ['Leader', 'Notable Resident', 'Mysterious Stranger', 'Local Champion']
      };

      const personalities = [
        'wise and diplomatic',
        'stern but fair',
        'charismatic and ambitious',
        'mysterious and calculating',
        'honorable and brave',
        'cunning and resourceful'
      ];

      const goals = [
        'maintain peace and prosperity',
        'expand their influence',
        'protect ancient secrets',
        'reform corrupt institutions',
        'preserve traditional ways',
        'seek powerful artifacts'
      ];

      const availableRoles = roles[entityType] || roles.default;
      const role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
      const personality = personalities[Math.floor(Math.random() * personalities.length)];
      const goal = goals[Math.floor(Math.random() * goals.length)];

      return {
        id: `npc-${Math.random().toString(36).substr(2, 9)}`,
        name: `${this.generateName()}`,
        role: role,
        description: `A ${personality} ${role.toLowerCase()} of ${entityName} who seeks to ${goal}.`,
        personality,
        goal
      };
    },
  
    generateName() {
      const firstNames = ['Aldrich', 'Beatrice', 'Cedric', 'Diana', 'Edmund', 'Freya', 'Gareth', 'Helena'];
      const lastNames = ['Blackwood', 'Stormwind', 'Ironheart', 'Silverleaf', 'Dawnweaver', 'Nightshade'];
      
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }
  };

  export default mockAI;