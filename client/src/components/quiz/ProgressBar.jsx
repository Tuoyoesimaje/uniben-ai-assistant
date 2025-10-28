export default function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < current ? 'bg-primary-500' : 'bg-neutral-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-neutral-600 ml-2">
        Question {current} of {total}
      </span>
    </div>
  );
}