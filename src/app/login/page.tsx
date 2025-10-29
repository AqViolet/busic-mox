'use client';

import React, { useState } from 'react';
import { loginUser } from '../auth/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await loginUser(formData);
      if (result.success) {
        localStorage.setItem('user', result.username);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-lg w-full max-w-sm shadow-lg space-y-4">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="w-full bg-gray-800 p-2 rounded"/>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full bg-gray-800 p-2 rounded"/>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-semibold">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <p className="text-sm text-center text-gray-400">
          Don’t have an account?{' '}
          <a href="/register" className="text-green-400 hover:underline">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}