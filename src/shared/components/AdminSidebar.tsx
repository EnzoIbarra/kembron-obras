'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { DraftingCompass, LayoutDashboard, Building2, Users, LogOut } from 'lucide-react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/obras', label: 'Obras', Icon: Building2 },
  { href: '/usuarios', label: 'Usuarios', Icon: Users },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  function handleLogout() {
    toast('¿Cerrar sesión?', {
      action: { label: 'Confirmar', onClick: () => signOut({ callbackUrl: '/login' }) },
      cancel: { label: 'Cancelar', onClick: () => {} },
    });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-slate-900">
      <div className="flex items-center gap-2.5 border-b border-slate-700/50 px-5 py-5">
        <DraftingCompass size={20} className="shrink-0 text-blue-400" />
        <span className="text-sm font-semibold text-white">Kembron Obras</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? 'border-l-2 border-blue-400 bg-slate-700/60 pl-[10px] text-white'
                      : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-700/50 px-3 py-4">
        <button
          onClick={handleLogout}
          className="group relative flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5"
        >
          <span className="absolute inset-0 origin-center scale-x-0 rounded-lg bg-gradient-to-r from-blue-400/10 via-blue-500/20 to-blue-600/30 transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <LogOut
            size={16}
            className="relative z-10 shrink-0 text-slate-400 transition-colors duration-200 group-hover:text-blue-400"
          />
          <span className="relative z-10 text-sm font-medium text-slate-400 transition-colors duration-200 group-hover:text-blue-400">
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
