import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import useSidebarToggle, { TOP_NAV_HEIGHT } from '../../hooks/useSidebarToggle';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topNews, setTopNews] = useState([]);
  // sidebar control (desktop open by default, mobile closed)
  const { isOpen, isMobile, toggle } = useSidebarToggle();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Load conversations and news on mount
  useEffect(() => {
    loadConversations();
    loadTopNews();
  }, [user]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // (sidebar responsiveness handled inside useSidebarToggle)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/chat/conversations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadTopNews = async () => {
    if (!user) return;

    try {
      const response = await axios.get('/api/news', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Get top 3 high-priority news items
        const highPriorityNews = response.data.news
          .filter(item => item.priority === 'high')
          .slice(0, 3);

        setTopNews(highPriorityNews);
      }
    } catch (error) {
      console.error('Failed to load top news:', error);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(`/api/chat/conversation/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setCurrentConversation(response.data.conversation);
        setMessages(response.data.conversation.messages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setIsLoading(true);

    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/chat/message', {
        message,
        conversationId: currentConversation?.id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Add AI response
        const aiMessage = {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString(),
          hasLocation: response.data.hasLocation,
          functionCalls: response.data.functionCalls
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update current conversation or create new one
        if (response.data.conversationId) {
          setCurrentConversation({ id: response.data.conversationId });
          loadConversations(); // Refresh conversations list
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-emerald-50 to-teal-100 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex relative overflow-hidden" style={{ height: `calc(100vh - ${TOP_NAV_HEIGHT}px)` }}>
        {/* Mobile Backdrop - shows only on mobile when sidebar is open */}
        {isMobile && isOpen && (
          <div
            onClick={toggle}
            className="fixed inset-0 bg-black/40 z-40"
            style={{ top: `${TOP_NAV_HEIGHT}px` }}
          />
        )}

        {/* Sidebar - Chat history */}
        <aside
          className={`
            ${isMobile ? 'fixed' : 'relative flex-shrink-0'}
            h-full bg-white border-r z-40 overflow-hidden
            transition-all duration-300 ease-in-out
          `}
          style={{
            top: isMobile ? `${TOP_NAV_HEIGHT}px` : undefined,
            width: isMobile ? (isOpen ? '80vw' : '0') : (isOpen ? '320px' : '0')
          }}
        >
          <ChatSidebar
            conversations={conversations}
            currentConversation={currentConversation}
            onConversationSelect={loadConversation}
            onNewConversation={startNewConversation}
            isOpen={isOpen}
            onToggle={toggle}
          />
        </aside>

        {/* Toggle Button */}
        <button
          onClick={toggle}
          className={`
            fixed bg-white rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-300 hover:shadow-xl
            ${isMobile ? 'w-10 left-4' : 'w-8'}
            ${isMobile ? '' : (isOpen ? 'left-[304px]' : 'left-2')}
          `}
          style={{
            top: isMobile ? `${TOP_NAV_HEIGHT + 16}px` : '50%',
            transform: isMobile ? 'none' : 'translateY(-50%)',
            zIndex: 45,
            width: isMobile ? 40 : 32,
            height: isMobile ? 40 : 32
          }}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl flex flex-col gap-6">
              {messages.length === 0 ? (
                // Welcome message when no messages - role-specific with news
                <div className="space-y-6">
                  {/* Welcome Message */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg">
                      🤖
                    </div>
                    <div className="flex flex-col gap-1 items-start">
                      <p className="text-base font-normal leading-relaxed message-bubble-ai px-4 py-3 bg-white text-slate-800">
                        {user?.role === 'guest' ? (
                          <>
                            👋 Welcome, Guest! I'm the UNIBEN AI Assistant. I can help you find buildings and navigate the campus. For full features like quizzes and personalized help, please log in as a student or staff member.
                          </>
                        ) : user?.role === 'student' ? (
                          <>
                            🎓 Hello, {user.name}! Welcome to UNIBEN AI Assistant. I can help you with course information, find buildings, get study resources, and even create quizzes to test your knowledge. What would you like to know?
                          </>
                        ) : user?.role === 'staff' ? (
                          <>
                            👨‍🏫 Welcome back, {user.name}! As a staff member, you have full access to all features. I can help you with department information, course details, building locations, and administrative tasks. How can I assist you today?
                          </>
                        ) : (
                          <>
                            Hello! I am the UNIBEN AI Assistant. How can I help you today? You can ask me about departments, courses, and much more.
                          </>
                        )}
                      </p>
                      <p className="text-xs font-normal text-slate-500 pl-1">Just now</p>
                    </div>
                  </div>

                  {/* Top News Section */}
                  {topNews.length > 0 && user?.role !== 'guest' && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                        📰
                      </div>
                      <div className="flex flex-col gap-3 items-start flex-1">
                        <div className="message-bubble-ai px-4 py-3 bg-white text-slate-800 max-w-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Newspaper className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-600">Latest University News</span>
                          </div>
                          <div className="space-y-2">
                            {topNews.map((news, index) => (
                              <div key={news.id} className="border-l-2 border-blue-200 pl-3">
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold text-sm">{index + 1}️⃣</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{news.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {news.content.length > 100
                                        ? `${news.content.substring(0, 100)}...`
                                        : news.content}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => window.location.href = '/news'}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View all news →
                            </button>
                          </div>
                        </div>
                        <p className="text-xs font-normal text-slate-500 pl-1">Just now</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <MessageList messages={messages} />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="px-4 md:px-6 lg:px-8 py-3 bg-white/50 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl flex items-end gap-3">
              <MessageInput
                onSendMessage={sendMessage}
                disabled={isLoading}
                placeholder={
                  user?.role === 'guest'
                    ? "Ask about buildings and campus navigation..."
                    : user?.role === 'student'
                    ? "Ask about courses, buildings, or create quizzes..."
                    : user?.role === 'staff'
                    ? "Ask about departments, courses, or administrative tasks..."
                    : "Type your message or ask about departments, courses, etc."
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}