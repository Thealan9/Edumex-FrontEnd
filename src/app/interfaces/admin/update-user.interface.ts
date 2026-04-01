import { User } from "./user.model";

export interface UpdateUserResponse {
  message: string;
  user: User;
}
