import { UserRole } from "./role.type";

export interface User {
  id?: number;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'admin' | 'warehouseman' | 'user';
  customer_type: 'individual' | 'institutional';
  institution_name?: string;
  tax_id?: string; // rfc
  address?: string;
  postal_code?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
