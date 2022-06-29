import { Component, OnInit, OnDestroy, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, combineLatest, map, of } from 'rxjs';
import { User } from '../../models/user';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { UsersService } from './users.service';

@Component({
  selector: 'app-empregados',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {

  public header: any
  public sticky: any;

  constructor(public dialog: MatDialog, private usersService: UsersService, private toastr: ToastrService) { }

  //public cliente: empregado = new Empregado();
  public empregados!: Observable<User[]>; //save the employees returned from the API
  public empregadosOff!: Observable<User[]>; //save the employees returned from the local storage
  public allEmpregadosData!: Observable<User[]>; //save all employees from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table

  displayedColumns: string[] = ['avatar', 'name', 'function', 'phone', 'stateActivity', 'state']; //declare columns of the table
  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource<User>();

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
    this.subscriptionData = this.usersService.refreshData.subscribe(() => {
      this.listLocalData();
      // this.listAPIdata();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(empregado: User) {
    await this.usersService.register(empregado).then((user: any) => {
      if (user) {
        this.toastr.success('Utilizador registado com sucesso!');
      }
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(empregado: User) {
    await this.usersService.update(empregado).then(() => {
      this.toastr.success('Utilizador atualizado com sucesso!');
    }).catch((err) => {
      err
    });
  }

  //function to delete a employee
  async delete(empregado: User) {
    await this.usersService.delete(empregado).then(() => {
      this.toastr.success('Utilizador eliminado com sucesso!');
    }).catch((err) => {
      err
    });
  }

  //search data from API
  listAPIdata(): void {
    this.empregados = this.usersService.list();
  }

  //search data from local storage
  listLocalData() {

    this.showProgressBar = true;

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.usersService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe(data => {
          this.empregadosOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'funcao'://order by function
        this.usersService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.function.localeCompare(b.function)))
        ).subscribe(data => {
          this.empregadosOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'id':
        this.usersService.getDataOffline().subscribe(data => {
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
    this.usersService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateEmployeeModalComponent, {
      height: '710px',
      width: '870px',
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
    this.empregadosOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (data) {
          const dialogRef = this.dialog.open(CreateEmployeeModalComponent, {
            height: '710px',
            width: '870px',
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
      } else {
        this.toastr.warning('Não existem utilizadores para editar.', 'Aviso');
      }
    })
  }

  //function that opens the delete client modal
  openDeleteModal(data: any) {
    this.empregadosOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (data) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '30%',
            width: '50%',
            data: { values: data, component: 'Utilizador' }
          });
          dialogRef.afterClosed().subscribe(data => {
            if (data) {
              this.delete(data);
            }
            this.dataRow = null;
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem utilizadores para apagar.', 'Aviso');
      }
    });
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


/////////////////////////// // CREATE USER MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-employee',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./users.component.scss']
})

export class CreateEmployeeModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public dialogRefCreate: MatDialogRef<CreateEmployeeModalComponent>, public toastr: ToastrService) { }

  public user: User = new User(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  levelSelected = 'Empregado';
  stateSelected = 'true';

  usersForm: FormGroup; //save the form

  ngOnInit(): void {

    this.user.avatar = this.url; //set the default avatar

    this.usersForm = new FormGroup({
      id: new FormControl(),
      name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      nif: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('[0-9]*')]),
      address: new FormControl('', [Validators.required, Validators.minLength(5)]),
      phone: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('[0-9]*')]),
      function: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('[0-9]*')]),
      active: new FormControl('', [Validators.required]),
      avatar: new FormControl(this.url),
    })

    //get the data from client and set it in the form
    if (this.data) {
      this.update = true;
      this.user = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.user.avatar; //set the photo in the form

      this.id.setValue(this.user.id);
      this.name.setValue(this.user.name);
      this.nif.setValue(this.user.nif);
      this.address.setValue(this.user.address);
      this.phone.setValue(this.user.phone);
      this.function.setValue(this.user.function);
      this.password.setValue(this.user.password);
      this.active.setValue(this.user.active);
      this.avatar.setValue(this.url);

      this.levelSelected = this.user.function; //set the level in the form
      this.stateSelected = (this.user.active).toString(); //set the state in the form
    } else {
      this.levelSelect(); //set the level in the form
      this.stateSelect(); //set the state in the form
    }
  }

  get id(){
    return this.usersForm.get('id');
  }

  get name() {
    return this.usersForm.get('name');
  }

  get nif() {
    return this.usersForm.get('nif');
  }

  get address() {
    return this.usersForm.get('address');
  }

  get phone() {
    return this.usersForm.get('phone');
  }

  get function() {
    return this.usersForm.get('function');
  }

  get avatar() {
    return this.usersForm.get('avatar');
  }

  get password() {
    return this.usersForm.get('password');
  }

  get active() {
    // let state = this.usersForm.get('active').value;
    // if (state == 'true') {
    //   this.user.active = true;
    //   this.active.setValue(true);
    // } else if (state == 'false') {
    //   this.user.active = false;
    //   this.active.setValue(false);
    // }
    return this.usersForm.get('active');
  }

  levelSelect() {
    this.function.setValue(this.levelSelected);
  }

  stateSelect() {
    if (this.stateSelected == "true") {
      this.active.setValue(true);
    } else if (this.stateSelected == "false") {
      this.active.setValue(false);
    }
  }

  submitForm() {
    this.user = this.usersForm.value;
    this.user.phone = parseInt(this.phone.value);
    this.user.nif = parseInt(this.nif.value);
    this.user.password = parseInt(this.password.value);

    if (this.usersForm.valid) {
      this.dialogRefCreate.close(this.user);
    } else {
      this.toastr.error('Existem erros no formulário.', 'Aviso');
    }
  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.avatar.setValue(this.url);
      }
      this.fileName = (file.name).substring(0,20,) + '...';
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
        case 'password':
          this.password.setValue(result[0]);
          break;
      }
    });
  }
}
