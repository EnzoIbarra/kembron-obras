'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { format } from 'date-fns';
import { ObraStatus } from '../types';
import { obraSchema, type ObraFormValues } from '../types/schemas';
import { useCreateObra, useUpdateObra } from '../hooks/useObras';
import type { ObraDto } from '../types';

const STATUS_LABEL: Record<ObraStatus, string> = {
  EN_EJECUCION: 'En ejecución',
  FINALIZADA: 'Finalizada',
  PAUSADA: 'Pausada',
};

type Props = {
  obra?: ObraDto | null;
  onSuccess: () => void;
};

function toDateInput(iso: string) {
  return format(new Date(iso), 'yyyy-MM-dd');
}

export function ObraForm({ obra, onSuccess }: Props) {
  const isEdit = !!obra;
  const createMutation = useCreateObra();
  const updateMutation = useUpdateObra();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
    defaultValues: obra
      ? {
          name: obra.name,
          location: obra.location,
          client: obra.client,
          status: obra.status as ObraStatus,
          startDate: toDateInput(obra.startDate),
          theoreticalEndDate: toDateInput(obra.theoreticalEndDate),
        }
      : { status: ObraStatus.EN_EJECUCION },
  });

  useEffect(() => {
    if (obra) {
      reset({
        name: obra.name,
        location: obra.location,
        client: obra.client,
        status: obra.status as ObraStatus,
        startDate: toDateInput(obra.startDate),
        theoreticalEndDate: toDateInput(obra.theoreticalEndDate),
      });
    } else {
      reset({ status: ObraStatus.EN_EJECUCION });
    }
  }, [obra, reset]);

  async function onSubmit(values: ObraFormValues) {
    if (isEdit) {
      await (updateMutation.mutateAsync as (args: { id: string; data: ObraFormValues }) => Promise<unknown>)({ id: obra!.id, data: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    onSuccess();
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
      {mutation.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {mutation.error.message}
        </p>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="name" className="text-sm font-medium text-gray-700">
          Nombre de la obra
        </Label.Root>
        <input
          id="name"
          {...register('name')}
          placeholder="Ej: Edificio Río Norte"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="location" className="text-sm font-medium text-gray-700">
          Ubicación
        </Label.Root>
        <input
          id="location"
          {...register('location')}
          placeholder="Ej: Av. Libertador 1200, Buenos Aires"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
      </div>

      {/* Client */}
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="client" className="text-sm font-medium text-gray-700">
          Cliente
        </Label.Root>
        <input
          id="client"
          {...register('client')}
          placeholder="Ej: Constructora Omega S.A."
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {errors.client && <p className="text-xs text-red-500">{errors.client.message}</p>}
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1">
        <Label.Root className="text-sm font-medium text-gray-700">Estado</Label.Root>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select.Root value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                <Select.Value placeholder="Seleccioná un estado" />
                <Select.Icon className="ml-2 text-gray-400">▾</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="z-50 min-w-[8rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  position="popper"
                  sideOffset={4}
                >
                  <Select.Viewport>
                    {(Object.entries(STATUS_LABEL) as [ObraStatus, string][]).map(([value, label]) => (
                      <Select.Item
                        key={value}
                        value={value}
                        className="flex cursor-pointer items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 outline-none"
                      >
                        <Select.ItemText>{label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          )}
        />
        {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Inicio
          </Label.Root>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="theoreticalEndDate" className="text-sm font-medium text-gray-700">
            Fin teórico
          </Label.Root>
          <input
            id="theoreticalEndDate"
            type="date"
            {...register('theoreticalEndDate')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.theoreticalEndDate && (
            <p className="text-xs text-red-500">{errors.theoreticalEndDate.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear obra'}
        </button>
      </div>
    </form>
  );
}
