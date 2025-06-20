import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface MergeCallRequest {
  cli: string;
  call_id: string;
  cparty_number: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: MergeCallRequest = await request.json();
    
    // Validate required fields for Vodafone format
    if (!body.cli || !body.call_id || !body.cparty_number) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'cli, call_id, and cparty_number are required' 
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhoneNumber = body.cparty_number.replace(/^\+91/, '').replace(/\D/g, '');
    if (cleanPhoneNumber.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'cparty_number must be a valid phone number' 
        },
        { status: 400 }
      );
    }

    console.log('📞 Simple merge call request (complete Vodafone format):', {
      cli: body.cli,
      call_id: body.call_id,
      cparty_number: cleanPhoneNumber
    });

    // ✅ Use environment variable for backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔗 Forwarding to backend:', `${backendUrl}/api/calling/merge-call`);
    
    // ✅ SIMPLE: Forward complete Vodafone payload to backend
    const vodafonePayload = {
      cli: body.cli,
      call_id: body.call_id,
      cparty_number: cleanPhoneNumber // Use cleaned phone number
    };

    const response = await axios.post(
      `${backendUrl}/api/calling/merge-call`, 
      vodafonePayload, // Forward complete Vodafone format
      {
        headers: {
          'Content-Type': 'application/json',
          // ✅ NO Authorization header - backend manages tokens internally
        },
        timeout: 15000,
      }
    );

    console.log('✅ Simple merge call successful:', response.data);

    // ✅ Return raw Vodafone response (no wrapping)
    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    console.error('❌ Simple merge call error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Backend returned an error response
      console.error('❌ Backend error:', error.response.data);
      return NextResponse.json(
        error.response.data, // ✅ Forward exact backend response
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
          message: 'Merge call timeout - please try again' 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to merge call' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Simple merge call API endpoint is active',
    timestamp: new Date().toISOString(),
    backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    endpoint: 'POST /api/calling/merge-call',
    tokenManagement: 'Backend handles tokens internally (legacy pattern)',
    description: 'Merge/Conference call functionality using Vodafone callConference API',
    format: {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header needed - backend manages tokens
      },
      body: {
        cli: 'string (required) - e.g. "7610233333"',
        call_id: 'string (required) - e.g. "282133273"',
        cparty_number: 'string (required) - e.g. "9876543210"'
      }
    },
    vodafoneFormat: {
      note: 'Frontend sends complete Vodafone format, backend just forwards',
      api: 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/callConference',
      example: {
        cli: '7610233333',
        call_id: '282133273',
        cparty_number: '9876543210'
      }
    },
    validation: {
      cli: 'Must be provided (CLI number)',
      call_id: 'Must be provided (active call ID)',
      cparty_number: 'Must be valid phone number (min 10 digits)'
    },
    errorCodes: {
      400: 'Missing required fields or invalid phone number',
      503: 'Backend service unavailable',
      504: 'Request timeout',
      500: 'Internal server error'
    }
  });
}
