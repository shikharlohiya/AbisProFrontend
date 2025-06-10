// services/callStorage.ts
interface CallRecord {
  callId: number;
  phoneNumber: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'ended' | 'failed';
  duration?: number;
}

class CallStorageService {
  private static instance: CallStorageService;
  private currentCallId: number | null = null;
  private callHistory: CallRecord[] = [];

  static getInstance(): CallStorageService {
    if (!CallStorageService.instance) {
      CallStorageService.instance = new CallStorageService();
    }
    return CallStorageService.instance;
  }

  // Store active call ID
  setCurrentCall(callId: number, phoneNumber: string): void {
    this.currentCallId = callId;
    
    const callRecord: CallRecord = {
      callId,
      phoneNumber,
      startTime: Date.now(),
      status: 'active'
    };

    // Store in session for current session
    sessionStorage.setItem('currentCallId', callId.toString());
    sessionStorage.setItem('currentCall', JSON.stringify(callRecord));
    
    // Add to call history
    this.callHistory.unshift(callRecord);
    this.saveCallHistory();
  }

  // Get current call ID
  getCurrentCallId(): number | null {
    if (this.currentCallId) return this.currentCallId;
    
    // Fallback to session storage
    const stored = sessionStorage.getItem('currentCallId');
    return stored ? parseInt(stored) : null;
  }

  // End current call
  endCurrentCall(duration?: number): void {
    if (this.currentCallId) {
      const callIndex = this.callHistory.findIndex(
        call => call.callId === this.currentCallId
      );
      
      if (callIndex !== -1) {
        this.callHistory[callIndex].endTime = Date.now();
        this.callHistory[callIndex].status = 'ended';
        this.callHistory[callIndex].duration = duration;
      }
    }

    // Clear current call
    this.currentCallId = null;
    sessionStorage.removeItem('currentCallId');
    sessionStorage.removeItem('currentCall');
    
    this.saveCallHistory();
  }

  // Save call history to localStorage
  private saveCallHistory(): void {
    try {
      localStorage.setItem('callHistory', JSON.stringify(this.callHistory));
    } catch (error) {
      console.error('Failed to save call history:', error);
    }
  }

  // Load call history
  loadCallHistory(): CallRecord[] {
    try {
      const history = localStorage.getItem('callHistory');
      if (!history) return [];
      
      this.callHistory = JSON.parse(history);
      return this.callHistory;
    } catch (error) {
      console.error('Failed to load call history:', error);
      return [];
    }
  }

  // Get call history
  getCallHistory(): CallRecord[] {
    return this.callHistory;
  }

  // Clear all stored data
  clearAllData(): void {
    this.currentCallId = null;
    this.callHistory = [];
    sessionStorage.removeItem('currentCallId');
    sessionStorage.removeItem('currentCall');
    localStorage.removeItem('callHistory');
  }
}

export const callStorage = CallStorageService.getInstance();
export default callStorage;
