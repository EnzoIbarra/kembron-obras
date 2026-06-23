export type UsuarioDto = {
  id: string;
  username: string;
  role: 'ADMIN' | 'SUPERVISOR';
  createdAt: string;
  assignments: { obraId: string; obraName: string }[];
};
