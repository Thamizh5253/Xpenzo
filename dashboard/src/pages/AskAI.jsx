import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BASE_URL from '../config';
import {useAuth}  from '../context/AuthContext'; // Adjust the path as needed

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const { accessToken } = useAuth(); // Use the access token from context
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      // const token = localStorage.getItem('accessToken');

      
      try {
        const res = await axios.get(
          `${BASE_URL}/askai/history/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (res.data && res.data.length > 0) {
          const historyMessages = res.data.flatMap(item => ([
            {
              sender: 'user',
              text: item.question,
              orm: item.generated_orm_query || '',
              timestamp: new Date(item.created_at)
            },
            {
              sender: 'bot',
              text: item.user_response || 'No response from AI.',
              timestamp: new Date(item.created_at)
            }
          ]));
          
          setMessages(historyMessages);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    
    fetchChatHistory();
  }, []);

  const handleSend = async () => {
    if (!question.trim()) return;
  
    const userMessage = { 
      sender: 'user', 
      text: question,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);
  
    // const token = localStorage.getItem('accessToken');
  
    try {
      const res = await axios.post(
        `${BASE_URL}/askai/`,
        { question },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      const aiMessage = {
        sender: 'bot',
        text: res.data.user_response || 'No response from AI.',
        timestamp: new Date()
      };
  
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      let errorMessage = 'Something went wrong!';
      if (err.response && err.response.data?.error) {
        errorMessage = `${err.response.data.error}\n\n${err.response.data.llm_response || ''}`;
      }
  
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errorMessage, timestamp: new Date() },
      ]);
    }
  
    setLoading(false);
  };

  // Format date for display
  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (historyLoading) {
    return (
      <div className="w-full h-full bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-white text-gray-800 text-lg font-semibold rounded-t-lg">
          AskAI Chat
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <div className="text-gray-500 text-sm">Loading chat history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white text-gray-800 text-lg font-semibold rounded-t-lg">
        AskAI Chat
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p className="text-sm">Ask your first question to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              // Show date divider if this is the first message of the day
              const showDateDivider = idx === 0 || 
                new Date(messages[idx-1].timestamp).toDateString() !== msg.timestamp.toDateString();
              
              return (
                <React.Fragment key={idx}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-2">
                      <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-lg text-sm text-gray-800 max-w-[85%] rounded-bl-none border border-gray-200">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-2">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-sm"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className={`p-2 rounded-lg ${question.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-gray-400 bg-gray-200'} transition`}
            disabled={loading || !question.trim()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const TypingDots = () => {
  return (
    <div className="flex space-x-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
    </div>
  );
};

export default ChatBox;