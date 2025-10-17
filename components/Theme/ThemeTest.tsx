'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

export default function ThemeTest() {
  const { theme, isDark } = useTheme();

  return (
    <div className="card p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-container icon-container-primary">
          <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Theme Test</h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Theme:</p>
          <div className="flex items-center gap-2">
            {theme === 'light' && <Sun className="h-4 w-4 text-yellow-500" />}
            {theme === 'dark' && <Moon className="h-4 w-4 text-blue-400" />}
            {theme === 'system' && <Monitor className="h-4 w-4 text-gray-500" />}
            <span className="font-medium text-gray-900 dark:text-white capitalize">{theme}</span>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Is Dark Mode:</p>
          <span className={`font-medium ${isDark ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
            {isDark ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
            <div className="text-xs text-primary-600 dark:text-primary-400 mb-1">Primary</div>
            <div className="w-full h-4 bg-primary-500 rounded"></div>
          </div>
          <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg text-center">
            <div className="text-xs text-success-600 dark:text-success-400 mb-1">Success</div>
            <div className="w-full h-4 bg-success-500 rounded"></div>
          </div>
          <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg text-center">
            <div className="text-xs text-warning-600 dark:text-warning-400 mb-1">Warning</div>
            <div className="w-full h-4 bg-warning-500 rounded"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <button className="btn-primary w-full">Primary Button</button>
          <button className="btn-secondary w-full">Secondary Button</button>
          <button className="btn-success w-full">Success Button</button>
          <button className="btn-warning w-full">Warning Button</button>
          <button className="btn-danger w-full">Danger Button</button>
        </div>
        
        <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <input 
            type="text" 
            placeholder="Test input field" 
            className="input-field w-full"
          />
        </div>
      </div>
    </div>
  );
}
