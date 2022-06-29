export class Cliente {
    id: number = 0;
    name: string = "";
    phone!: number;
    nif!: number;
    address: string = "";
    postalCode: string = "";
    parish: string = "";
    county: string = "";
    lastUpdate: string;
    registerDate: string;
    synchronized: boolean = false;
}