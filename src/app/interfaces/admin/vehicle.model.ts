export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  is_active: boolean;
  is_available: boolean;
  driver_id: number | null;
}
