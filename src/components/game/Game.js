import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader, Package } from 'lucide-react';
import mockAI from '../../utils/gameAI';

export const Game = () => {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [itemTemplates, setItemTemplates] = useState({});

  useEffect(() => {
    const initializeGame = async () => {
      const savedGameData = localStorage.getItem('gameEngineData');

      if (savedGameData) {
        try {
          const parsedData = JSON.parse(savedGameData);
          setGameData({
            ...parsedData,
            inventory: parsedData.player.inventory
          });
          
          // Get AI-generated welcome message
          const welcomeMessage = await mockAI.generateGameStart(parsedData);
          setMessages([{
            type: 'system',
            content: welcomeMessage
          }]);
        } catch (error) {
          console.error('Failed to initialize game:', error);
          setMessages([{
            type: 'system',
            content: `Welcome to the game. Something went wrong loading your world data.`
          }]);
        }
      }
    };

    initializeGame();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      console.log('Sending to AI:', {
        gameData,
        userMessage,
        messageHistory: messages
      });

      const response = await mockAI.handleGameAction(
        gameData,
        userMessage,
        messages
      );
      
      console.log('AI Response:', response);

      // Update inventory based on changes
      if (response.inventoryChanges && response.inventoryChanges.length > 0) {
        const updatedInventory = [...gameData.inventory];
        
        response.inventoryChanges.forEach(change => {
          const existingItem = updatedInventory.find(item => item.name === change.item);
          
          if (existingItem) {
            existingItem.quantity += change.quantity;
            if (existingItem.quantity <= 0) {
              // Store template before removing
              setItemTemplates(prev => ({
                ...prev,
                [existingItem.name]: {
                  name: existingItem.name,
                  category: existingItem.category,
                  description: existingItem.description
                }
              }));
              // Remove item if quantity reaches 0
              const index = updatedInventory.indexOf(existingItem);
              updatedInventory.splice(index, 1);
            }
          } else if (change.quantity > 0) {
            // Check if we have a template for this item
            const template = itemTemplates[change.item];
            if (template) {
              // Use existing template
              updatedInventory.push({
                ...template,
                quantity: change.quantity,
                id: `${template.category}-${Math.random().toString(36).substr(2, 9)}`
              });
            } else {
              // Create new item
              updatedInventory.push({
                id: `misc-${Math.random().toString(36).substr(2, 9)}`,
                name: change.item,
                quantity: change.quantity,
                category: 'misc',
                description: `A ${change.item}`
              });
            }
          }
        });

        setGameData(prev => ({
          ...prev,
          inventory: updatedInventory
        }));
      }

      setMessages(prev => [...prev, {
        type: 'system',
        content: response.content || response
      }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'Something went wrong. Please try again.'
      }]);
    }
    
    setLoading(false);
  };

  const handleReturn = () => {
    if (window.confirm('Are you sure you want to exit? Your game progress will be lost.')) {
      localStorage.removeItem('gameEngineData');
      navigate('/');
    }
  };

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No game data found</h1>
          <button
            onClick={() => navigate('/')}
            className="button-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to World Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handleReturn}
            className="button-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Exit Game
          </button>
          <button
            onClick={() => setShowInventory(!showInventory)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <Package size={16} />
            Inventory ({gameData.inventory?.length || 0})
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {showInventory && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="font-medium mb-3">Inventory</h3>
            {gameData.inventory?.length > 0 ? (
              <div className="grid gap-3">
                {gameData.inventory.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-start border-b pb-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.category}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-2">No items in inventory</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 h-[600px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.type === 'user' 
                  ? 'text-right' 
                  : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="animate-spin" size={14} />
                  <span className="text-sm">Game Master is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to do?"
            className="flex-1 input-field"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`button-primary px-4 flex items-center justify-center ${
              loading || !input.trim()
                ? 'bg-gray-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Send size={16} />
          </button>
        </form>
      </main>
    </div>
  );
}; 