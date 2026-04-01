export interface TicketResponse {
  id: number;
  type: 'entry' | 'sale' | 'change' | 'removed' | 'damaged' | 'partial_damaged';
  status: string;
  assigned_to: number;
  vehicle_id: number | null;
  quantity: number;
  description: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_user: {
    id: number;
    name: string;
  };
  details: {
    id: number;
    ticket_id: number;
    package_id: number;
    status: string;
    moved_to_pallet: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    package: {
      id: number;
      batch_number: string;
      book_id: number;
      pallet_id: number;
      book_quantity: number;
      status: string;
      created_at: string;
      updated_at: string;
    };
    pallet: {
      id: number;
      pallet_code: string;
      warehouse_location: string;
      status: string;
      max_packages_capacity: number;
    };
  }[];
}
