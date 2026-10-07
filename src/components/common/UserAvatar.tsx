import React, { useState } from 'react';

interface UserAvatarProps {
  email?: string;
  name?: string;
  photoUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Production UserAvatar component
 * Rules:
 * - If Google OAuth provides a real profile photo, render that photo.
 * - Otherwise: extract the first letter of the email username (e.g. chandu@gmail.com -> C, rahul@gmail.com -> R).
 * - Displays initial inside a clean, professional avatar with crisp contrast.
 * - Used consistently across Navbar, Dashboard, Profile, Interviews, and Reports.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  email,
  name,
  photoUrl,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute clean initial: first letter of email username or name
  let initial = 'U';
  if (email && email.trim()) {
    const username = email.trim().split('@')[0];
    if (username.length > 0) {
      initial = username.charAt(0).toUpperCase();
    }
  } else if (name && name.trim()) {
    initial = name.trim().charAt(0).toUpperCase();
  }

  const displayName = name?.trim() || email || 'User';

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs font-bold rounded-lg',
    sm: 'w-8 h-8 text-xs font-bold rounded-lg',
    md: 'w-10 h-10 text-sm font-bold rounded-xl',
    lg: 'w-14 h-14 text-xl font-bold rounded-2xl',
    xl: 'w-20 h-20 text-3xl font-extrabold rounded-2xl',
  }[size];

  const hasValidPhoto = Boolean(photoUrl && photoUrl.trim() !== '' && !imageError);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden shadow-xs border border-slate-200/90 dark:border-slate-700/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white transition-all ${sizeClasses} ${className}`}
      title={displayName}
    >
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-semibold tracking-tight text-white drop-shadow-xs">
          {initial}
        </span>
      )}
      {/* Subtle inner highlight ring */}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20" />
    </div>
  );
};
