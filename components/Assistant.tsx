import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage, ScriptScene } from '../types';

interface AssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: ScriptScene[];
}

export const Assistant: React.FC<AssistantProps> = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you refine your script or suggest better visual prompts for your storyboard. What are you working on?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Modified handleSend that can take an optional text override
  const triggerSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsLoading(true);

    const contextSummary = contextData.length > 0 
      ? `User has a storyboard with ${contextData.length} scenes. 
         Scenes descriptions:
         ${contextData.map(s => `Scene ${s.scene_number}: ${s.description}`).join('\n')}` 
      : "User has not analyzed a script yet.";

    const history = messages.slice(1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await sendChatMessage(history, userMsg.text, contextSummary);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const suggestions = [
    "Suggest ways to improve the narrative flow and pacing.",
    "Suggest more dramatic camera angles for the scenes.",
    "How can I make the visual prompts more cinematic?",
    "Help me add more emotional depth to the characters."
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col no-print">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          AI Assistant
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl p-3 rounded-bl-none border border-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        
        {!isLoading && messages.length === 1 && contextData.length > 0 && (
          <div className="space-y-2 pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Suggested Actions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => triggerSend(s)}
                  className="text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && triggerSend()}
            placeholder="Ask for suggestions..."
            className="w-full bg-slate-800 text-white rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={() => triggerSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 rounded-full text-white disabled:opacity-50 hover:bg-indigo-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};