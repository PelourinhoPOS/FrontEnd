export class Artigo {
    id: number;
    name: string;
    price: number;
    iva: number;
    weight: number;
    id_category: number;
    image: string;
    synchronized?: boolean = false;
}