export class Artigo {
    id: number;
    name: string;
    price: number;
    iva: number;
    unity: string;
    sub_unity: string;
    unity_value: string;
    id_category: number;
    id_subcategory: number;
    name_category?: string;
    image: string;
    description: string;
    synchronized?: boolean = false;
}