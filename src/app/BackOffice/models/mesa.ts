export class Mesa {
    id: any;
    name?: string;
    capacity?: number;
    number?: number;
    occupy?: number;
    cart?: any;
    total?: number;
    type?: string;
    dragPosition?: {
        x: number,
        y: number,
    }
    bottom?: number;
    height?: number;
    left?: number;
    right?: number;
    top?: number;
    width?: number;

    synchronized?: boolean = false;
}