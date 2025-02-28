import './App.css';
import React from 'react';
import Chatbot from './Chatbot';

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center' }}>Fredriks Chatbot</h1>
      <p>*This bot is still young so the answer can vary.*</p>
      <Chatbot />
    </div>
  );
}

export default App;
