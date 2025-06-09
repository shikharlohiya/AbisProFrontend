'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Types
interface AlertItem {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
}

interface AddAlertParams {
  message: string;
  type?: AlertItem['type'];
}

interface AlertContextType {
  alerts: AlertItem[];
  addAlert: (params: AddAlertParams) => void;
  removeAlert: (id: number) => void;
  clearAllAlerts: () => void;
}

interface AlertProviderLoginProps {
  children: ReactNode;
}

// Create context with proper typing
const AlertContextLogin = createContext<AlertContextType | null>(null);

// Custom hook with type safety
export const useAlertLogin = (): AlertContextType => {
  const context = useContext(AlertContextLogin);
  if (!context) {
    throw new Error('useAlertLogin must be used within <AlertProviderLogin>');
  }
  return context;
};

// Provider component
export const AlertProviderLogin: React.FC<AlertProviderLoginProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const addAlert = useCallback(({ message, type = 'info' }: AddAlertParams): void => {
    const id = Date.now();
    const newAlert: AlertItem = { id, message, type };
    setAlerts((prev) => [...prev, newAlert]);
  }, []);

  const removeAlert = useCallback((idToRemove: number): void => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== idToRemove));
  }, []);

  const clearAllAlerts = useCallback((): void => {
    setAlerts([]);
  }, []);

  const contextValue: AlertContextType = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
  };

  return (
    <AlertContextLogin.Provider value={contextValue}>
      {children}
    </AlertContextLogin.Provider>
  );
};

// Alert Display Component
interface AlertDisplayProps {
  alert: AlertItem;
  onClose: (id: number) => void;
}

const AlertDisplay: React.FC<AlertDisplayProps> = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(alert.id), 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [alert.id, onClose]);

  const getAlertStyles = (): string => {
    const baseStyles = "p-4 mb-3 rounded-lg shadow-md transition-all duration-300 ease-in-out border-l-4";
    
    switch (alert.type) {
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`;
    }
  };

  const getIcon = (): string => {
    switch (alert.type) {
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
      className={`${getAlertStyles()} ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0">
            {getIcon()}
          </span>
          <p className="text-sm font-medium leading-relaxed m-0 font-inter">
            {alert.message}
          </p>
        </div>
        
        <button
          onClick={() => onClose(alert.id)}
          className="bg-transparent border-none text-current text-lg cursor-pointer p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors duration-200 flex-shrink-0"
          aria-label="Close alert"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Alert Container Component
const AlertContainer: React.FC = () => {
  const { alerts, removeAlert, clearAllAlerts } = useAlertLogin();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      {/* Clear All Button */}
      {alerts.length > 1 && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={clearAllAlerts}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 font-inter"
          >
            Clear All ({alerts.length})
          </button>
        </div>
      )}
      
      {/* Alert List */}
      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertDisplay
            key={alert.id}
            alert={alert}
            onClose={removeAlert}
          />
        ))}
      </div>
    </div>
  );
};

// Demo Component for Testing
const AlertManagerDemo: React.FC = () => {
  const { addAlert, alerts, clearAllAlerts } = useAlertLogin();

  const testAlerts = [
    { message: 'Login successful! Welcome back.', type: 'success' as const },
    { message: 'Invalid username or password.', type: 'error' as const },
    { message: 'Please check your internet connection.', type: 'warning' as const },
    { message: 'New features are now available!', type: 'info' as const },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center font-inter">
          Alert Manager Demo
        </h1>
        
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 font-inter">
            Test Alert System
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {testAlerts.map((alert, index) => (
              <button
                key={index}
                onClick={() => addAlert(alert)}
                className={`px-4 py-2 rounded transition-colors duration-200 font-inter text-white ${
                  alert.type === 'success' ? 'bg-green-500 hover:bg-green-600' :
                  alert.type === 'error' ? 'bg-red-500 hover:bg-red-600' :
                  alert.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => addAlert({ 
                message: `Custom alert #${Date.now()}`, 
                type: 'info' 
              })}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors duration-200 font-inter"
            >
              Add Custom Alert
            </button>
            
            {alerts.length > 0 && (
              <button
                onClick={clearAllAlerts}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 font-inter"
              >
                Clear All ({alerts.length})
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-md font-semibold text-gray-700 mb-3 font-inter">
            Current Alerts: {alerts.length}
          </h3>
          
          {alerts.length === 0 ? (
            <p className="text-gray-500 font-inter">No active alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="text-sm text-gray-600 font-inter">
                  <span className="font-medium">{alert.type}:</span> {alert.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Alert Container */}
      <AlertContainer />
    </div>
  );
};

// Main component that wraps everything with the provider
const AlertManagerPage: React.FC = () => {
  return (
    <AlertProviderLogin>
      <AlertManagerDemo />
    </AlertProviderLogin>
  );
};

export default AlertManagerPage;
