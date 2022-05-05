import { Component, OnInit, ViewEncapsulation, OnDestroy, Inject } from '@angular/core';
import { Observable, Subscription, combineLatest, map, of } from 'rxjs';
import { Cliente } from '../../models/cliente';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { ClientesService } from './clientes.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ClientesComponent implements OnInit {

  public header: any
  public sticky: any;

  constructor(public dialog: MatDialog, private clientesService: ClientesService, private onlineOfflineService: OnlineOfflineService, private toastr: ToastrService) { }

  //public cliente: Cliente = new Cliente();
  public clientes!: Observable<Cliente[]>; //save the clients returned from the API
  public clientesOff!: Observable<Cliente[]>; //save the clients returned from the local storage
  public allClientesData!: Observable<Cliente[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table

  displayedColumns: string[] = ['name', 'nif', 'phone', 'county', 'state']; //declare columns of the table
  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  ngOnInit(): void {

    //list data on init
    this.listLocalData();
    // this.listAPIdata();
    // this.listAllData();

    //subscribe to refresh data, when data is changed
    this.subscriptionData = this.clientesService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.listLocalData();
      // this.listAllData();
    });

    //this.clientesService.getDataOffline();
    /*this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.list();
        this.clientesService.getDataOffline();
      }
    });*/
  }

  //register data in API or local storage
  async register(cliente: Cliente) {
    await this.clientesService.register(cliente);
  }

  //update data in API or local storage
  async update(cliente: Cliente) {
    await this.clientesService.update(cliente);
  }

  async delete(cliente: Cliente) {
    await this.clientesService.delete(cliente);
  }

  //search data from API
  listAPIdata(): void {
    this.clientes = this.clientesService.list();
  }

  //search data from local storage
  async listLocalData() {
    //this.clientesOff = this.clientesService.getDataOffline();
    this.showProgressBar = true;

    this.clientesOff = this.clientesService.getDataOffline();
    setInterval(() => {
      this.showProgressBar = false;
    }, 1300); //wait 1,30 seconds to show progress bar

  }

  //save data of all clients from API and local storage
  listAllData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.allClientesData = combineLatest(this.clientes, this.clientesOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        );
        break;

      case 'localidade'://order by localidade
        this.allClientesData = combineLatest(this.clientes, this.clientesOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.county.localeCompare(b.county)))
        );
        break;

      case 'id'://order by id
        this.allClientesData = combineLatest(this.clientes, this.clientesOff).pipe(
          map(([a, b]) => a.concat(b))
        );
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.clientesService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateClientModalComponent, {
      height: '690px',
      width: '770px',
    });
    dialogRef.afterClosed().subscribe(cliente => {
      //console.log(cliente)
      if (cliente) {
        this.register(cliente);
      }
    });
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    if (data) {
      const dialogRef = this.dialog.open(CreateClientModalComponent, {
        height: '690px',
        width: '770px',
        data: { values: data, update: true }
      });
      dialogRef.afterClosed().subscribe(cliente => {
        // console.log(cliente)
        if (cliente) {
          this.update(cliente);
        }
      });
    } else {
      this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    }
  }

  //function that opens the delete client modal
  openDeleteModal(data: any) {
    if (data) {
      const dialogRef = this.dialog.open(DeleteModalComponent, {
        height: '30%',
        width: '50%',
        data: { values: data }
      });
      dialogRef.afterClosed().subscribe(cliente => {
        // console.log(cliente)
        if (cliente) {
          this.delete(cliente);
        }
      });
    } else {
      this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    }
    // if (data) {
    //   this.clientesService.delete(data);
    // } else {
    //   this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    // }
  }

  //function to know which line is selected
  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
  }

  //function event to change the order by
  onOptionsSelected() {
    this.listAllData();
  }

  //function to unselect the selected row
  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  //when component is closed, unsubscribe from the observable to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

}

/////////////////////////// // CREATE CLIENT MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-client',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./clientes.component.scss'],
})

export class CreateClientModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { }

  public cliente: Cliente = new Cliente(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  ngOnInit(): void {
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.cliente = this.data.values; //set the data in the form
    }
  }

  //open the modal keyboard
  openKeyboard(inputName: string, type: string, data: any, maxLength?: number) {
    //verify if type is number or text to open the respective keyboard
    if (type == 'text') { //if text
      this.dialogRef = this.dialog.open(VirtualKeyboardComponent, {
        height: '57%',
        width: '48%',
        data: [inputName, type, data, maxLength]
      });
    } else { //else is number
      this.dialogRef = this.dialog.open(VirtualKeyboardComponent, {
        height: '72%',
        width: '48%',
        data: [inputName, type, data, maxLength]
      });
    }

    this.dialogRef.afterClosed().subscribe((result: any) => {
      //switch to know which input is changed
      switch (result[1][0]) {
        case 'name':
          this.cliente.name = result[0];
          break;
        case 'phone':
          this.cliente.phone = result[0];
          break;
        case 'nif':
          this.cliente.nif = result[0];
          break;
        case 'address':
          this.cliente.address = result[0];
          break;
        case 'postalCode':
          this.cliente.postalCode = result[0];
          break;
        case 'parish':
          this.cliente.parish = result[0];
          break;
        case 'county':
          this.cliente.county = result[0];
          break;
      }
    });
  }
}