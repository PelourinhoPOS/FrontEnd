import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { Mesa } from '../../models/mesa';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { MesasService } from './mesas.service';

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrls: ['./mesas.component.scss']
})
export class MesasComponent implements OnInit, AfterViewInit {

  constructor(public dialog: MatDialog, private mesasService: MesasService, private onlineOfflineService: OnlineOfflineService, private toastr: ToastrService) { }

  public mesas!: Observable<Mesa[]>; //save the employees returned from the API
  public mesasOff!: Observable<Mesa[]>; //save the employees returned from the local storage
  public allmesasData!: Observable<Mesa[]>; //save all employees from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table

  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  displayedColumns: string[] = ['name', 'capacity', 'number', 'type'];
  dataSource = new MatTableDataSource<Mesa>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.listLocalData();

    this.subscriptionData = this.mesasService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.listLocalData();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(mesa: Mesa) {
    await this.mesasService.register(mesa);
  }

  //update data in API or local storage
  async update(mesa: Mesa) {
    await this.mesasService.update(mesa);
  }

  //function to delete a employee
  async delete(empregado: Mesa) {
    await this.mesasService.delete(empregado);
  }

  //search data from API
  listAPIdata(): void {
    this.mesas = this.mesasService.list();
  }

  //search data from local storage
  async listLocalData() {

    this.showProgressBar = true;

    this.mesasOff = this.mesasService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => b.id - a.id))
    );
    
    this.mesasService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => b.id - a.id))
    ).subscribe(arr => {
      this.dataSource.data = arr;
    });

    setInterval(() => {
      this.showProgressBar = false;
    }, 1300);

  }

  //save data of all clients from API and local storage
  listAllData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.allmesasData = combineLatest(this.mesas, this.mesasOff).pipe(
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
        this.allmesasData = combineLatest(this.mesas, this.mesasOff).pipe(
          map(([a, b]) => a.concat(b))
        )
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.mesasService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateBoardModalComponent, {
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
      const dialogRef = this.dialog.open(CreateBoardModalComponent, {
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

/////////////////////////// // CREATE EMPLOYEE MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-employee',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./mesas.component.scss']
})

export class CreateBoardModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { }

  public mesa: Mesa = new Mesa(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  typeSelected = 'square';

  ngOnInit(): void {
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.mesa = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.typeSelected = this.mesa.type; //set the type
    } else {
      this.typeSelect(); //set the default type
    }

  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = (event: any) => {
        this.url = event.target.result;
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
          this.mesa.name = result[0];
          break;
      }
    });
  }

  typeSelect(){
    this.mesa.type = this.typeSelected;
  }
}