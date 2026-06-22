'use client';

import { useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ProgramacionSubTab } from './ProgramacionSubTab';
import { AvanceRealSubTab } from './AvanceRealSubTab';

type Props = {
  obraId: string;
  startDate: string;
  theoreticalEndDate: string;
};

const SUB_TABS = [
  { value: 'programacion', label: 'Programación' },
  { value: 'avance-real', label: 'Avance real' },
  { value: 'gantt', label: 'Gantt' },
] as const;

export function AvanceTab({ obraId, startDate, theoreticalEndDate }: Props) {
  const startDateObj = useMemo(() => new Date(startDate), [startDate]);
  const endDateObj = useMemo(() => new Date(theoreticalEndDate), [theoreticalEndDate]);

  return (
    <Tabs.Root defaultValue="programacion">
      <Tabs.List className="flex overflow-x-auto border-b border-gray-200 scrollbar-none mb-6">
        {SUB_TABS.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="shrink-0 px-4 py-2.5 text-sm font-medium text-gray-500 border-b-2 border-transparent
              hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap
              data-[state=active]:text-blue-600 data-[state=active]:border-blue-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="programacion">
        <ProgramacionSubTab obraId={obraId} startDate={startDateObj} theoreticalEndDate={endDateObj} />
      </Tabs.Content>

      <Tabs.Content value="avance-real">
        <AvanceRealSubTab obraId={obraId} />
      </Tabs.Content>

      <Tabs.Content value="gantt">
        <p className="text-sm text-gray-400">Gantt — próximamente</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}
