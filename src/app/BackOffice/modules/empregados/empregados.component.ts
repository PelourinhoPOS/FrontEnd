import { Component, OnInit, OnDestroy, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, combineLatest, map, of } from 'rxjs';
import { Empregado } from '../../models/empregado';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { EmpregadosService } from './empregados.service';

@Component({
  selector: 'app-empregados',
  templateUrl: './empregados.component.html',
  styleUrls: ['./empregados.component.scss']
})
export class EmpregadosComponent implements OnInit, AfterViewInit, OnDestroy {

  public header: any
  public sticky: any;

  constructor(public dialog: MatDialog, private empregadosService: EmpregadosService, private onlineOfflineService: OnlineOfflineService, private toastr: ToastrService) { }

  //public cliente: empregado = new Empregado();
  public empregados!: Observable<Empregado[]>; //save the employees returned from the API
  public empregadosOff!: Observable<Empregado[]>; //save the employees returned from the local storage
  public allEmpregadosData!: Observable<Empregado[]>; //save all employees from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table

  displayedColumns: string[] = ['avatar', 'name', 'function', 'phone', 'state']; //declare columns of the table
  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource<Empregado>();

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
    this.subscriptionData = this.empregadosService.refreshData.subscribe(() => {
      this.listLocalData();
      // this.listAPIdata();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(empregado: Empregado) {
    await this.empregadosService.register(empregado);
  }

  //update data in API or local storage
  async update(empregado: Empregado) {
    await this.empregadosService.update(empregado);
  }

  //function to delete a employee
  async delete(empregado: Empregado) {
    await this.empregadosService.delete(empregado);
  }

  //search data from API
  listAPIdata(): void {
    this.empregados = this.empregadosService.list();
  }

  //search data from local storage
  listLocalData() {

    this.showProgressBar = true;

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.empregadosService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe(data => {
          this.empregadosOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'funcao'://order by function
        this.empregadosService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.function.localeCompare(b.function)))
        ).subscribe(data => {
          this.empregadosOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'id':
        this.empregadosService.getDataOffline().subscribe(data => {
          this.empregadosOff = of(data);
          this.dataSource.data = data
        })
        break;
    }

    setInterval(() => {
      this.showProgressBar = false;
    }, 1300);

  }

  //save data of all clients from API and local storage
  listAllData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.allEmpregadosData = combineLatest(this.empregados, this.empregadosOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        );
        break;

      // case 'localidade'://order by localidade
      //   this.allEmpregadosData = combineLatest(this.empregados, this.empregadosOff).pipe(
      //     map(([a, b]) => a.concat(b))
      //   ).pipe(
      //     map(arr => arr.sort((a, b) => a.county.localeCompare(b.county)))
      //   );
      //   break;

      case 'id'://order by id
        this.allEmpregadosData = combineLatest(this.empregados, this.empregadosOff).pipe(
          map(([a, b]) => a.concat(b))
        )
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.empregadosService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateEmployeeModalComponent, {
      height: '690px',
      width: '770px',
    });
    dialogRef.afterClosed().subscribe(empregado => {
      //console.log(empregado)
      if (empregado) {
        this.register(empregado);
      }
    });
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    if (data) {
      const dialogRef = this.dialog.open(CreateEmployeeModalComponent, {
        height: '690px',
        width: '770px',
        data: { values: data, update: true }
      });
      dialogRef.afterClosed().subscribe(data => {
        // console.log(data)
        if (data) {
          this.update(data);
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
      dialogRef.afterClosed().subscribe(data => {
        // console.log(data)
        if (data) {
          this.delete(data);
        }
        this.dataRow = null;
      });
    } else {
      this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    }
  }

  //function to know which line is selected
  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
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

  //when component is closed, unsubscribe from the observable to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

}


/////////////////////////// // CREATE EMPLOYEE MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-employee',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./empregados.component.scss']
})

export class CreateEmployeeModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { }

  public empregado: Empregado = new Empregado(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  levelSelected = 'Empregado';

  ngOnInit(): void {
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.empregado = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.empregado.avatar; //set the photo in the form
      this.levelSelected = this.empregado.function; //set the level in the form
    } else {
      this.levelSelect(); //set the level in the form
    }

  }

  levelSelect() {
    this.empregado.function = this.levelSelected;
  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.empregado.avatar = this.url;
      }
      // this.fileName = file.name;
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
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
          this.empregado.name = result[0];
          break;
        case 'phone':
          this.empregado.phone = result[0];
          break;
        case 'password':
          this.empregado.password = result[0];
          break;
      }
    });
  }
}
