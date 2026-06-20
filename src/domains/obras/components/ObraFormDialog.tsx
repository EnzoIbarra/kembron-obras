'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ObraForm } from './ObraForm';
import type { ObraDto } from '../types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra?: ObraDto | null;
};

export function ObraFormDialog({ open, onOpenChange, obra }: Props) {
  const title = obra ? 'Editar obra' : 'Nueva obra';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Dialog.Close>
          </div>

          <ObraForm obra={obra} onSuccess={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
