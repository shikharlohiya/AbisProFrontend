import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface ComplaintRequest {
  customerId: number;
  formtype: string;
  description: string;
  issue: string;
  status: 'open' | 'closed';
  followUpDate: string;
  assignedTo: string;
  orders: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ComplaintRequest = await request.json();
    
    // Validate required fields
    if (!body.description || !body.issue || !body.customerId || !body.assignedTo || !body.orders) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: description, issue, customerId, assignedTo, orders' 
        },
        { status: 400 }
      );
    }

    // Prepare data for backend
    const complaintData = {
      customerId: body.customerId,
      formtype: 'complaint',
      description: body.description,
      issue: body.issue,
      status: body.status || 'closed',
      followUpDate: body.followUpDate,
      assignedTo: body.assignedTo,
      orders: body.orders,
    };

    // Send to real backend
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    const response = await axios.post(`${backendUrl}/api/customer-feedback/new-feedback`, complaintData, {
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
        formtype: 'complaint',
        description: response.data.data.description,
        issue: response.data.data.issue,
        status: response.data.data.status,
        followUpDate: response.data.data.followUpDate,
        assignedTo: response.data.data.assignedTo,
        orders: response.data.data.orders,
        updatedAt: response.data.data.updatedAt,
        createdAt: response.data.data.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Error creating complaint:', error);
    
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
        error: 'Failed to submit complaint' 
      },
      { status: 500 }
    );
  }
}
