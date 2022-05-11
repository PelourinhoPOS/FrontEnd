import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { Artigo } from '../../models/artigo';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { CategoriesService } from '../categories/categories.service';
import { ArtigosService } from './artigos.service';

@Component({
  selector: 'app-artigos',
  templateUrl: './artigos.component.html',
  styleUrls: ['./artigos.component.scss']
})
export class ArtigosComponent implements OnInit {

  public header: any
  public sticky: any;

  constructor(public dialog: MatDialog, private artigosService: ArtigosService, private onlineOfflineService: OnlineOfflineService, private toastr: ToastrService) { }

  public artigos!: Observable<Artigo[]>; //save the clients returned from the API
  public artigosOff!: Observable<Artigo[]>; //save the clients returned from the local storage
  public allArtigosData!: Observable<Artigo[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table

  displayedColumns: string[] = ['image', 'name', 'category', 'iva', 'price', 'state']; //declare columns of the table
  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  ngOnInit(): void {
    //list data on init
    this.listLocalData();
    // this.listAPIdata();
    // this.listAllData();

    //subscribe to refresh data, when data is changed
    this.subscriptionData = this.artigosService.refreshData.subscribe(() => {
      this.listLocalData();
      // this.listAPIdata();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(artigo: Artigo) {
    await this.artigosService.register(artigo);
  }

  //update data in API or local storage
  async update(artigo: Artigo) {
    await this.artigosService.update(artigo);
  }

  async delete(artigo: Artigo) {
    await this.artigosService.delete(artigo);
  }

  //search data from API
  listAPIdata(): void {
    this.artigos = this.artigosService.list();
  }

  //search data from local storage
  async listLocalData() {
    //this.clientesOff = this.clientesService.getDataOffline();
    this.showProgressBar = true;

    this.artigosOff = this.artigosService.getDataOffline();
    setInterval(() => {
      this.showProgressBar = false;
    }, 1300); //wait 1,30 seconds to show progress bar

  }

  //save data of all clients from API and local storage
  listAllData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.allArtigosData = combineLatest(this.artigos, this.artigosOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        );
        break;

      case 'id'://order by id
        this.allArtigosData = combineLatest(this.artigos, this.artigosOff).pipe(
          map(([a, b]) => a.concat(b))
        );
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.artigosService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateArticleModalComponent, {
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
      const dialogRef = this.dialog.open(CreateArticleModalComponent, {
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

/////////////////////////// // CREATE ARTICLE MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-article',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./artigos.component.scss'],
})

export class CreateArticleModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private categorieServive: CategoriesService) { }

  public artigo: Artigo = new Artigo(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  categorySelected = 1;
  ivaSelected = "0.23";
  categoryItems: any;

  ngOnInit(): void {
    //get the data from client and set it in the form
    this.getCategories();

    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.artigo = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.artigo.image; //set the photo in the form
      this.categorySelected = this.artigo.id_category; //set the category in the form
      this.ivaSelected = (this.artigo.iva).toString(); //set the iva in the form
    } else {
      this.categorySelect(); //set the category data if the user don't change the select
      this.ivaSelect(); //set the iva data if the user don't change the select
    }
  }

  getCategories() {
    this.categorieServive.getDataOffline().subscribe(data => {
      //this.categorySelected = data[0].name;
      this.categoryItems = data
    });
  };

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
          this.artigo.name = result[0];
          break;
        case 'price':
          this.artigo.price = result[0];
          break;
        case 'iva':
          this.artigo.iva = result[0];
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
        this.artigo.image = this.url;
      }
      // this.fileName = file.name;
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
    }
  }

  categorySelect() {
    this.artigo.id_category = this.categorySelected;
  }

  ivaSelect(){
    this.artigo.iva =  parseFloat(this.ivaSelected);
  }

}
