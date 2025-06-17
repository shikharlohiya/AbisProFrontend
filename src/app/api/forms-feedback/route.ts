import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface FeedbackRequest {
  customerId: number;
  formtype: string;
  description: string;
  orders?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    
    // Validate required fields
    if (!body.description || !body.customerId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: description, customerId' 
        },
        { status: 400 }
      );
    }

    // Prepare data for backend
    const feedbackData = {
      customerId: body.customerId,
      formtype: 'feedback',
      description: body.description,
      orders: body.orders,
    };

    // Send to real backend
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const response = await axios.post(`${backendUrl}/api/customer-feedback/new-feedback`, feedbackData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Return response with orderId = 1
    return NextResponse.json({
      success: true,
      message: 'Customer feedback submitted successfully',
      data: {
        id: response.data.data.id,
        customerId: response.data.data.customerId,
        orderId: 1,
        formtype: 'feedback',
        description: response.data.data.description,
        orders: response.data.data.orders,
        createdAt: response.data.data.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Error creating feedback:', error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.response.data?.message || 'Backend error occurred' 
        },
        { status: error.response.status }
      );
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot connect to backend server' 
        },
        { status: 503 }
      );
    }
    
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout - backend server not responding' 
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit feedback' 
      },
      { status: 500 }
    );
  }
}
