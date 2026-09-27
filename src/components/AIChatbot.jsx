import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  X,
  Minus,
  Send,
  Sparkles,
  RotateCcw,
  Calendar,
  UserCheck,
  ClipboardList,
  Siren,
  Droplet,
  Building,
  ChevronDown,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const INITIAL_GREETING = {
  id: 'init-1',
  role: 'assistant',
  content: `👋 Hello! I'm ClinicCare AI Assistant.\nI can help you with appointments, doctors, clinic services, ambulance requests, blood requirements and navigating ClinicCare.`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedActions: [
    { label: '📅 Book Appointment', query: 'How can I book an appointment?' },
    { label: '👨‍⚕️ Find Doctor', query: 'Which doctors are available?' },
    { label: '📋 My Appointments', query: 'I want to see my appointments' },
    { label: '🚑 Ambulance', query: 'How can I request an ambulance?' },
    { label: '🩸 Blood Requirement', query: 'I need blood' },
    { label: '🏥 Clinic Services', query: 'What clinic services and timings are available?' }
  ]
};

const QUICK_ACTIONS = [
  { label: '📅 Book Appointment', query: 'How can I book an appointment?', path: '/book-appointment' },
  { label: '👨‍⚕️ Find Doctor', query: 'Which doctors are available?', path: '/facilities' },
  { label: '📋 My Appointments', query: 'I want to see my appointments', path: '/appointments' },
  { label: '🚑 Ambulance', query: 'How can I request an ambulance?', path: '/ambulance' },
  { label: '🩸 Blood Requirement', query: 'I need blood', path: '/blood-search' },
  { label: '🏥 Clinic Services', query: 'What clinic services are available?', path: '/facilities' }
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Format payload for backend AI service
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const data = await api.post('/ai/chat', { messages: payloadMessages });

      if (data.success && data.message) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message.content || 'I am here to assist with your ClinicCare inquiries.',
          suggestedActions: data.message.suggestedActions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Service returned an invalid response');
      }
    } catch (err) {
      console.warn('AI Chat Error:', err);
      const fallbackMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, ClinicCare AI is temporarily unavailable. You can still use the ClinicCare services from the dashboard.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '📊 Patient Dashboard', path: '/dashboard' },
          { label: '📅 Book Appointment', path: '/book-appointment' }
        ]
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.query) {
      handleSendMessage(action.query);
    } else if (action.path) {
      navigate(action.path);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
    setInput('');
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Helper to format text with clickable links or bold styling
  const renderFormattedContent = (content) => {
    const parts = content.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*|\n)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      // Handle Markdown Links: [Text](/path)
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, linkText, linkUrl] = linkMatch;
        return (
          <button
            key={index}
            onClick={() => handleNavigate(linkUrl)}
            className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-800 underline cursor-pointer mx-1"
          >
            {linkText}
            <ArrowRight className="w-3 h-3 inline" />
          </button>
        );
      }

      // Handle Bold text: **bold**
      const boldMatch = part.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        return <strong key={index} className="font-semibold text-gray-900">{boldMatch[1]}</strong>;
      }

      // Handle newlines
      if (part === '\n') {
        return <br key={index} />;
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="cliniccare-ai-toggle"
          aria-label="Open ClinicCare AI Assistant"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (isOpen && isMinimized) {
              setIsMinimized(false);
            } else {
              setIsOpen(!isOpen);
              setIsMinimized(false);
            }
          }}
          className="relative flex items-center gap-3 bg-linear-to-r from-primary-600 via-primary-500 to-teal-500 text-white p-4 rounded-full shadow-xl shadow-primary-600/30 hover:shadow-primary-600/50 transition-all cursor-pointer group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-white"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-semibold text-sm pr-1">
            ClinicCare AI
          </span>
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[430px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? 'h-auto max-h-[70px]' : 'h-[80vh] sm:h-[590px] max-h-[640px]'
            }`}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-gray-900 via-gray-800 to-primary-900 text-white p-4 px-5 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary-500 to-teal-400 flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base tracking-tight leading-none text-white">
                      ClinicCare AI
                    </h3>
                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 font-medium mt-1">
                    Your Healthcare Assistant
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear Chat"
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  {isMinimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minus className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body (hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-br-xs'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-xs shadow-sm'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ClinicCare AI</span>
                          </div>
                        )}
                        <div className="whitespace-pre-line text-sm">
                          {renderFormattedContent(msg.content)}
                        </div>
                      </div>

                      <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>

                      {/* Suggested Action Pills (if any) */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                          {msg.suggestedActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (action.query) {
                                  handleSendMessage(action.query);
                                } else if (action.path) {
                                  handleNavigate(action.path);
                                }
                              }}
                              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white hover:bg-primary-50 text-primary-700 border border-primary-200 hover:border-primary-300 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>{action.label}</span>
                              {action.path && <ExternalLink className="w-3 h-3 opacity-60" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start">
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-xs p-3 px-4 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"></span>
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions Scroll Bar */}
                <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action)}
                      className="whitespace-nowrap text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-gray-200 hover:border-primary-200 transition-all shrink-0 cursor-pointer"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about appointments, doctors, ambulance..."
                      disabled={isTyping}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Safety Disclaimer Banner */}
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Informational AI guide • Does not replace physician diagnosis • Emergency: call 911
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
