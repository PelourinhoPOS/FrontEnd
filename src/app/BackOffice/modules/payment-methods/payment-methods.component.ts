import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs'
import { PaymentMethod } from '../../models/paymentMethods';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
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

  displayedColumns: string[] = ['image', 'name', 'description', 'state']; //declare the columns of the payment methods table
  orderBy = 'name'; //save the order by selected

  public tabIndex = 0 //save the index of the tab

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  dataSourcePaymentMethods = new MatTableDataSource<PaymentMethod>();

  ngAfterViewInit() {
    this.dataSourcePaymentMethods.paginator = this.paginator;
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
    await this.paymentMethodService.register(method).then(() => {
      this.toastr.success('Método de pagamento registado com sucesso!');
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(method: PaymentMethod) {
    await this.paymentMethodService.update(method).then(() => {
      this.toastr.success('Método de pagamento atualizado com sucesso!');
    }).catch((err) => {
      err
    });
  }

  async delete(method: PaymentMethod) {
    await this.paymentMethodService.delete(method).then(() => {
      this.toastr.success('Método de pagamento eliminado com sucesso!');
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

    this.paymentMethodService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => b.id - a.id))
    ).subscribe(data => {

      this.methodsOff = of(data);
      this.dataSourcePaymentMethods.data = data

    });

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

    this.unselectRow();

    const dialogRef = this.dialog.open(CreatePaymentMethodsComponent, {
      height: '690px',
      width: '770px',
    });
    dialogRef.afterClosed().subscribe(category => {
      //console.log(category)
      if (category) {
        this.paymentMethodService.register(category);
      }
    });
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    this.methodsOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (data) {
          const dialogRef = this.dialog.open(CreatePaymentMethodsComponent, {
            height: '690px',
            width: '770px',
            data: { values: data, update: true }
          });
          dialogRef.afterClosed().subscribe(category => {
            // console.log(category)
            if (category) {
              this.paymentMethodService.update(category);
            }
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem métodos de pagamento para editar.', 'Aviso');
      }
    })
  }

  //function that opens the delete client modal
  openDeleteModal(data: any) {
    this.methodsOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (data) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '30%',
            width: '50%',
            data: { values: data }
          });
          dialogRef.afterClosed().subscribe(data => {
            if (data) {
              this.paymentMethodService.delete(data);
            }
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem métodos de pagamento para eliminar.', 'Aviso');
      }
    });
  }

  //function to know which line is selected
  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
  }

  //function to unselect the selected row
  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  onOptionsSelected() {
    this.listAllData();
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
    //this.subscriptionData.unsubscribe();
  }

}

/////////////////////////////////////////////// CREATE MODAL ///////////////////////////////////////////////

@Component({
  selector: 'app-create-payment-methods',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class CreatePaymentMethodsComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { }

  public paymentMethod: PaymentMethod = new PaymentMethod(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  categorySelected = '1';

  ngOnInit(): void {
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.paymentMethod = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.paymentMethod.image; //set the photo in the form
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
          this.paymentMethod.name = result[0];
          break;
        case 'description':
          this.paymentMethod.description = result[0];
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
        this.paymentMethod.image = this.url;
      }
      // this.fileName = file.name;
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
    }
  }
}
