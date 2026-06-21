export type ProgramacionCellDto = {
  itemId: string;
  weekNumber: number;
  plannedQuantity: string;
};

// Client-side grid state: itemId → weekNumber → quantity string
export type ScheduleMap = Record<string, Record<number, string>>;
