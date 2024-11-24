# World Builder & Interactive Game Engine

A React-based application that combines creative world-building with an interactive text adventure game. This project allows users to create detailed fantasy worlds and then explore them through an AI-powered game interface.

## Features

### World Building
- Create detailed fantasy world descriptions
- Build hierarchical world structures (e.g., kingdoms, provinces, cities)
- Generate AI-enhanced descriptions and names
- Create and manage NPCs (Non-Player Characters)
- Define locations and their relationships
- Customize player inventory systems

### Interactive Game
- Text-based adventure gameplay
- Dynamic inventory management
- AI-powered game master responses
- Contextual world interactions
- Real-time game state management
- Persistent game progress

### Technical Features
- Built with React and React Router
- Tailwind CSS for styling
- OpenAI integration for AI-powered content
- Local storage for game state persistence
- Responsive design
- Component-based architecture

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```
3. Create a `.env` file and add your OpenAI API key:

```bash
REACT_APP_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


## Project Structure

- `/src/components/game` - Game engine components
- `/src/components/world-builder` - World building interface
- `/src/utils` - Utility functions and AI integration
- `/src/hooks` - Custom React hooks
- `/src/config` - Configuration files for AI and game settings

