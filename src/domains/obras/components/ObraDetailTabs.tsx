'use client';

import * as Tabs from '@radix-ui/react-tabs';

const TABS = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'presupuesto', label: 'Presupuesto' },
  { value: 'avance', label: 'Avance' },
] as const;

export function ObraDetailTabs() {
  return (
    <Tabs.Root defaultValue="resumen">
      {/* Tab list — scrollable on narrow viewports */}
      <Tabs.List className="flex overflow-x-auto border-b border-gray-200 gap-0 scrollbar-none">
        {TABS.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="shrink-0 px-4 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent
              hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap
              data-[state=active]:text-blue-600 data-[state=active]:border-blue-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          >
            {label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="resumen" className="pt-6">
        <p className="text-sm text-gray-400">Resumen — próximamente</p>
      </Tabs.Content>

      <Tabs.Content value="presupuesto" className="pt-6">
        <p className="text-sm text-gray-400">Presupuesto — próximamente</p>
      </Tabs.Content>

      <Tabs.Content value="avance" className="pt-6">
        <p className="text-sm text-gray-400">Avance — próximamente</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}
