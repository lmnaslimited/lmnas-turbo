'use client';

import { useState, useRef, useEffect } from 'react';

interface IUserProfile {
  name: string;
  email: string;
  picture?: string;
}

interface IProfileDropdownProps {
  user: IUserProfile;
  logout: () => void;
}

export function ProfileDropdown({ user, logout }: IProfileDropdownProps) {
  const [LIsDropdownOpen, fnSetIsDropdownOpen] = useState(false);
  const LDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown instantly if clicking outside of it
  useEffect(() => {
    function fnHandleClickOutside(event: MouseEvent) {
      if (LDropdownRef.current && !LDropdownRef.current.contains(event.target as Node)) {
        fnSetIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', fnHandleClickOutside);
    return () => document.removeEventListener('mousedown', fnHandleClickOutside);
  }, []);

  function fnGetInitials(iName: string){
    if (!iName) return 'U';
    return iName
      .split(' ')
      .map((iLetter) => iLetter[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const LFrappeUrl = process.env.NEXT_PUBLIC_FRAPPE_URL || '';

  return (
    <div ref={LDropdownRef} className="relative inline-block text-left">
      {/* Avatar Button Anchor */}
      <button
        onClick={() => fnSetIsDropdownOpen(!LIsDropdownOpen)}
        className="flex items-center focus:outline-none"
      >
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm border border-border overflow-hidden hover:border-ring transition-colors">
            {user.picture ? (
            <img
              src={user.picture.startsWith('http') ? user.picture : `${LFrappeUrl}${user.picture}`} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            fnGetInitials(user.name)
          )}
        </div>
      </button>

      {/* Dropdown Card */}
      {LIsDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card text-card-foreground border border-border rounded-lg shadow-lg py-1 flex flex-col z-50 origin-top-right">
          {/* User Profile Info Header */}
          <div className="px-4 py-2.5 border-b border-border flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>

          {/* Just Log Out Action Button */}
          <div className="p-1">
            <button
              onClick={() => {
                fnSetIsDropdownOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-destructive font-medium rounded-md hover:bg-accent transition-colors focus:outline-none"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}