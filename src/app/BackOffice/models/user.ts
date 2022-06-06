export class User {
    id: number = 0;
    name: string;
    nif: number;
    address: string;
    phone: number;
    function: string;
    password: string;
    avatar: string;
    sessionStarted: Date = new Date();
    sessionEnded: Date = new Date();
    active: boolean = true;
    synchronized: boolean = false;
}