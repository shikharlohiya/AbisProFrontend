import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface CallHangupRequest {
  callId: string;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CallHangupRequest = await request.json();
    
    if (!body.callId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Call ID is required' 
        },
        { status: 400 }
      );
    }

    const hangupData = {
      callId: body.callId,
      reason: body.reason || 'user_hangup',
      timestamp: new Date().toISOString(),
      agentAction: true
    };

    console.log('📞 Ending call with data:', hangupData);

    // ✅ Use environment variable for backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔗 Using backend URL:', backendUrl);
    
    const response = await axios.post(`${backendUrl}/api/calling/hangup-call`, hangupData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.data && response.data.success) {
      console.log('📞 Call ended successfully:', body.callId);
      
      return NextResponse.json({
        success: true,
        message: 'Call ended successfully',
        data: {
          callId: body.callId,
          status: 'ended',
          reason: body.reason || 'user_hangup',
          timestamp: new Date().toISOString(),
          duration: response.data.data?.duration || 0
        }
      });
    } else {
      throw new Error(response.data?.message || 'Backend call hangup failed');
    }

  } catch (error: any) {
    console.error('❌ Call hangup error:', error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.response.data?.message || 'Backend hangup service error',
          details: error.response.data
        },
        { status: error.response.status || 500 }
      );
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot connect to calling service - service unavailable' 
        },
        { status: 503 }
      );
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Call hangup timeout - call may have ended' 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to end call' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Call hangup API endpoint is active',
    timestamp: new Date().toISOString(),
    backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  });
}
