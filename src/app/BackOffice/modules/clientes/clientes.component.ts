import { Component, OnInit, ViewEncapsulation, OnDestroy, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subscription, combineLatest, map, of } from 'rxjs';
import { Cliente } from '../../models/cliente';
import { ClientesService } from './clientes.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { createMask } from '@ngneat/input-mask';
import { SelectionModel } from '@angular/cdk/collections';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ClientesComponent implements OnInit, AfterViewInit {

  public header: any
  public sticky: any;

  constructor(private _liveAnnouncer: LiveAnnouncer, public dialog: MatDialog, private clientesService: ClientesService, private toastr: ToastrService) { }

  //public cliente: Cliente = new Cliente();
  public clientes!: Observable<Cliente[]>; //save the clients returned from the API
  public clientesOff!: Observable<Cliente[]>; //save the clients returned from the local storage
  public allClientesData!: Observable<Cliente[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  public dialogRef: any; //save the dialog reference

  selectedRowIndex = -1; //save the selected index from the table
  selectedRowIds: Set<number> = new Set<number>();
  selectedId: string;

  displayedColumns: string[] = ['select', 'name', 'nif', 'phone', 'county', 'state']; //declare columns of the table
  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource<Cliente>();
  selection = new SelectionModel<Cliente>(true, []);

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
    await this.clientesService.register(cliente).then((cliente) => {
      if (cliente) {
        this.toastr.success('Cliente registado com sucesso.');
      }
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(cliente: Cliente) {
    await this.clientesService.update(cliente).then((cliente) => {
      if (cliente) {
        this.toastr.success('Cliente atualizado com sucesso.');
      }
    }).catch((err) => {
      err
    });
  }

  async delete(cliente: Cliente) {
    await this.clientesService.delete(cliente).then((cliente) => {
      if (cliente) {
        this.toastr.success('Cliente eliminado com sucesso.');
      }
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

    this.selection.clear();
    this.selectedRowIds.clear();
    this.unselectRow();

    setInterval(() => {
      this
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
    this.selection.clear();
    this.selectedRowIds.clear();
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
    if (data) {
      this.selection.select(data);
      this.selectedRowIds.add(data.id);
    }
    if (this.selection.selected.length == 1) {
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
    } else {
      if (this.selection.selected.length == 0) {
        this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
      } else {
        this.toastr.warning('Apenas pode selecionar um registo para atualizar!');
      }
    }
  }

  //function that opens the delete client modal
  openDeleteModal() {
    this.clientesOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (this.selection.selected.length > 0) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '40%',
            width: '50%',
            data: { values: this.selection.selected, component: 'Cliente' }
          });
          dialogRef.afterClosed().subscribe(cliente => {
            if (cliente) {
              cliente.forEach(data => {
                this.delete(data);
              });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //function to know which line is selected
  // onRowClicked(row: any) {
  //   if (this.selectedRowIndex != row.id) {
  //     this.selection.clear();
  //   }
  //   this.selectedRowIndex = row.id;
  //   this.dataRow = row;
  //   this.selection.toggle(row);
  // }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedRowIds.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.selectedRowIds.add(this.dataSource.data[i].id);
    }
    this.unselectRow();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Cliente): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (this.selection.selected.length > 1) {
      this.unselectRow();
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  onRowClicked(row: Cliente) {
    if (this.selectedRowIndex != row.id) {
      this.selection.clear();
      this.selectedRowIds.clear();
    }
    if (this.selectedRowIds.has(row.id)) {
      this.selectedRowIds.delete(row.id);
      this.selection.toggle(row);
    } else {
      this.selectedRowIds.add(row.id);
      this.selectedRowIndex = row.id;
      this.dataRow = row;
      this.selection.toggle(row);
    }
  }

  rowIsSelected(id: number) {
    return this.selectedRowIds.has(id);
  }

  onCheckBoxClicked(row: Cliente) {
    if (this.selectedRowIds.has(row.id)) {
      this.selectedRowIds.delete(row.id);
    } else {
      this.selectedRowIds.add(row.id);
    }
    this.dataRow = this.selection.selected.length > 0 ? this.selection.selected[0] : null;
    this.selectedRowIndex = this.dataRow ? this.dataRow.id : null;
  }

  //function event to change the order by
  onOptionsSelected() {
    this.listLocalData();
    //this.listAllData();
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

  value: any;

  @ViewChild('input') input: ElementRef;

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
        case 'search':
          this.value = result[0];
      }
    });
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public dialogRefCreate: MatDialogRef<CreateClientModalComponent>, public toastr: ToastrService) { }

  public cliente: Cliente = new Cliente(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  clientsForm: FormGroup; //save the form

  postalCodeInputMask = createMask('9999-999'); //create the input mask for the postal code

  ngOnInit(): void {

    this.clientsForm = new FormGroup({
      id: new FormControl(''),
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
      this.update = true;
      this.cliente = this.data.values;

      this.id.setValue(this.cliente.id);
      this.name.setValue(this.cliente.name);
      this.name.setValue(this.cliente.name);
      this.phone.setValue(this.cliente.phone);
      this.nif.setValue(this.cliente.nif);
      this.address.setValue(this.cliente.address);
      this.postalCode.setValue(this.cliente.postalCode);
      this.parish.setValue(this.cliente.parish);
      this.county.setValue(this.cliente.county);
      //set the data in the form
    }
  }

  get id() {
    return this.clientsForm.get('id');
  }

  get name() {
    return this.clientsForm.get('name');
  }

  get phone() {  //get the phone number
    return this.clientsForm.get('phone');
  }

  get nif() { //get the nif
    return this.clientsForm.get('nif');
  }

  get address() {   //get the address
    return this.clientsForm.get('address');
  }

  get postalCode() {  //get the postal code
    return this.clientsForm.get('postalCode');
  }

  get parish() {  //get the parish
    return this.clientsForm.get('parish');
  }

  get county() {  //get the county
    return this.clientsForm.get('county');
  }

  submitForm() {
    this.cliente = this.clientsForm.value; //get the data from the form
    this.cliente.phone = parseInt(this.phone.value); //convert the phone number to integer
    this.cliente.nif = parseInt(this.nif.value); //convert the nif to integer

    if (this.update) {
      this.cliente.lastUpdate = new Date().toJSON().slice(0, 10); //set the last update
    } else {
      this.cliente.registerDate = new Date().toJSON().slice(0, 10); //set the register date
    }

    if (this.clientsForm.valid) {
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
          this.name.setValue(result[0]);
          break;
        case 'phone':
          this.phone.setValue(result[0]);
          break;
        case 'nif':
          this.nif.setValue(result[0]);
          break;
        case 'address':
          this.address.setValue(result[0]);
          break;
        case 'postalCode':
          this.postalCode.setValue(result[0]);
          break;
        case 'parish':
          this.parish.setValue(result[0]);
          break;
        case 'county':
          this.county.setValue(result[0]);
          break;
      }
    });
  }
}