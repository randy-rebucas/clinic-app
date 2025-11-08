import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserByEmail, createUser, getAllUsers } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if requesting all users (admin only)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const all = searchParams.get('all');

    // If requesting all users, verify admin access
    if (all === 'true') {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Only allow admin to get all users
      if (decoded.type !== 'staff' || decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Return all users
      const users = await getAllUsers();
      const transformedUsers = users.map(user => {
        const { _id, password, ...userData } = user.toObject();
        return {
          ...userData,
          _id: _id.toString()
        };
      });

      return NextResponse.json(transformedUsers);
    }

    // Single user lookup - requires id or email
    if (!id && !email) {
      return NextResponse.json({ error: 'Either id or email parameter is required, or use ?all=true for admin access' }, { status: 400 });
    }

    let user;
    if (id) {
      user = await getUser(id);
    } else {
      user = await getUserByEmail(email!);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform _id to id for frontend compatibility
    const { _id, password, ...userData } = user.toObject();
    const transformedUser = {
      ...userData,
      id: _id.toString()
    };

    return NextResponse.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, department, position } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const userData = {
      name,
      email,
      password,
      role,
      department,
      position,
    };

    const userId = await createUser(userData);
    return NextResponse.json({ id: userId, ...userData });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
