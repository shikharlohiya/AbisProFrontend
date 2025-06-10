// components/CallStateContext.tsx
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

  const value = {
    callState,
    setCallState,
    dialedNumber,
    setDialedNumber,
    isMuted,
    setIsMuted,
    callDuration,
    setCallDuration
  };

  return (
    <CallStateContext.Provider value={value}>
      {children}
    </CallStateContext.Provider>
  );
};
