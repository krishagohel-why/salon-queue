import React, { useState } from 'react';
import { getBarberAvatar } from '../data/avatars';

interface BarberAvatarProps {
  barberId: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  isOnDuty?: boolean;
  isOnBreak?: boolean;
  isBusy?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg',
  '2xl': 'w-24 h-24 text-xl',
};

export const BarberAvatar: React.FC<BarberAvatarProps> = ({
  barberId,
  name,
  size = 'md',
  showStatus = false,
  isOnDuty = true,
  isOnBreak = false,
  isBusy = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarSrc = getBarberAvatar(barberId);
  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-2xl overflow-hidden bg-maroon-900 border-2 border-beige-300/60 shadow-lg shadow-maroon-950/80 flex items-center justify-center transition-transform hover:scale-105`}
      >
        {!imageError ? (
          <img
            src={avatarSrc}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-maroon-800 to-maroon-950 flex items-center justify-center font-extrabold text-beige-300">
            {initials}
          </div>
        )}
      </div>

      {/* Real-time status dot indicator */}
      {showStatus && (
        <span
          className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-maroon-950 shadow-sm ${
            !isOnDuty
              ? 'bg-gray-500'
              : isOnBreak
              ? 'bg-amber-400 text-maroon-950'
              : isBusy
              ? 'bg-rose-500'
              : 'bg-emerald-400'
          }`}
          title={
            !isOnDuty
              ? 'Off Duty'
              : isOnBreak
              ? 'On Break'
              : isBusy
              ? 'Busy with Client'
              : 'Available'
          }
        >
          {isOnBreak && <span className="w-1.5 h-1.5 rounded-full bg-maroon-950" />}
          {isBusy && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
        </span>
      )}
    </div>
  );
};
