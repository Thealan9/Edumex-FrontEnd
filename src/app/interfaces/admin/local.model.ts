import { User } from './user.model';

export interface Local {
  id: number;
  name: string;
  address?: string;
  active: boolean;
  user: User;
}
