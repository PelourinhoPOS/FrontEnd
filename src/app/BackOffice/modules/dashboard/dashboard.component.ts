import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../clientes/clientes.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private clientesService: ClientesService) { }

  nClientes: any;
  totalClientes: any;
  today = new Date().toJSON().slice(0, 10);

  ngOnInit(): void {
    this.getClientes();
  }

  //getClientes
  getClientes() {
    this.clientesService.getCountLocalData('registerDate', this.today).then(data => {
      this.nClientes = data;
    });

    this.clientesService.getDataOffline().subscribe(data => {
      this.totalClientes = data.length;
    })
  }

}
