'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/Auth/LoginForm';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600">You are signed in.</p>
        <button onClick={logout} className="btn-primary px-4 py-2 rounded">Logout</button>
      </div>
    </main>
  );
}
