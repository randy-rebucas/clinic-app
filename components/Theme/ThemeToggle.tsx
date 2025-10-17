'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shadow-inner">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
              theme === value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-2 ring-blue-500/20 dark:ring-blue-400/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            title={`Switch to ${label} theme`}
          >
            <Icon className={`h-4 w-4 transition-transform duration-200 ${
              theme === value ? 'scale-110' : 'scale-100'
            }`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
