export type ProgramacionCellDto = {
  itemId: string;
  weekNumber: number;
  plannedQuantity: string;
};

// Client-side grid state: itemId → weekNumber → quantity string
export type ScheduleMap = Record<string, Record<number, string>>;

export type RegistroDto = {
  id: string;
  advancedQuantity: string;
  date: string; // YYYY-MM-DD
  userName: string;
};

export type ItemAvanceDto = {
  id: string;
  name: string;
  unit: string;
  theoreticalAmount: string;
  registros: RegistroDto[];
};

export type TituloAvanceDto = {
  id: string;
  name: string;
  items: ItemAvanceDto[];
};

export type AvanceRealDto = {
  titulos: TituloAvanceDto[];
};
