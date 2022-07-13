export class Mesa {
    id: any;
    id_zone?: number;
    name?: string;
    capacity?: number;
    number?: number;
    occupy?: number;
    cart?: any;
    total?: number;
    type?: string;
    synchronized?: boolean;
    dragPosition?: {
        x: number,
        y: number,
    }
    boardType?: string;
}