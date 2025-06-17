'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type CallState = 'incoming' | 'connecting' | 'active' | 'ended' | 'idle';

interface CallStateContextType {
  callState: CallState;
  setCallState: (state: CallState) => void;
  dialedNumber: string;
  setDialedNumber: (number: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  callDuration: number;
  setCallDuration: (duration: number) => void;
  // ADD THIS: Call history tracking
  callHistory: CallRecord[];
  addCallToHistory: (call: CallRecord) => void;
  // ADD THIS: Current call ID tracking
  currentCallId: string | null;
  setCurrentCallId: (id: string | null) => void;
}

// ADD THIS: Call record interface
interface CallRecord {
  id: string;
  phoneNumber: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration: number;
  status: 'answered' | 'missed' | 'declined';
}

const CallStateContext = createContext<CallStateContextType | undefined>(undefined);

export const useCallState = () => {
  const context = useContext(CallStateContext);
  if (!context) {
    throw new Error('useCallState must be used within a CallStateProvider');
  }
  return context;
};

interface CallStateProviderProps {
  children: ReactNode;
}

export const CallStateProvider: React.FC<CallStateProviderProps> = ({ children }) => {
  const [callState, setCallState] = useState<CallState>('ended');
  const [dialedNumber, setDialedNumber] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  // ADD THIS: Call history state
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  // ADD THIS: Current call ID state
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);

  // ADD THIS: Function to add call to history
  const addCallToHistory = (call: CallRecord) => {
    setCallHistory(prev => [call, ...prev.slice(0, 49)]); // Keep last 50 calls
  };

  const value = {
    callState,
    setCallState,
    dialedNumber,
    setDialedNumber,
    isMuted,
    setIsMuted,
    callDuration,
    setCallDuration,
    // ADD THIS: Include new functionality
    callHistory,
    addCallToHistory,
    currentCallId,
    setCurrentCallId
  };

  return (
    <CallStateContext.Provider value={value}>
      {children}
    </CallStateContext.Provider>
  );
};

// ADD THIS: Export the interface for use in other components
export type { CallRecord };
