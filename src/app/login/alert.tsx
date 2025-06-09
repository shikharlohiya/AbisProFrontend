'use client';

import React, { useState, useEffect } from 'react';

// Types
interface AlertProps {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
  onClose: (id: string) => void;
}

type FadeState = 'in' | 'out';

const Alert: React.FC<AlertProps> = ({ id, message, type, onClose }) => {
  const [fadeState, setFadeState] = useState<FadeState>('in');

  useEffect(() => {
    setFadeState('in');
    
    const exitTimer = setTimeout(() => setFadeState('out'), 2700);
    const removeTimer = setTimeout(() => onClose(id), 3000);
    
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onClose]);

  // Get background color based on alert type
  const getBackgroundColor = (): string => {
    switch (type) {
      case 'error':
        return '#EF4444'; // red-500
      case 'success':
        return '#10B981'; // green-500
      case 'warning':
        return '#F59E0B'; // amber-500
      case 'info':
        return '#3B82F6'; // blue-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  // Get icon based on alert type
  const getIcon = (): string => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div
      className={`relative p-5 m-2.5 text-white rounded-lg max-w-[400px] transition-all duration-300 ease-in-out shadow-lg border-l-4 ${
        fadeState === 'in' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
      }`}
      style={{
        backgroundColor: getBackgroundColor(),
        borderLeftColor: type === 'error' ? '#DC2626' : type === 'success' ? '#059669' : '#1D4ED8'
      }}
    >
      {/* Alert Content */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-lg flex-shrink-0 mt-0.5">
          {getIcon()}
        </span>
        
        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed m-0 font-inter">
            {message}
          </p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className="bg-transparent border-none text-white text-lg cursor-pointer p-1 rounded hover:bg-black hover:bg-opacity-20 transition-colors duration-200 flex-shrink-0"
          aria-label="Close alert"
        >
          ×
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
        <div 
          className={`h-full bg-white bg-opacity-30 transition-all duration-[3000ms] ease-linear ${
            fadeState === 'in' ? 'w-0' : 'w-full'
          }`}
        />
      </div>
    </div>
  );
};

// Example usage component for demonstration
const AlertDemo: React.FC = () => {
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; type: AlertProps['type'] }>>([]);

  const addAlert = (message: string, type: AlertProps['type']): void => {
    const newAlert = {
      id: Date.now().toString(),
      message,
      type
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = (id: string): void => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Demo Controls */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center font-inter">
          Alert Component Demo
        </h1>
        
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 font-inter">
            Test Different Alert Types
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => addAlert('This is a success message!', 'success')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors duration-200 font-inter"
            >
              Success
            </button>
            
            <button
              onClick={() => addAlert('This is an error message!', 'error')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 font-inter"
            >
              Error
            </button>
            
            <button
              onClick={() => addAlert('This is a warning message!', 'warning')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors duration-200 font-inter"
            >
              Warning
            </button>
            
            <button
              onClick={() => addAlert('This is an info message!', 'info')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200 font-inter"
            >
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Alert Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            id={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={removeAlert}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertDemo;
