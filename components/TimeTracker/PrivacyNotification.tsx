'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PrivacyNotificationProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyNotificationComponent({ onAccept, onDecline }: PrivacyNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a decision
    const hasDecided = localStorage.getItem('screenCapturePrivacyDecision');
    if (!hasDecided) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('screenCapturePrivacyDecision', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('screenCapturePrivacyDecision', 'declined');
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Screen Capture Privacy Notice</h3>
            </div>
            <button
              onClick={handleDecline}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-300">Important Privacy Information</div>
                <div className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                  This application may capture screenshots of your screen during work sessions for productivity monitoring purposes.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">What we capture:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Screenshots of your active screen every 15 minutes during work sessions</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Activity status (active/inactive) based on mouse and keyboard usage</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Timestamp and work session information</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">What we don&apos;t capture:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>Audio or microphone recordings</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>Personal files or sensitive information</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>Passwords or login credentials</span>
              </li>
              <li className="flex items-start space-x-2">
                <XCircle className="h-3 w-3 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>Private browsing sessions or personal applications</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Your rights:</h4>
            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>You can disable screen capture at any time in settings</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>You can view and delete your captured screenshots</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>Captures are stored locally and can be exported</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>You can decline screen capture and still use the time tracking features</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-900 dark:text-yellow-300">Important</div>
                <div className="text-xs text-yellow-800 dark:text-yellow-400 mt-1">
                  Screen capture is optional. You can continue using the time tracking features without enabling screen capture.
                  However, some productivity monitoring features may not be available.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleDecline}
              className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Decline Screen Capture
            </button>
            <button
              onClick={handleAccept}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
