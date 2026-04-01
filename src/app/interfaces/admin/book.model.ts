export interface Book {
  id: number;
  title: string;
  isbn: string;
  level: string;
  price: number;
  quantity: number;
  discount: number;
  price_unit: number;
  description: string;
  autor: string;
  active: boolean;
  pages: number;
  year: number;
  edition: number;
  format: 'Bolsillo' | 'Tapa Blanda' | 'Tapa Dura';
  size: string;
  supplier: string;
}
