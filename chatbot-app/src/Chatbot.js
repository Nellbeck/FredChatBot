import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const predefinedQuestions = [
    "Who are you?",
    "What can you do?",
    "Tell me a joke!",
    "Where do you live?",
    "How can I contact you?"
  ];

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    const userMessage = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    console.log("API URL:", process.env.REACT_APP_API_URL);

    try {
      const apiUrl = "https://lively-bay-06b08411e.4.azurestaticapps.net/api/qna" || 'http://localhost:5000/api/qna';
      const response = await axios.post(`${apiUrl}`, { question: messageText });
      const botResponse = response.data.answer;
      typeOutMessage(botResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      typeOutMessage('Sorry, something went wrong.');
    }
  };

  // Function to display message letter by letter
  const typeOutMessage = (fullMessage) => {
    let currentText = "";
    let index = 0;

    const interval = setInterval(() => {
      if (index < fullMessage.length) {
        currentText += fullMessage[index];
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === 'bot') {
            newMessages[newMessages.length - 1].text = currentText;
          } else {
            newMessages.push({ sender: 'bot', text: currentText });
          }
          return newMessages;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Adjust speed of typing here
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage(input);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      {/* Pre-defined Questions */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {predefinedQuestions.map((question, index) => (
          <button 
            key={index} 
            onClick={() => sendMessage(question)}
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}
          >
            {question}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div 
        style={{
          border: '1px solid #ccc', 
          padding: '10px', 
          minHeight: '300px', 
          overflowY: 'auto',
          backgroundColor: '#f9f9f9'
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right' }}>
            <div style={{
              display: 'inline-block',
              background: msg.sender === 'bot' ? '#e0e0e0' : '#0084ff',
              color: msg.sender === 'bot' ? '#000' : '#fff',
              padding: '8px 12px',
              borderRadius: '10px',
              margin: '5px',
              maxWidth: '80%',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div style={{ marginTop: '10px', display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
          placeholder="Type your message here..."
        />
        <button onClick={() => sendMessage(input)} style={{ padding: '10px 20px', marginLeft: '5px', fontSize: '16px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;


