import { UsuariosView } from '@/domains/usuarios/components/UsuariosView';

export const metadata = { title: 'Usuarios — Kembron' };

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="mt-1 text-sm text-gray-500">Gestión de accesos y asignaciones</p>
      </div>
      <UsuariosView />
    </div>
  );
}
