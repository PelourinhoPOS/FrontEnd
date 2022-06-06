export class Artigo {
    id: number;
    name: string;
    description: string;
    unity: string;
    isMenu: boolean;
    image: string;
    id_category: number;
    abbreviation: string;
    
    price: number;
    pvp1: number;
    pvp2: number;
    pvp3: number;
    pvp4: number;
    pvp5: number;
    pvp6: number;
    iva: number;
    
    sub_unity: string;
    
    name_category?: string;
    synchronized?: boolean = false;
}