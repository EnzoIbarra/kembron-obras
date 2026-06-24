'use client';

import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

export function LogoutButton() {
  function handleLogout() {
    toast('¿Cerrar sesión?', {
      action: { label: 'Confirmar', onClick: () => signOut({ callbackUrl: '/login' }) },
      cancel: { label: 'Cancelar', onClick: () => {} },
    });
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
