import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const { callId } = params;
    
    if (!callId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Call ID is required' 
        },
        { status: 400 }
      );
    }

    console.log('📞 Checking call status for:', callId);

    // Use environment variable for backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const response = await axios.get(`${backendUrl}/api/calling/call-status/${callId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Call status retrieved:', response.data);

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('❌ Call status error:', error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.response.data?.message || 'Backend call status error',
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
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get call status' 
      },
      { status: 500 }
    );
  }
}
