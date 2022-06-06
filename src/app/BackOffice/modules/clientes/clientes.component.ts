import { Component, OnInit, ViewEncapsulation, OnDestroy, Inject, AfterViewInit, ViewChild } from '@angular/core';
import { Observable, Subscription, combineLatest, map, of } from 'rxjs';
import { Cliente } from '../../models/cliente';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { ClientesService } from './clientes.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { createMask } from '@ngneat/input-mask';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ClientesComponent implements OnInit, AfterViewInit {

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

  teste = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource<Cliente>();

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  ngOnInit(): void {
    //list data on init
    this.listLocalData();
    // this.listAPIdata();
    // this.listAllData();

    this.translatePaginator(this.paginator);

    //subscribe to refresh data, when data is changed
    this.subscriptionData = this.clientesService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.listLocalData();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(cliente: Cliente) {
    await this.clientesService.register(cliente).then(() => {
      this.toastr.success('Cliente registado com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(cliente: Cliente) {
    await this.clientesService.update(cliente).then(() => {
      console.log();
      this.toastr.success('Cliente atualizado com sucesso.');
    }).catch((err) => {
      err
    });
  }

  async delete(cliente: Cliente) {
    await this.clientesService.delete(cliente).then(() => {
      this.toastr.success('Cliente eliminado com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //search data from API
  listAPIdata(): void {
    this.clientes = this.clientesService.list();
  }

  //search data from local storage
  async listLocalData() {
    this.showProgressBar = true;

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.clientesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe(data => {
          this.clientesOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'localidade'://order by county
        this.clientesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.county.localeCompare(b.county)))
        ).subscribe(data => {
          this.clientesOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'id':
        this.clientesService.getDataOffline().subscribe(data => {
          this.clientesOff = of(data);
          this.dataSource.data = data
        })
        break;
    }

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
      width: '790px',
    });
    dialogRef.afterClosed().subscribe(cliente => {
      if (cliente) {
        this.register(cliente);
      }
    });
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    this.clientesOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (data) {
          const dialogRef = this.dialog.open(CreateClientModalComponent, {
            height: '690px',
            width: '770px',
            data: { values: data, update: true }
          });
          dialogRef.afterClosed().subscribe(cliente => {
            if (cliente) {
              this.update(cliente);
            }
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem clientes para editar', 'Aviso');
      }
    });
  }

  //function that opens the delete client modal
  openDeleteModal(data: any) {
    this.clientesOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (data) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '30%',
            width: '50%',
            data: { values: data }
          });
          dialogRef.afterClosed().subscribe(cliente => {
            if (cliente) {
              this.delete(cliente);
            }
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem clientes para eliminar', 'Aviso');
      }
    })
  }

  //function to know which line is selected
  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
  }

  //function event to change the order by
  onOptionsSelected() {
    this.listLocalData();
  }

  //function to unselect the selected row
  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  translatePaginator(paginator: MatPaginator) {
    paginator._intl.firstPageLabel = 'Primeira Página';	//first page label
    paginator._intl.lastPageLabel = 'Última Página';	//last page label
    paginator._intl.nextPageLabel = 'Próxima Página';	//next page label
    paginator._intl.previousPageLabel = 'Página Anterior';  //previous page label
    paginator._intl.itemsPerPageLabel = 'Itens por página'; //items per page label
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private fb: FormBuilder, public dialogRefCreate: MatDialogRef<CreateClientModalComponent>, public toastr: ToastrService) { }

  public cliente: Cliente = new Cliente(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  myForm: FormGroup; //save the form

  postalCodeInputMask = createMask('9999-999'); //create the input mask for the postal code

  ngOnInit(): void {

    this.myForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      phone: new FormControl('', [Validators.required, Validators.maxLength(9), Validators.minLength(9), Validators.pattern('[0-9]*')]),
      nif: new FormControl('', [Validators.required, Validators.maxLength(9), Validators.minLength(9), Validators.pattern('[0-9]*')]),
      address: new FormControl('', [Validators.required, Validators.minLength(5)]),
      postalCode: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      parish: new FormControl('', [Validators.required, Validators.minLength(3)]),
      county: new FormControl('', [Validators.required, Validators.minLength(3)]),
    })
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.cliente.id = this.data.values.id;
      this.myForm.get('name').setValue(this.data.values.name);
      this.myForm.get('phone').setValue(this.data.values.phone);
      this.myForm.get('nif').setValue(this.data.values.nif);
      this.myForm.get('address').setValue(this.data.values.address);
      this.myForm.get('postalCode').setValue(this.data.values.postalCode);
      this.myForm.get('parish').setValue(this.data.values.parish);
      this.myForm.get('county').setValue(this.data.values.county);
      ; //set the data in the form
    }
  }

  get name() {
    this.cliente.name = this.myForm.get('name').value;
    return this.myForm.get('name');
  }

  get phone() {  //get the phone number
    this.cliente.phone = this.myForm.get('phone').value;
    return this.myForm.get('phone');
  }

  get nif() { //get the nif
    this.cliente.nif = this.myForm.get('nif').value;
    return this.myForm.get('nif');
  }

  get address() {   //get the address
    this.cliente.address = this.myForm.get('address').value;
    return this.myForm.get('address');
  }

  get codPostal() {  //get the postal code
    this.cliente.postalCode = this.myForm.get('postalCode').value;
    return this.myForm.get('postalCode');
  }

  get parish() {  //get the parish
    this.cliente.parish = this.myForm.get('parish').value;
    return this.myForm.get('parish');
  }

  get county() {  //get the county
    this.cliente.county = this.myForm.get('county').value;
    return this.myForm.get('county');
  }

  submitForm() {
    if (this.myForm.valid) {
      this.dialogRefCreate.close(this.cliente);
    } else {
      this.toastr.error('Existem erros no formulário.', 'Aviso');
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
          this.myForm.get('name').setValue(result[0]);
          break;
        case 'phone':
          this.myForm.get('phone').setValue(result[0]);
          break;
        case 'nif':
          this.myForm.get('nif').setValue(result[0]);
          break;
        case 'address':
          this.myForm.get('address').setValue(result[0]);
          break;
        case 'postalCode':
          this.myForm.get('postalCode').setValue(result[0]);
          break;
        case 'parish':
          this.myForm.get('parish').setValue(result[0]);
          break;
        case 'county':
          this.myForm.get('county').setValue(result[0]);
          break;
      }
    });
  }
}