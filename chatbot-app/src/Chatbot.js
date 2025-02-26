import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import external CSS

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const predefinedQuestions = [
    "Who are you?",
    "What can you do?",
    "Tell me a joke!",
    "Where do you live?",
    "How can I contact you?",
  ];

  useEffect(() => {
    // ✅ Type out the welcome message instead of showing it instantly
    typeOutMessage("Hello and welcome! I'm Fredriks alter ego. Feel free to ask anything and I'll try to answer.");
  }, []);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7071/api/qna";
      console.log("Sending request to:", API_URL);

      const response = await axios.post(API_URL, { question: messageText });

      console.log("Full API Response:", response);
      console.log("Response Data:", response.data);

      let botResponse = "Sorry, I didn't understand that.";

      if (typeof response.data === "string") {
        botResponse = response.data;
      } else if (response.data?.answers?.length > 0) {
        botResponse = response.data.answers[0].answer;
      } else {
        console.warn("No valid answer found in response.");
      }

      console.log("Final Bot Response:", botResponse);
      typeOutMessage(botResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      typeOutMessage("Sorry, something went wrong.");
    }
  };

  const typeOutMessage = (fullMessage) => {
    let currentText = "";
    let index = 0;

    const interval = setInterval(() => {
      if (index < fullMessage.length) {
        currentText += fullMessage[index];
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].sender === "bot") {
            newMessages[newMessages.length - 1].text = currentText;
          } else {
            newMessages.push({ sender: "bot", text: currentText });
          }
          return newMessages;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage(input);
  };

  return (
    <div className="chatbot-container">
      <div className="predefined-questions">
        {predefinedQuestions.map((question, index) => (
          <button key={index} onClick={() => sendMessage(question)} className="question-button">
            {question}
          </button>
        ))}
      </div>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender}`}>
            <div className={`message ${msg.sender}`}>{msg.text}</div>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
        />
        <button onClick={() => sendMessage(input)}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
