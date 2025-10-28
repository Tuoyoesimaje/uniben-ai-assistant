import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ChatSidebar({
  conversations,
  currentConversation,
  onConversationSelect,
  onNewConversation,
  isOpen,
  onToggle
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group conversations by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todayConversations = filteredConversations.filter(conv =>
    new Date(conv.lastActivity).toDateString() === today
  );

  const yesterdayConversations = filteredConversations.filter(conv =>
    new Date(conv.lastActivity).toDateString() === yesterday
  );

  const olderConversations = filteredConversations.filter(conv =>
    new Date(conv.lastActivity).toDateString() !== today &&
    new Date(conv.lastActivity).toDateString() !== yesterday
  );

  // Custom SVG Logo Component
  const LogoIcon = () => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <g clipPath="url(#clip0_6_535)">
        <path
          clipRule="evenodd"
          d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
          fill="#10B981"
          fillRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_6_535">
          <rect fill="white" height="48" width="48" />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <div className="h-full w-full flex flex-col bg-white p-4 shadow-lg">
      {/* Top Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <LogoIcon />
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-base font-bold leading-normal">UNIBEN AI</h1>
            <p className="text-slate-500 text-sm font-normal leading-normal">Assistant</p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewConversation}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-emerald-600 transition-colors"
        >
          <span className="truncate">New Chat +</span>
        </button>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      {/* Conversations - scrollable area */}
      <div className="flex-1 overflow-y-auto mt-3">
        <div className="flex flex-col gap-1">
          {/* Today's Conversations */}
          {todayConversations.length > 0 && (
            <>
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today
              </p>
              {todayConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onConversationSelect(conv.id)}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-slate-500">
                    chat_bubble
                  </span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <p className="text-sm font-medium leading-normal truncate w-full text-left">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate w-full text-left">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Yesterday's Conversations */}
          {yesterdayConversations.length > 0 && (
            <>
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
                Yesterday
              </p>
              {yesterdayConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onConversationSelect(conv.id)}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-slate-500">
                    chat_bubble
                  </span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <p className="text-sm font-medium leading-normal truncate w-full text-left">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate w-full text-left">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Older Conversations */}
          {olderConversations.length > 0 && (
            <>
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
                Earlier
              </p>
              {olderConversations.slice(0, 5).map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onConversationSelect(conv.id)}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    currentConversation?.id === conv.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base text-slate-500">
                    chat_bubble
                  </span>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <p className="text-sm font-medium leading-normal truncate w-full text-left">
                      {conv.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate w-full text-left">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col gap-1 border-t border-slate-200 pt-4">
        <button className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-lg text-slate-600">settings</span>
          <p className="text-sm font-medium leading-normal text-slate-700">Settings</p>
        </button>

        <button className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors">
          <span className="material-symbols-outlined text-lg text-slate-600">help</span>
          <p className="text-sm font-medium leading-normal text-slate-700">Get Help</p>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-lg text-slate-600">logout</span>
          <p className="text-sm font-medium leading-normal text-slate-700">Log Out</p>
        </button>
      </div>
    </div>
  );
}