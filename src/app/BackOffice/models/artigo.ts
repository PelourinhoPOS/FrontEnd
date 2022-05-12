export class Artigo {
    id: number;
    name: string;
    price: number;
    iva: number;
    weight: number;
    id_category: number;
    name_category?: string;
    image: string;
    synchronized?: boolean = false;
}