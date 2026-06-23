'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { useCreateUsuario, useUpdateUsuario } from '../hooks/useUsuarios';
import { createUsuarioSchema, updateUsuarioSchema } from '../types/schemas';
import type { CreateUsuarioValues, UpdateUsuarioValues } from '../types/schemas';
import type { UsuarioDto } from '../types';

const inputCls =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full';
const labelCls = 'text-sm font-medium text-gray-700';
const errorCls = 'text-xs text-red-500';

type CreateProps = { mode: 'create'; open: boolean; onOpenChange: (v: boolean) => void };
type EditProps = {
  mode: 'edit';
  usuario: UsuarioDto;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};
type Props = CreateProps | EditProps;

export function UsuarioFormDialog(props: Props) {
  const { mode, open, onOpenChange } = props;
  const usuario = mode === 'edit' ? props.usuario : undefined;

  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const mutation = mode === 'create' ? createMutation : updateMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUsuarioValues | UpdateUsuarioValues>({
    resolver: zodResolver(mode === 'create' ? createUsuarioSchema : updateUsuarioSchema),
    defaultValues:
      mode === 'edit'
        ? { username: usuario?.username, role: usuario?.role, password: '' }
        : { role: 'SUPERVISOR' },
  });

  useEffect(() => {
    if (open && mode === 'edit') {
      reset({ username: usuario?.username, role: usuario?.role, password: '' });
    }
    if (open && mode === 'create') {
      reset({ role: 'SUPERVISOR' });
    }
  }, [open, mode, usuario, reset]);

  async function onSubmit(values: CreateUsuarioValues | UpdateUsuarioValues) {
    if (mode === 'create') {
      await (createMutation as ReturnType<typeof useCreateUsuario>).mutateAsync(
        values as CreateUsuarioValues,
      );
    } else {
      await (updateMutation as ReturnType<typeof useUpdateUsuario>).mutateAsync({
        id: usuario!.id,
        data: values as UpdateUsuarioValues,
      });
    }
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) mutation.reset();
    onOpenChange(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              {mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="uf-username" className={labelCls}>Usuario</Label.Root>
              <input
                id="uf-username"
                {...register('username')}
                autoComplete="off"
                className={inputCls}
              />
              {errors.username && <p className={errorCls}>{errors.username.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="uf-role" className={labelCls}>Rol</Label.Root>
              <select id="uf-role" {...register('role')} className={inputCls}>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
              </select>
              {errors.role && <p className={errorCls}>{errors.role.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="uf-password" className={labelCls}>
                {mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
              </Label.Root>
              <input
                id="uf-password"
                type="password"
                {...register('password')}
                placeholder={mode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
                autoComplete="new-password"
                className={inputCls}
              />
              {errors.password && <p className={errorCls}>{errors.password.message}</p>}
            </div>

            {mutation.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {mutation.error.message}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {mutation.isPending
                  ? 'Guardando…'
                  : mode === 'create'
                    ? 'Crear usuario'
                    : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
