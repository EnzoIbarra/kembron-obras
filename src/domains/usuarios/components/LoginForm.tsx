'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DraftingCompass, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      username: form.get('username') as string,
      password: form.get('password') as string,
      redirect: false,
    });

    if (result?.error) {
      setError('Usuario o contraseña incorrectos');
      setLoading(false);
      return;
    }

    router.push('/');
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_0_40px_rgba(59,130,246,0.25)]">
        <div className="bg-slate-900 px-8 py-8 text-center">
          <DraftingCompass size={36} className="mx-auto mb-3 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Kembron Obras</h1>
          <p className="mt-1 text-sm text-slate-400">Sistema de gestión de obras</p>
        </div>

        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
