import React, { useState } from 'react';
import { signIn } from 'auth-astro/client';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Get callbackUrl from URL params or default to home
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl') || '/';

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      } as any) as any;
      
      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        // Force manual client-side redirection to callbackUrl
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-charcoal mb-2">Welcome Back</h2>
        <p className="text-xs uppercase tracking-widest text-brand-gold font-medium">ACHI Client Sign In</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-600 text-xs font-medium rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@achi.studio"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-charcoal text-white hover:bg-brand-gold hover:text-brand-charcoal py-3 rounded-sm font-medium transition-all duration-300 disabled:opacity-50 text-sm uppercase tracking-widest font-semibold"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500 font-light">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-brand-gold font-medium hover:underline">
            Register client
          </a>
        </p>
      </div>
    </div>
  );
}
