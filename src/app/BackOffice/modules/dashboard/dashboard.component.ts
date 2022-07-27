import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../clientes/clientes.service';
import * as moment from 'moment';
import { DocHeaderService } from '../documents/doc-header.service';
import { DocProductsService } from '../documents/doc-products.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private clientesService: ClientesService, private docHeadersService: DocHeaderService, private docProductsService: DocProductsService) { }

  nClientes: number;
  totalClientes: number;

  nVendas: number;
  totalVendas: number;

  nProdutos: number;
  totalProdutos: number;

  today: any;

  ngOnInit(): void {
    moment.locale('pt-pt');
    this.today = moment().format('L');

    this.getClientes();
    this.getVendas();
    this.getProdutos();

  }

  //getClientes
  getClientes() {
    this.clientesService.getCountLocalData('registerDate', this.today).then(data => {
      this.nClientes = data;
    });

    this.clientesService.getDataOffline().subscribe(data => {
      this.totalClientes = data.length-1;
    });
  }

  getVendas() {
    this.docHeadersService.getCountLocalData('date', this.today).then(data => {
      this.nVendas = data;
    });

    this.docHeadersService.getDataOffline().subscribe(data => {
      this.totalVendas = data.length;
    });
  }

  public array: any[] = [];

  getProdutos(){
    this.docProductsService.getDataOffline().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        
        this.array.push(data[i].quantity);

      }
      this.nProdutos = this.array.reduce((a, b) => a + b, 0);
      console.log(this.nProdutos);
    });
  }

}
