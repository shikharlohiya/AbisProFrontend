import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface CallDisconnectionRequest {
  cli: string;
  call_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CallDisconnectionRequest = await request.json();
    
    // Validate required fields
    if (!body.cli || !body.call_id) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'CLI and call_id are required' 
        },
        { status: 400 }
      );
    }

    console.log('📞 Unified call disconnection request:', {
      cli: body.cli,
      call_id: body.call_id,
      backendTokenManagement: true
    });

    // ✅ Use environment variable for backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔗 Forwarding to backend:', `${backendUrl}/api/calling/call-disconnection`);
    
    // ✅ UNIFIED: Forward request to backend (backend manages tokens internally)
    const response = await axios.post(
      `${backendUrl}/api/calling/call-disconnection`, 
      body, // Forward exact body
      {
        headers: {
          'Content-Type': 'application/json',
          // ✅ NO Authorization header - backend manages tokens internally
        },
        timeout: 15000,
      }
    );

    console.log('✅ Unified call disconnection successful:', response.data);

    // ✅ LEGACY: Return raw Vodafone response (no wrapping)
    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    console.error('❌ Unified call disconnection error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Backend returned an error response
      console.error('❌ Backend error:', error.response.data);
      return NextResponse.json(
        error.response.data, // ✅ LEGACY: Forward exact backend response
        { status: error.response.status }
      );
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot connect to calling service - service unavailable' 
        },
        { status: 503 }
      );
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Call disconnection timeout - please try again' 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to disconnect call' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Unified call disconnection API endpoint is active',
    timestamp: new Date().toISOString(),
    backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    endpoint: 'POST /api/calling/call-disconnection',
    tokenManagement: 'Backend handles tokens internally (unified approach)',
    format: {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header needed - backend manages tokens
      },
      body: {
        cli: 'string (required)',
        call_id: 'string (required)'
      }
    }
  });
}
