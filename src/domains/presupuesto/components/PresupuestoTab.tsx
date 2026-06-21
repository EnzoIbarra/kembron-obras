'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { TitulosItemsSubTab } from './TitulosItemsSubTab';
import { AdicionalesDeductivosSubTab } from './AdicionalesDeductivosSubTab';

type Props = { obraId: string };

const SUB_TABS = [
  { value: 'titulos', label: 'Títulos e ítems' },
  { value: 'adicionales', label: 'Adicionales y deductivos' },
  { value: 'gastos', label: 'Gastos' },
] as const;

export function PresupuestoTab({ obraId }: Props) {
  return (
    <Tabs.Root defaultValue="titulos">
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

      <Tabs.Content value="titulos">
        <TitulosItemsSubTab obraId={obraId} />
      </Tabs.Content>

      <Tabs.Content value="adicionales">
        <AdicionalesDeductivosSubTab obraId={obraId} />
      </Tabs.Content>

      <Tabs.Content value="gastos">
        <p className="text-sm text-gray-400">Gastos — próximamente</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}
