'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useSocket } from './socket-context';

// ✅ HYBRID: Use paste-2 UI states for CallControls compatibility
type CallState = 'incoming' | 'connecting' | 'ringing_customer' | 'active' | 'ended' | 'idle' | 'failed';

interface CallStateContextType {
  callState: CallState;
  setCallState: (state: CallState) => void;
  dialedNumber: string;
  setDialedNumber: (number: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  callDuration: number;
  setCallDuration: (duration: number) => void;
  // Call history tracking
  callHistory: CallRecord[];
  addCallToHistory: (call: CallRecord) => void;
  // Current call ID tracking
  currentCallId: string | null;
  setCurrentCallId: (id: string | null) => void;
  // ✅ PASTE-3: Legacy pattern states for webhook handling
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  webhookData: any;
  setWebhookData: (data: any) => void;
  callIdMatched: boolean;
  setCallIdMatched: (matched: boolean) => void;
  timer: number;
  setTimer: (timer: number) => void;
  callError: string | null;
  setCallError: (error: string | null) => void;
  // ✅ NEW: Last called number for callback (separate from dialer)
  lastCalledNumber: string;
  setLastCalledNumber: (number: string) => void;
  // ✅ NEW: Hold/Resume functionality
  isOnHold: boolean;
  setIsOnHold: (onHold: boolean) => void;
  // Call management methods
  initiateCall: (phoneNumber: string) => Promise<void>;
  endCall: () => Promise<void>;
  holdOrResumeCall: (action?: 'hold' | 'resume') => Promise<void>;
  mergeCall: (phoneNumber: string) => Promise<void>; // ✅ ADD: Merge call method
  resetCallState: () => void;
  getCallStatus: () => string;
  // ✅ NEW: Clear dialer only (not callback number)
  clearDialerOnly: () => void;
}

// Call record interface
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
  // ✅ PASTE-2: UI states for CallControls compatibility
  const [callState, setCallState] = useState<CallState>('idle');
  const [dialedNumber, setDialedNumber] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  
  // ✅ PASTE-3: Legacy pattern states for webhook handling
  const [isConnected, setIsConnected] = useState(false);
  const [webhookData, setWebhookData] = useState<any>(null);
  const [callIdMatched, setCallIdMatched] = useState(false);
  const [timer, setTimer] = useState(0);
  const [callError, setCallError] = useState<string | null>(null);
  
  // ✅ NEW: Last called number for callback functionality
  const [lastCalledNumber, setLastCalledNumber] = useState<string>('');
  
  // ✅ NEW: Hold/Resume state
  const [isOnHold, setIsOnHold] = useState(false);
  
  // Get socket instance
  const { socket, isConnected: socketConnected } = useSocket();

  // ✅ PASTE-3: Exact socket event handling from legacy
  useEffect(() => {
    if (!socket) return;
    
    socket.on("callStatusUpdate", (data) => {
      console.log("Webhook data received in frontend:", data);

      // ✅ PASTE-3: Exact call ID matching
      if (data.CALL_ID === String(currentCallId)) {
        setWebhookData(data);
        setCallIdMatched(true);

        // ✅ HYBRID: Map legacy events to paste-2 UI states
        switch (data.EVENT_TYPE) {
          case "A party Initiated":
            setCallState('connecting'); // ✅ PASTE-2 state
            console.log('📞 A party initiated - Agent phone ringing');
            break;
            
          case "A party connected/Notconnected":
            if (data.A_DIAL_STATUS === "Connected") {
              setCallState('ringing_customer'); // ✅ PASTE-2 state
              console.log('📞 Agent connected, now ringing customer...');
            } else {
              setCallState('failed');
              setCallError('Agent did not answer');
            }
            break;
            
          case "B party initiated":
            setCallState('ringing_customer'); // ✅ PASTE-2 state
            console.log('📞 B party initiated - Customer phone ringing');
            break;
            
          case "B party Connected/Notconnected":
            if (data.B_DIAL_STATUS === "Connected") {
              setIsConnected(true);
              setCallState('active'); // ✅ PASTE-2 state
              // ✅ FIXED: Reset timer to 0 when call becomes active
              setTimer(0);
              setCallDuration(0);
              console.log('📞 Both parties connected - Call is ACTIVE!');
            } else {
              setIsConnected(false);
              setCallState('failed');
              setCallError('Customer did not answer');
            }
            break;
            
          case "Call End":
            // ✅ PASTE-3: Handle call end exactly like legacy
            resetCallStates();
            setCallState('ended'); // ✅ PASTE-2 state
            
            // ✅ NEW: Store number for callback but clear dialer after delay
            if (dialedNumber) {
              setLastCalledNumber(dialedNumber);
              localStorage.setItem('lastCalledNumber', dialedNumber);
            }
            
            // Clear dialer after showing "Call Ended" briefly
            setTimeout(() => {
              clearDialerOnly();
              setCallState('idle');
            }, 2000);
            
            console.log('📞 Call ended via webhook');
            break;
            
          default:
            console.log('📞 Unknown event type:', data.EVENT_TYPE);
            break;
        }
      } else {
        console.log("Call ID mismatch:", {
          webhook: data.CALL_ID,
          current: currentCallId,
        });
        setCallIdMatched(false);
      }
    });
    
    return () => {
      socket.off("callStatusUpdate");
    };
  }, [socket, currentCallId, dialedNumber]);

  // ✅ FIXED: Timer logic without timer dependency to avoid stale closure
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    // ✅ FIXED: Only start timer when connected status is confirmed by webhook and not on hold
    if (webhookData?.B_DIAL_STATUS === "Connected" && callIdMatched && !isOnHold) {
      console.log('⏱️ Starting timer - call is connected and not on hold');
      timerId = setInterval(() => {
        setTimer((prev) => prev + 1);
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) {
        console.log('⏱️ Clearing timer');
        clearInterval(timerId);
      }
    };
  }, [webhookData?.B_DIAL_STATUS, callIdMatched, isOnHold]); // ✅ FIXED: Removed timer dependency

  // ✅ PASTE-3: Enhanced status function with hold support
  const getCallStatus = useCallback(() => {
    // ✅ NEW: Show hold status first
    if (isOnHold && callState === 'active') {
      return "On Hold";
    }
    
    if (webhookData && callIdMatched) {
      if (webhookData.EVENT_TYPE === "B party Connected/Notconnected") {
        return webhookData.B_DIAL_STATUS === "Connected"
          ? "Connected"
          : "Ringing Customer...";
      }
      if (webhookData.EVENT_TYPE === "A party connected/Notconnected") {
        return webhookData.A_DIAL_STATUS === "Connected"
          ? "Ringing Customer..."
          : "Ringing Agent...";
      }
      if (webhookData.EVENT_TYPE === "A party Initiated") {
        return "Ringing Agent...";
      }
    }
    
    // ✅ HYBRID: Map paste-2 states to display text
    switch (callState) {
      case 'connecting':
        return "Ringing Agent...";
      case 'ringing_customer':
        return "Ringing Customer...";
      case 'active':
        return "Connected";
      case 'failed':
        return "Call Failed";
      case 'ended':
        return "Call Ended";
      default:
        return "Ready";
    }
  }, [webhookData, callIdMatched, callState, isOnHold]);

  // ✅ PASTE-3: Reset function like legacy
  const resetCallStates = useCallback(() => {
    setIsConnected(false);
    setWebhookData(null);
    setCallIdMatched(false);
    setTimer(0);
    setCallDuration(0);
    setCallError(null);
    setIsOnHold(false); // ✅ NEW: Reset hold status
  }, []);

  // ✅ NEW: Clear dialer only (keep callback number)
  const clearDialerOnly = useCallback(() => {
    console.log('🧹 Clearing dialer only (keeping callback number)');
    setDialedNumber('');
    
    // Clear dialer-specific storage
    localStorage.removeItem('currentPhoneNumber');
    localStorage.removeItem('dialerPhoneNumber');
    
    // Dispatch event to clear dialer UI
    window.dispatchEvent(new CustomEvent('clearDialer'));
  }, []);

  // Restore last called number on mount
  useEffect(() => {
    try {
      const savedLastCalled = localStorage.getItem('lastCalledNumber');
      if (savedLastCalled) {
        setLastCalledNumber(savedLastCalled);
      }
    } catch (error) {
      console.error('Error restoring last called number:', error);
    }
  }, []);

  // Function to add call to history
  const addCallToHistory = useCallback((call: CallRecord) => {
    setCallHistory(prev => [call, ...prev.slice(0, 49)]);
    
    try {
      const existingHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
      const updatedHistory = [call, ...existingHistory.slice(0, 49)];
      localStorage.setItem('callHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving call history:', error);
    }
  }, []);

  // ✅ PASTE-3: Initiate call function
  const initiateCall = useCallback(async (phoneNumber: string) => {
    try {
      setCallError(null);
      setCallState('connecting'); // ✅ PASTE-2 state
      setDialedNumber(phoneNumber);
      resetCallStates();
      
      console.log('📞 Initiating call to:', phoneNumber);
      
      // Store phone number for persistence during call
      localStorage.setItem('currentPhoneNumber', phoneNumber);
      
      // Call the API to initiate call
      const response = await fetch('/api/calling/calling-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          agentId: 'agent-001'
        }),
      });

      const data = await response.json();
      
      if (data.success && data.callId) {
        const callId = String(data.callId);
        setCurrentCallId(callId);
        
        // Store in localStorage for persistence
        localStorage.setItem('currentCallId', callId);
        localStorage.setItem('currentCallPhone', phoneNumber);
        
        console.log('📞 Call initiated successfully, waiting for webhook events for call:', callId);
        
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }
      
    } catch (error: any) {
      console.error('📞 Call initiation failed:', error);
      setCallError(error.message || 'Failed to initiate call');
      setCallState('failed');
      
      // Clear dialer on failure after showing error briefly
      setTimeout(() => {
        clearDialerOnly();
        setCallState('idle');
      }, 3000);
    }
  }, [clearDialerOnly]);

  // ✅ UNIFIED: End call function using legacy call disconnection with backend token management
  const endCall = useCallback(async () => {
    if (!currentCallId) {
      console.warn('📞 No active call to end');
      return;
    }

    try {
      console.log('📞 Ending call using legacy disconnection (backend manages token):', currentCallId);
      
      // ✅ UNIFIED: Use call-disconnection endpoint with backend token management
      const response = await fetch('/api/calling/call-disconnection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ NO Authorization header - backend manages tokens internally
        },
        body: JSON.stringify({
          cli: process.env.NEXT_PUBLIC_CLI_NUMBER || '7610233333', // ✅ LEGACY: CLI number
          call_id: currentCallId, // ✅ LEGACY: call_id format (not callId)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📞 Legacy call disconnection successful:', data);
        
        // Add to call history
        if (dialedNumber) {
          const callRecord: CallRecord = {
            id: currentCallId,
            phoneNumber: dialedNumber,
            callType: 'outgoing',
            timestamp: new Date(),
            duration: timer,
            status: isConnected ? 'answered' : 'missed'
          };
          addCallToHistory(callRecord);
        }
        
        // ✅ LEGACY: Don't reset state here, wait for socket event like legacy
        console.log('📞 Waiting for socket confirmation of call end...');
        
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to end call');
      }
      
    } catch (error: any) {
      console.error('📞 Failed to end call:', error);
      setCallError(error.message || 'Failed to end call');
      
      // If legacy disconnection fails, try modern hangup as fallback
      try {
        console.log('📞 Trying modern hangup as fallback...');
        
        const fallbackResponse = await fetch('/api/calling/calling-api/hangup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callId: currentCallId,
          }),
        });

        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.success) {
          console.log('📞 Fallback hangup successful');
        } else {
          throw new Error('Both legacy and modern hangup failed');
        }
      } catch (fallbackError) {
        console.error('❌ Both hangup methods failed:', fallbackError);
        resetCallState();
      }
    }
  }, [currentCallId, dialedNumber, timer, isConnected, addCallToHistory]);

  // ✅ SIMPLE: Hold or Resume call function - Send complete Vodafone format
  const holdOrResumeCall = useCallback(async (action?: 'hold' | 'resume') => {
    if (!currentCallId) {
      console.warn('📞 No active call to hold/resume');
      return;
    }

    if (callState !== 'active' || !isConnected) {
      console.warn('📞 Call must be active to hold/resume');
      setCallError('Call must be active to hold/resume');
      return;
    }

    try {
      const finalAction = action || (isOnHold ? 'resume' : 'hold');
      
      console.log(`📞 ${finalAction === 'hold' ? 'Holding' : 'Resuming'} call:`, currentCallId);
      
      // ✅ SIMPLE: Send complete Vodafone format from frontend
      const vodafonePayload = {
        cli: process.env.NEXT_PUBLIC_CLI_NUMBER || '7610233333',
        call_id: currentCallId,
        HoldorResume: finalAction === 'hold' ? "1" : "0"
      };

      console.log('📞 Sending Vodafone payload:', vodafonePayload);

      const response = await fetch('/api/calling/hold-or-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vodafonePayload), // ✅ Send complete payload
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📞 ${finalAction === 'hold' ? 'Hold' : 'Resume'} successful:`, data);
        
        setIsOnHold(finalAction === 'hold');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to ${finalAction} call`);
      }
      
    } catch (error: any) {
      console.error(`📞 Failed to ${action || 'toggle hold on'} call:`, error);
      setCallError(error.message || `Failed to ${action || 'toggle hold on'} call`);
    }
  }, [currentCallId, isOnHold, callState, isConnected]);

  // ✅ SIMPLE: Merge call function - Send complete Vodafone format
  const mergeCall = useCallback(async (phoneNumber: string) => {
    if (!currentCallId) {
      console.warn('📞 No active call to merge');
      return;
    }

    if (callState !== 'active' || !isConnected) {
      console.warn('📞 Call must be active to merge');
      setCallError('Call must be active to merge');
      return;
    }

    try {
      const cleanPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
      if (cleanPhoneNumber.length < 10) {
        setCallError('Invalid phone number format');
        return;
      }
      
      console.log('📞 Merging call with:', cleanPhoneNumber);
      
      // ✅ SIMPLE: Send complete Vodafone format from frontend
      const vodafonePayload = {
        cli: process.env.NEXT_PUBLIC_CLI_NUMBER || '7610233333',
        call_id: currentCallId,
        cparty_number: cleanPhoneNumber
      };

      console.log('📞 Sending merge call payload:', vodafonePayload);

      const response = await fetch('/api/calling/merge-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vodafonePayload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📞 Merge call successful:', data);
        
        // Clear any previous errors
        setCallError(null);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to merge call');
      }
      
    } catch (error: any) {
      console.error('📞 Failed to merge call:', error);
      setCallError(error.message || 'Failed to merge call');
    }
  }, [currentCallId, callState, isConnected]);

  // ✅ UPDATED: Reset call state with proper number handling
  const resetCallState = useCallback(() => {
    setCallState('idle');
    setCurrentCallId(null);
    setIsMuted(false);
    resetCallStates();
    
    // ✅ NEW: Store current number as last called before clearing
    if (dialedNumber) {
      setLastCalledNumber(dialedNumber);
      localStorage.setItem('lastCalledNumber', dialedNumber);
    }
    
    // Clear dialer only
    clearDialerOnly();
    
    // Clean up call-specific localStorage
    localStorage.removeItem('currentCallId');
    localStorage.removeItem('currentCallPhone');
  }, [resetCallStates, clearDialerOnly, dialedNumber]);

  const value = {
    callState,
    setCallState,
    dialedNumber,
    setDialedNumber,
    isMuted,
    setIsMuted,
    callDuration,
    setCallDuration,
    callHistory,
    addCallToHistory,
    currentCallId,
    setCurrentCallId,
    // Legacy pattern properties
    isConnected,
    setIsConnected,
    webhookData,
    setWebhookData,
    callIdMatched,
    setCallIdMatched,
    timer,
    setTimer,
    callError,
    setCallError,
    // ✅ NEW: Callback number management
    lastCalledNumber,
    setLastCalledNumber,
    // ✅ NEW: Hold/Resume functionality
    isOnHold,
    setIsOnHold,
    // Methods
    initiateCall,
    endCall,
    holdOrResumeCall,
    mergeCall, // ✅ ADD: Merge call function
    resetCallState,
    getCallStatus,
    clearDialerOnly,
  };

  return (
    <CallStateContext.Provider value={value}>
      {children}
    </CallStateContext.Provider>
  );
};

export type { CallRecord };
