import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import "./App.css"; // Import external CSS

function Chatbot() {
  const allPredefinedQuestions = useMemo(
    () => [
      "Who are you?",
      "What can you do?",
      "Tell me a joke!",
      "Where do you live?",
      "How can I contact you?",
      "What's your favorite color?",
      "What's the weather like?",
      "Can you give me advice?",
      "Tell me a fun fact!",
      "Do you like pizza?"
    ],
    []
  );

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [, setAskedQuestions] = useState([]);
  const [badges, setBadges] = useState([]);

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getRandomQuestions = useCallback(
    (excludedQuestions) => {
      const availableQuestions = allPredefinedQuestions.filter(
        (q) => !excludedQuestions.includes(q)
      );
      const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    },
    [allPredefinedQuestions]
  );

  useEffect(() => {
    setPredefinedQuestions(getRandomQuestions([]));
  }, [getRandomQuestions]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    setInput("");
    setAskedQuestions((prev) => {
      const newAsked = [...prev, messageText];
      setPredefinedQuestions(getRandomQuestions(newAsked));
      checkAchievements(newAsked.length);
      return newAsked;
    });

    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7071/api/qna";
      const response = await axios.post(API_URL, { question: messageText });

      let botResponse = "Sorry, I didn't understand that.";
      if (typeof response.data === "string") {
        botResponse = response.data;
      } else if (response.data?.answers?.length > 0) {
        botResponse = response.data.answers[0].answer;
      }

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

  const checkAchievements = (questionCount) => {
    const newBadges = [];
    if (questionCount >= 1 && !badges.includes("First Question!")) newBadges.push("First Question!");
    if (questionCount >= 5 && !badges.includes("Five Questions!")) newBadges.push("Five Questions!");
    if (questionCount >= 10 && !badges.includes("Ten Questions!")) newBadges.push("Ten Questions!");
    if (newBadges.length > 0) setBadges([...badges, ...newBadges]);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-content">
        <div className="predefined-questions">
          {predefinedQuestions.map((question, index) => (
            <button key={index} onClick={() => sendMessage(question)} className="question-button">
              {question}
            </button>
          ))}
        </div>

        <div className="chat-window">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-container ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Invisible div to scroll to */}
          </div>
        </div>

        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type your message here..."
          />
          <button onClick={() => sendMessage(input)}>Send</button>
        </div>
      </div>
      
      <div className="achievement-tracker">
        <h3>Achievements</h3>
        {badges.length === 0 ? <p>No achievements yet.</p> :
          badges.map((badge, index) => <div key={index} className="badge">🏆 {badge}</div>)
        }
      </div>
    </div>
  );
}

export default Chatbot;
