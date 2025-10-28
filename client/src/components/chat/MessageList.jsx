import MessageBubble from './MessageBubble';
import LocationCard from './LocationCard';
import ResourceCard from './ResourceCard';

export default function MessageList({ messages }) {
  return (
    <div className="flex flex-col gap-6">
      {messages.map((message, index) => (
        <div key={index} className="flex items-start gap-3">
          {/* AI Avatar */}
          {message.role === 'assistant' && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg">
              🤖
            </div>
          )}

          {/* User Avatar (only for user messages) */}
          {message.role === 'user' && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white font-bold text-sm ml-auto">
              {message.role === 'user' ? 'ME' : 'AI'}
            </div>
          )}

          {/* Message Content */}
          <div className={`flex flex-col gap-1 items-start ${message.role === 'user' ? 'ml-auto' : ''}`}>
            {/* Special content based on message type */}
            {message.hasLocation && (
              <LocationCard message={message} />
            )}

            {message.functionCalls?.some(call => call.name === 'recommendResources') && (
              <ResourceCard message={message} />
            )}

            {/* Regular message bubble */}
            {!message.hasLocation && !message.functionCalls?.some(call => call.name === 'recommendResources') && (
              <MessageBubble message={message} />
            )}

            {/* Timestamp */}
            <p className={`text-xs font-normal text-slate-500 ${message.role === 'user' ? 'pr-1' : 'pl-1'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}