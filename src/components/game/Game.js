import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

export const Game = () => {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Retrieve game data from localStorage
    const savedGameData = localStorage.getItem('gameEngineData');
    console.log('savedGameData', savedGameData);
    if (savedGameData) {
      try {
        const parsedData = JSON.parse(savedGameData);
        setGameData(parsedData);
        // Add initial welcome message
        setMessages([{
          type: 'system',
          content: `Welcome to ${parsedData.world.description}\n\nWhat would you like to do?`
        }]);
      } catch (error) {
        console.error('Failed to parse game data:', error);
      }
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    // TODO: Implement AI response logic
    // For now, we'll just echo back a simple response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `You tried to: ${userMessage}\n\nThis is a placeholder response. The AI game master will be implemented soon.`
      }]);
      setLoading(false);
    }, 1000);
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
          <div className="text-sm text-gray-500">
            Inventory: {gameData.inventory?.length || 0} items
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 h-[600px] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">
                  {message.content}
                </pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-500 text-sm">
              Game Master is thinking...
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