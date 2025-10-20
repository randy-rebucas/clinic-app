import { NextRequest, NextResponse } from 'next/server';
import { NotificationService, NotificationData } from '@/lib/notifications';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only allow staff to send notifications
    if (decoded.type !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { to, template, variables, priority, scheduledFor } = body;

    if (!to || !template || !variables) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, template, variables' 
      }, { status: 400 });
    }

    const notificationData: NotificationData = {
      to,
      template,
      variables,
      priority: priority || 'normal',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    };

    const success = await NotificationService.sendNotification(notificationData);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send notification' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
