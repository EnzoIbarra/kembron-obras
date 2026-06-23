import { DashboardView } from '@/domains/obras/components/DashboardView';

export const metadata = { title: 'Dashboard — Kembron' };

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Resumen global de obras</p>
      </div>
      <DashboardView />
    </div>
  );
}
