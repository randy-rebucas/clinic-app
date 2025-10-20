import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserByEmail, createUser } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    let user;
    if (id) {
      user = await getUser(id);
    } else if (email) {
      user = await getUserByEmail(email);
    } else {
      return NextResponse.json({ error: 'Either id or email parameter is required' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform _id to id for frontend compatibility
    const { _id, ...userData } = user.toObject();
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
