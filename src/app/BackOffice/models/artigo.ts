export class Artigo {
    id: number;
    name: string;
    price: number;
    pvp1: number;
    pvp2: number;
    pvp3: number;
    pvp4: number;
    pvp5: number;
    pvp6: number;
    iva: number;
    unity: string;
    sub_unity: string;
    //unity_value: string;
    id_category: number;
    id_subcategory: number;
    name_category?: string;
    image: string;
    description: string;
    stock: number;
    synchronized?: boolean = false;
}