'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  function handleLogout() {
    if (window.confirm('¿Cerrar sesión?')) {
      signOut({ callbackUrl: '/login' });
    }
  }
  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      Cerrar sesión
    </button>
  );
}
