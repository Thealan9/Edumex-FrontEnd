import { Book } from "./book.model";
import { Pallet } from "./pallet.model";

export interface PackageResponse {
  id: number;
  batch_number: string;
  book: {
    id: number;
    title: string;
  };
  pallet:{
      id: number;
      pallet_code: string;
    };
  book_quantity: number;
  status: string;
}
