import React, { useState } from 'react';

export default function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        // Redirect to sign in page
        window.location.href = '/auth/signin';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-100 p-8 rounded-sm shadow-sm">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-charcoal mb-2">Create Account</h2>
        <p className="text-xs uppercase tracking-widest text-brand-gold font-medium">Register as ACHI Client</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-600 text-xs font-medium rounded-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-2 border-green-500 text-green-600 text-xs font-medium rounded-sm">
          Registration successful! Redirecting to sign in page...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all rounded-sm text-sm"
          />
        </div>

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
            Password (at least 6 characters)
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
          disabled={isLoading || success}
          className="w-full bg-brand-charcoal text-white hover:bg-brand-gold hover:text-brand-charcoal py-3 rounded-sm font-medium transition-all duration-300 disabled:opacity-50 text-sm uppercase tracking-widest font-semibold"
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500 font-light">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-brand-gold font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
