import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserByEmail, createUser } from '@/lib/database';
// import { verifyToken } from '@/lib/auth'; // Unused for now

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ error: 'ID or email parameter is required' }, { status: 400 });
    }

    let user;
    if (id) {
      user = await getUser(id);
    } else if (email) {
      user = await getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data without password
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      employeeId: user.employeeId,
      profilePicture: user.profilePicture,
      specialization: user.specialization,
      licenseNumber: user.licenseNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, department, position } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Create user using the database function
    const userId = await createUser({
      name,
      email,
      password,
      role,
      department,
      position,
    });

    return NextResponse.json({ 
      success: true, 
      id: userId,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
