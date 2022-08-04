import { Component, OnInit } from '@angular/core';
import { ClientesService } from '../clientes/clientes.service';
import * as moment from 'moment';
import { DocHeaderService } from '../documents/doc-header.service';
import { DocProductsService } from '../documents/doc-products.service';
import { ArtigosService } from '../artigos/artigos.service';
import { DocLinesService } from '../documents/doc-lines.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private clientesService: ClientesService, private artigosService: ArtigosService, private docHeadersService: DocHeaderService, private docProductsService: DocProductsService, private docLinesService: DocLinesService) { }

  nClientes: number;
  totalClientes: number;

  nVendas: number;
  totalVendas: number;

  nProdutos: number;
  totalProdutos: number;
  prodArray: any[] = []; //save the products quantity in an array, for that sum all the array elements
  lastProduct: any;

  totalPrices: any[] = [];
  totalCashInBox: number;

  today: any;
  todayLong: any;

  ngOnInit(): void {
    moment.locale('pt-pt');
    this.today = moment().format('L');
    this.todayLong = moment().format('LL');

    this.getClientes();
    this.getVendas();
    this.getProdutos();
    this.getCashInBox();

  }

  //getClientes
  getClientes() {
    this.clientesService.getCountLocalData('registerDate', this.today).then(data => {
      this.nClientes = data;
    });

    this.clientesService.getDataOffline().subscribe(data => {
      this.totalClientes = data.length - 1;
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

  getProdutos() {
    this.docProductsService.getDataOffline().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.prodArray.push(data[i].quantity);
      }
      this.nProdutos = this.prodArray.reduce((a, b) => a + b, 0);
      let lastProduct = data[data.length - 1];

      this.artigosService.getDataOffline().subscribe((data: any) => {
        this.lastProduct = data.filter(x => x.id === lastProduct.id_article)[0].name;
      });
    });
  }

  getCashInBox() {
    this.docHeadersService.getDataOffline().subscribe(data => {
      
      let docHeaderData = data.filter(x => x.date === this.today);

      if (docHeaderData.length > 0) {
        for (let i = 0; i < docHeaderData.length; i++) {
          this.docLinesService.getDataOffline().subscribe(data => {
            let docLineData = data.filter(x => x.id_doc_header === docHeaderData[i].id);
            this.totalPrices.push(docLineData[0].subtotal_iva + docLineData[0].subtotal_no_iva);
            this.totalCashInBox = this.totalPrices.reduce((a, b) => a + b, 0);
          });
        }
      } else {
        this.totalCashInBox = 0;
      }
      
    });
  }
}