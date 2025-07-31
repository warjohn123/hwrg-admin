'use client';

import { supabase } from '@/lib/supabaseClient';
import { IUserType } from '@/types/User';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email && !password) {
      alert('Missing Fields. Please enter email and password');
      return;
    }

    setIsSigningIn(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('type')
      .eq('id', data.user?.id)
      .maybeSingle();

    if (userError || userData?.type !== IUserType.ADMIN) {
      alert('Access denied');
      setIsSigningIn(false);
      return;
    }

    if (error) {
      alert(error);
      setIsSigningIn(false);
    } else {
      router.push('/admin/chicky-oink-sales');
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {isSigningIn ? 'Signing in' : 'Sign In'}
      </button>
    </form>
  );
}
