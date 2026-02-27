import { Star } from 'lucide-react';

export function SelectButton({ eventId, isSelected, onToggle, size = 'md', variant = 'default' }) {
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const colorClasses = variant === 'light'
    ? isSelected
      ? 'text-yellow-300 hover:text-yellow-100'
      : 'text-white/70 hover:text-white'
    : isSelected
      ? 'text-yellow-500 hover:text-yellow-600'
      : 'text-gray-400 hover:text-gray-600';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle(eventId);
      }}
      className={`transition-all hover:scale-110 ${sizeClasses} ${colorClasses} flex-shrink-0`}
      title={isSelected ? 'Remove from My Schedule' : 'Add to My Schedule'}
      aria-label={isSelected ? 'Remove from My Schedule' : 'Add to My Schedule'}
    >
      <Star fill={isSelected ? 'currentColor' : 'none'} strokeWidth={2} />
    </button>
  );
}
