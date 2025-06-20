import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface CallInitiateRequest {
  phoneNumber: string;
  agentId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CallInitiateRequest = await request.json();
    
    // Validate required fields
    if (!body.phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number is required' 
        },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = body.phoneNumber.replace(/\D/g, '');
    
    // Validate phone number format
    if (cleanPhoneNumber.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid phone number format' 
        },
        { status: 400 }
      );
    }

    // Prepare data for backend calling API
    const callData = {
      phoneNumber: cleanPhoneNumber,
      agentId: body.agentId || 'agent-001',
      timestamp: new Date().toISOString(),
      callType: 'outgoing'
    };

    console.log('📞 Initiating call with data:', callData);

    // ✅ Use environment variable for backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔗 Using backend URL:', backendUrl);
    
    const response = await axios.post(`${backendUrl}/api/calling/initiate-call`, callData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Handle successful response
    if (response.data && response.data.success) {
      const callId = response.data.data?.callId || `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📞 Call initiated successfully:', callId);
      
      return NextResponse.json({
        success: true,
        callId: callId,
        message: 'Call initiated successfully',
        data: {
          callId: callId,
          phoneNumber: cleanPhoneNumber,
          status: 'connecting',
          timestamp: new Date().toISOString(),
          agentId: body.agentId || 'agent-001'
        }
      });
    } else {
      throw new Error(response.data?.message || 'Backend call initiation failed');
    }

  } catch (error: any) {
    console.error('❌ Call initiation error:', error);
    
    // Handle different types of errors
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.response.data?.message || 'Backend call service error',
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
          error: 'Call initiation timeout - please try again' 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to initiate call' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Calling API endpoint is active',
    timestamp: new Date().toISOString(),
    backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    endpoints: {
      initiate: 'POST /api/calling/calling-api',
      hangup: 'POST /api/calling/calling-api/hangup'
    }
  });
}
