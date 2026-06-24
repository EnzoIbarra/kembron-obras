import { DraftingCompass } from 'lucide-react';
import { LogoutButton } from '@/domains/usuarios/components/LogoutButton';

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <DraftingCompass size={18} className="text-blue-500" />
          <span className="font-bold text-gray-900">Kembron Obras</span>
        </div>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
