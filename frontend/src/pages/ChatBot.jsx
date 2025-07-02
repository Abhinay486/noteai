import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CHAT_HISTORY_KEY = userId => `chatbot_history_${userId || 'guest'}`;

const ChatBot = ({ userId, onNoteAdded }) => {
  // Load messages from localStorage if available
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined' && userId) {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY(userId));
      if (saved) return JSON.parse(saved);
    }
    return [{ sender: 'bot', text: 'Hi! What would you like to note down?' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]); // Store notes added via chatbot
  const chatEndRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(CHAT_HISTORY_KEY(userId), JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const userText = input.trim();
    setMessages(msgs => [...msgs, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/chat-bot`, {
        message: userText,
        userId: userId
      });
      // Store the new note in state if present
      if (res.data && res.data.note) {
        setNotes(prev => [...prev, res.data.note]);
        if (typeof onNoteAdded === 'function') onNoteAdded();
      }
      setMessages(msgs => [
        ...msgs,
        { sender: 'bot', text: '✅ Your note has been saved!' }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(msgs => [
        ...msgs,
        { sender: 'bot', text: '⚠️ Failed to save note. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '50%',
          width: 56,
          height: 56,
          fontSize: 24,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
      >
        📝
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 400,
      backgroundColor: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      height: 500,
      padding: 16,
      zIndex: 1000
    }}>
      <button
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: 'none',
          fontSize: 20,
          color: '#888',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
      <div style={{ flex: 1, overflowY: 'auto', marginTop: 24, marginBottom: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            margin: '4px 0'
          }}>
            <div style={{
              backgroundColor: msg.sender === 'user' ? '#2563eb' : '#f1f1f1',
              color: msg.sender === 'user' ? '#fff' : '#333',
              padding: '8px 12px',
              borderRadius: 12,
              maxWidth: '80%'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type your note..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px' }}
        >
          Send
        </button>
      </form>
      {/* Display notes added via chatbot */}
      {notes.length > 0 && (
        <div style={{ marginTop: 16, maxHeight: 120, overflowY: 'auto', borderTop: '1px solid #eee', paddingTop: 8 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Notes added:</div>
          {notes.map((note, idx) => (
            <div key={idx} style={{ marginBottom: 6, fontSize: 14 }}>
              <div style={{ fontWeight: 500 }}>{note.title}</div>
              <div style={{ color: '#555' }}>{note.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
