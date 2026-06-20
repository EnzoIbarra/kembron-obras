import Link from 'next/link';
import { LogoutButton } from '@/domains/usuarios/components/LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <nav className="flex items-center gap-6">
          <span className="font-bold text-gray-900">Kembron Obras</span>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/obras" className="text-sm text-gray-600 hover:text-gray-900">
            Obras
          </Link>
          <Link href="/usuarios" className="text-sm text-gray-600 hover:text-gray-900">
            Usuarios
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
