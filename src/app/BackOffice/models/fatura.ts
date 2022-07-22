export class Fatura {
    id: number;
    pagamento: number;
    user: number;
    zona: number;
    mesa: number;
    cliente: number;
    date: string;
    time: number;
    artigos: any [];
    subtotal_no_iva: number;
    subtotal_iva: number;
    synchronized: boolean = false;
}