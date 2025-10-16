'use client';

import React from 'react';
import NavBar from '@/components/Navigation/NavBar';
import ScreenCaptureSettingsComponent from '@/components/TimeTracker/ScreenCaptureSettings';

export default function SettingsTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Screen Capture Settings Test</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Open your browser&apos;s Developer Tools (F12)</li>
              <li>Go to the Console tab</li>
              <li>Modify any setting below (e.g., change the capture interval)</li>
              <li>Click &quot;Save Settings&quot;</li>
              <li>Check the console for debug messages showing the save/load process</li>
              <li>Refresh the page to verify settings persist</li>
            </ol>
          </div>

          <ScreenCaptureSettingsComponent 
            onSettingsChange={(settings) => {
              console.log('Settings changed callback:', settings);
            }}
          />
        </div>
      </div>
    </div>
  );
}
