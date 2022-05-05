export class Cliente {
    id: number = 0;
    name: string = "";
    phone!: number;
    nif!: number;
    address: string = "";
    postalCode: string = "";
    parish: string = "";
    county: string = "";
    synchronized: boolean = false;
}