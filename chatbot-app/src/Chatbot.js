import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import "./App.css"; // Import external CSS

function Chatbot() {
  const allPredefinedQuestions = useMemo(
    () => [
      "Who are you?",
      "What can you do?",
      "Do you know a joke?",
      "Where do you live?",
      "How can I contact you?",
      "What is your favorite book?",
      "Have you worked on any cool projects?",
      "What are your hobbies?",
      "Do you know any fun fact?",
      "How would you describe yourself?",
      "How does your CV look like?"
    ],
    []
  );

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello and welcome! I'm Fredriks alter ego. Ask me anything and I'll do my best to answer." }
  ]);

  useEffect(() => {
    typeOutMessage("Hello and welcome! I'm Fredrik's alter ego. Ask me anything and I'll do my best to answer.");
  }, []);

  const [input, setInput] = useState("");
  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [, setAskedQuestions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Track if the bot is responding

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // See if this will make the first request faster.
  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "ping" }) // Dummy request
    }).catch(() => {}); // Ignore errors, just warming up the API
  }, []);

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
    if (!messageText.trim() || isTyping) return;
  
    setIsTyping(true); // Disable input until bot finishes responding
    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    setInput("");

    // Check if message contains "?" to count it as a question
    if (messageText.includes("?")) {
      document.querySelectorAll(".question-button").forEach((btn) => {
        if (btn.innerText === messageText) {
          btn.classList.add("fade-out"); // Apply fade-out effect
        }
      });
  
      setTimeout(() => {
        setAskedQuestions((prev) => {
          const newAsked = [...prev, messageText];
  
          // Clear animation classes before updating questions
          document.querySelectorAll(".question-button").forEach((btn) => {
            btn.classList.remove("fade-out", "fade-in");
          });
  
          // Update predefined questions after fade-out completes
          setPredefinedQuestions(getRandomQuestions(newAsked));
  
          checkAchievements(newAsked.length);
          return newAsked;
        });
  
        // Delay to ensure new elements are rendered before adding fade-in effect
        setTimeout(() => {
          document.querySelectorAll(".question-button").forEach((btn) => {
            btn.classList.add("fade-in");
          });
        }, 10); // Tiny delay to ensure new buttons exist before adding class
      }, 500); // Wait 0.5s for fade-out effect
    }
  
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await axios.post(API_URL, { question: messageText });
  
      let botResponse = "Sorry, I didn't understand that.";
      if (typeof response.data === "string") {
        botResponse = response.data;
      } else if (response.data?.answers?.length > 0) {
        botResponse = response.data.answers[0].answer;
      }
  
      await typeOutMessage(botResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      await typeOutMessage("Sorry, something went wrong.");
    }
  
    setIsTyping(false); // Re-enable input after bot response

    // Focus back to input field
    setTimeout(() => inputRef.current?.focus(), 10);
  };
  
  const typeOutMessage = (fullMessage) => {
    return new Promise((resolve) => {
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
          resolve(); // Resolve when typing is complete
        }
      }, 25);
    });
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
            <button key={index} onClick={() => sendMessage(question)} className="question-button" disabled={isTyping}>
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
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type your message here..."
            disabled={isTyping} // Disable input while typing
          />
          <button onClick={() => sendMessage(input)} disabled={isTyping}>
            {isTyping ? "Typing..." : "Send"}
          </button>
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

