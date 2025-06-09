'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
}

// Create context with undefined initial value
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Custom hook with proper error handling and type safety
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// Provider component props interface
interface SidebarProviderProps {
  children: ReactNode;
}

// Provider component with TypeScript
export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setIsCollapsed(prev => !prev);
  };

  const contextValue: SidebarContextType = {
    isCollapsed,
    toggleSidebar,
    setIsCollapsed,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};
