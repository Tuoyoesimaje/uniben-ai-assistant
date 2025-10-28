import { useState, useRef } from 'react';

export default function MessageInput({ onSendMessage, disabled, placeholder }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3 w-full">
      {/* File Attachment Button */}
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        disabled={disabled}
      >
        <span className="material-symbols-outlined text-2xl text-slate-500">
          attach_file
        </span>
      </button>

      {/* Message Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-slate-50 border-none focus:ring-0 rounded-xl py-3 px-4 placeholder:text-slate-500 max-h-40 text-slate-800"
          style={{ minHeight: '44px' }}
        />
      </div>

      {/* Send Button */}
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <span className="material-symbols-outlined text-2xl">
          arrow_upward
        </span>
      </button>
    </form>
  );
}