import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface HoldOrResumeRequest {
  cli: string;
  call_id: string;
  HoldorResume: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HoldOrResumeRequest = await request.json();
    
    // Validate required fields for Vodafone format
    if (!body.cli || !body.call_id || !body.HoldorResume) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'cli, call_id, and holdorresume are required' 
        },
        { status: 400 }
      );
    }

    // Validate holdorresume value
    if (!['0', '1'].includes(body.HoldorResume)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'holdorresume must be "0" (resume) or "1" (hold)' 
        },
        { status: 400 }
      );
    }

    console.log('📞 Simple hold/resume request (complete Vodafone format):', body);

    // ✅ Use environment variable for backend URL
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    console.log('🔗 Forwarding to backend:', `${backendUrl}/api/calling/hold-or-resume`);
    
    // ✅ SIMPLE: Forward complete Vodafone payload to backend
    const response = await axios.post(
      `${backendUrl}/api/calling/hold-or-resume`, 
      body, // Forward complete Vodafone format
      {
        headers: {
          'Content-Type': 'application/json',
          // ✅ NO Authorization header - backend manages tokens internally
        },
        timeout: 15000,
      }
    );

    console.log('✅ Simple hold/resume successful:', response.data);

    // ✅ Return raw Vodafone response (no wrapping)
    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    console.error('❌ Simple hold/resume error:', error);
    
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
          message: 'Hold/Resume timeout - please try again' 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to hold/resume call' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Simple hold/resume API endpoint is active',
    timestamp: new Date().toISOString(),
    backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    endpoint: 'POST /api/calling/hold-or-resume',
    tokenManagement: 'Backend handles tokens internally (legacy pattern)',
    format: {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header needed - backend manages tokens
      },
      body: {
        cli: 'string (required) - e.g. "7610233333"',
        call_id: 'string (required) - e.g. "282133273"',
        holdorresume: 'string (required) - "1" for hold, "0" for resume'
      }
    },
    vodafoneFormat: {
      note: 'Frontend sends complete Vodafone format, backend just forwards',
      example: {
        cli: '7610233333',
        call_id: '282133273',
        holdorresume: '1'
      }
    }
  });
}
