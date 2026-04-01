export interface Location {
  id?: number;
  code: string;           // Ej: 'ESTANTE-A1'
  max_capacity: number;   // Límite de unidades
  current_capacity: number; // Cantidad actual ocupada
  created_at?: string;
}
