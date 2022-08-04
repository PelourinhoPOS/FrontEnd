import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs'
import { PaymentMethod } from '../../models/paymentMethods';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { ImageGalleryComponent } from '../../shared/components/image-gallery/image-gallery.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { PaymentMethodsService } from './payment-methods.service';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  constructor(private paymentMethodService: PaymentMethodsService, public dialog: MatDialog, private toastr: ToastrService) { }

  public methods!: Observable<PaymentMethod[]>; //save the clients returned from the API
  public methodsOff!: Observable<PaymentMethod[]>; //save the clients returned from the local storage
  public allMethodsData!: Observable<PaymentMethod[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table
  selectedRowIds: Set<number> = new Set<number>(); //save data of selected rows
  selectedId: string; //save the selected row id

  displayedColumns: string[] = ['select', 'image', 'name', 'description', 'state']; //declare the columns of the payment methods table
  orderBy = 'name'; //save the order by selected

  public tabIndex = 0 //save the index of the tab

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSource = new MatTableDataSource<PaymentMethod>();
  selection = new SelectionModel<PaymentMethod>(true, []);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.listLocalData();

    this.translatePaginator(this.paginator);

    //subscribe to refresh data, when data is changed
    this.subscriptionData = this.paymentMethodService.refreshData.subscribe(() => {
      this.listLocalData();
      // this.listAPIdata();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(method: PaymentMethod) {
    await this.paymentMethodService.register(method).then((payment) => {
      if (payment) {
        this.toastr.success('Método de pagamento registado com sucesso!');
      }
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(method: PaymentMethod) {
    await this.paymentMethodService.update(method).then((payment) => {
      if (payment) {
        this.toastr.success('Método de pagamento atualizado com sucesso!');
      }
    }).catch((err) => {
      err
    });
  }

  async delete(method: PaymentMethod) {
    await this.paymentMethodService.delete(method).then((payment) => {
      if (payment) {
        this.toastr.success('Método de pagamento eliminado com sucesso!');
      }
    }).catch((err) => {
      err
    });
  }

  //search data from API
  listAPIdata(): void {
    this.methods = this.paymentMethodService.list();
  }

  //search data from local storage
  async listLocalData() {

    this.showProgressBar = true;

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.paymentMethodService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe(data => {
          this.methodsOff = of(data);
          this.dataSource.data = data
        })
        break;
      case 'id':
        this.paymentMethodService.getDataOffline().subscribe(data => {
          this.methodsOff = of(data);
          this.dataSource.data = data
        });
        break;
    }

    this.selection.clear();
    this.selectedRowIds.clear();
    this.unselectRow();

    setInterval(() => {
      this.showProgressBar = false;
    }, 1300); //wait 1,30 seconds to show progress bar

  }

  //save data of all clients from API and local storage
  listAllData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.allMethodsData = combineLatest(this.methods, this.methodsOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        );
        break;

      case 'id'://order by id
        this.allMethodsData = combineLatest(this.methods, this.methodsOff).pipe(
          map(([a, b]) => a.concat(b))
        );
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.paymentMethodService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.selection.clear();
    this.selectedRowIds.clear();
    this.unselectRow();
    const dialogRef = this.dialog.open(CreatePaymentMethodsComponent, {
      height: '600px',
      width: '770px',
    });
    dialogRef.afterClosed().subscribe(paymentMethod => {
      //console.log(paymentMethod)
      if (paymentMethod) {
        this.register(paymentMethod);
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
      this.methodsOff.subscribe(dataOff => {
        if (dataOff.length > 0) {
          if (data) {
            const dialogRef = this.dialog.open(CreatePaymentMethodsComponent, {
              height: '600px',
              width: '770px',
              data: { values: data, update: true }
            });
            dialogRef.afterClosed().subscribe(paymentMethod => {
              // console.log(paymentMethod)
              if (paymentMethod) {
                this.update(paymentMethod);
              }
            });
          } else {
            this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
          }
        } else {
          this.toastr.warning('Não existem métodos de pagamento para editar.', 'Aviso');
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
    this.methodsOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (this.selection.selected.length > 0) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '40%',
            width: '50%',
            data: { values: this.selection.selected, component: 'Método de Pagamento' }
          });
          dialogRef.afterClosed().subscribe(data => {
            if (data) {
              data.forEach(paymentMethod => {
                this.delete(paymentMethod);
              });
            }
            this.dataRow = null;
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem métodos de pagamento para eliminar.', 'Aviso');
      }
    });
  }

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
  checkboxLabel(row?: PaymentMethod): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (this.selection.selected.length > 1) {
      this.unselectRow();
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //function to know which line is selected
  onRowClicked(row: PaymentMethod) {
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

  onCheckBoxClicked(row: PaymentMethod) {
    if (this.selectedRowIds.has(row.id)) {
      this.selectedRowIds.delete(row.id);
    } else {
      this.selectedRowIds.add(row.id);
    }
    this.dataRow = this.selection.selected.length > 0 ? this.selection.selected[0] : null;
    this.selectedRowIndex = this.dataRow ? this.dataRow.id : null;
  }

  //function to unselect the selected row
  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  onOptionsSelected() {
    this.listLocalData();
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

/////////////////////////////////////////////// CREATE MODAL ///////////////////////////////////////////////

@Component({
  selector: 'app-create-payment-methods',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class CreatePaymentMethodsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public dialogRefCreate: MatDialogRef<CreatePaymentMethodsComponent>, public toastr: ToastrService) { }

  public paymentMethod: PaymentMethod = new PaymentMethod(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/paymentDefault.png';
  categorySelected = '1';
  picute;
  title;

  paymentForm: FormGroup;

  ngOnInit(): void {

    this.paymentForm = new FormGroup({
      id: new FormControl(),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      description: new FormControl('', [Validators.required]),
      image: new FormControl(this.url),
    });

    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.paymentMethod = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.paymentMethod.image; //set the photo in the form

      this.id.setValue(this.paymentMethod.id);
      this.name.setValue(this.paymentMethod.name);
      this.description.setValue(this.paymentMethod.description);
      this.image.setValue(this.url);
    }
  }

  get id() {
    return this.paymentForm.get('id');
  }

  get name() {
    return this.paymentForm.get('name');
  }

  get description() {
    return this.paymentForm.get('description');
  }

  get image() {
    return this.paymentForm.get('image');
  }

  submitForm() {
    this.paymentMethod = this.paymentForm.value;

    if (this.paymentForm.valid) {
      this.dialogRefCreate.close(this.paymentMethod);
    } else {
      this.toastr.error('Existem erros no formulário.', 'Aviso');
    }
  }

    openImages() {
    const dialogRef = this.dialog.open(ImageGalleryComponent, {
      height: '80%',
      width: '60%',
    });
    dialogRef.afterClosed().subscribe(data => {
      this.url = data[0];
      this.title = data[1];
      this.image.setValue(this.url);
    });
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
          this.paymentForm.get('name').setValue(result[0]);
          break;
        case 'description':
          this.paymentForm.get('description').setValue(result[0]);
          break;
      }
    });
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.image.setValue(this.url);
      }
      if (file.name.length > 15) {
        this.fileName = (file.name).substring(0, 15) + '(...).' + file.type.split('/')[1];
      } else {
        this.fileName = file.name;
      }
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
    }
  }
}
