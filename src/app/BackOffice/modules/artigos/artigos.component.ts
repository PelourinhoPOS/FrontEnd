import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
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

  constructor(public dialog: MatDialog, private artigosService: ArtigosService, private categorieServive: CategoriesService, private toastr: ToastrService) { }

  public artigos!: Observable<Artigo[]>; //save the clients returned from the API
  public artigosOff!: Observable<Artigo[]>; //save the clients returned from the local storage
  public allArtigosData!: Observable<Artigo[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table
  selectedRowIds: Set<number> = new Set<number>(); //save data of selected rows
  selectedId: string; //save the selected row id

  displayedColumns: string[] = ['select', 'image', 'name', 'category', 'iva', 'price', 'state']; //declare columns of the table
  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource<Artigo>();
  selection = new SelectionModel<Artigo>(true, []);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

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
    await this.artigosService.register(artigo).then(() => {
      this.toastr.success('Artigo registado com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(artigo: Artigo) {
    await this.artigosService.update(artigo).then(() => {
      this.toastr.success('Artigo atualizado com sucesso.');
    }).catch((err) => {
      err
    });
  }

  async delete(artigo: Artigo) {
    await this.artigosService.delete(artigo).then(() => {
      this.toastr.success('Artigo eliminado com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //search data from API
  listAPIdata(): void {
    this.artigos = this.artigosService.list();
  }

  namesCategories: any[] = [];

  getCategorieName(id, id_category: number) {
    return this.categorieServive.getLocalDataFromId('id', id_category).then(data => {
      this.namesCategories[id - 1] = data[0].name;
    });
  }

  //search data from local storage
  async listLocalData() {
    //this.clientesOff = this.clientesService.getDataOffline();
    this.showProgressBar = true;

    switch (this.orderBy) { //order by
      case 'name'://order by name

        this.artigosService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe(data => {

          for (let i = 0; i < data.length; i++) {
            this.getCategorieName(data[i].id, data[i].id_category)
          }

          this.artigosOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'id':
        this.artigosService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.id - b.id))
        ).subscribe(data => {
          this.artigosOff = of(data);
          this.dataSource.data = data
        })
        break;

      case 'preco':
        this.artigosService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => b.price - a.price))
        ).subscribe(data => {
          this.artigosOff = of(data);
          this.dataSource.data = data
        })
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
    this.selection.clear();
    this.selectedRowIds.clear();
    this.unselectRow();
    this.categorieServive.getDataOffline().subscribe(data => {
      if (data.length > 0) {
        this.unselectRow();
        const dialogRef = this.dialog.open(CreateArticleModalComponent, {
          height: '710px',
          width: '870px',
        });
        dialogRef.afterClosed().subscribe(artigo => {
          console.log(artigo)
          if (artigo) {
            this.register(artigo);
          }
        });
      } else {
        this.toastr.warning('Não existem categorias para criar artigos.', 'Aviso');
      }
    });
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    if (data) {
      this.selection.select(data);
    }
    if (this.selection.selected.length == 1) {
      this.artigosOff.subscribe(dataOff => {
        if (dataOff.length > 0) {
          if (data) {
            const dialogRef = this.dialog.open(CreateArticleModalComponent, {
              height: '710px',
              width: '870px',
              data: { values: data, update: true }
            });
            dialogRef.afterClosed().subscribe(artigo => {
              if (artigo) {
                this.update(artigo);
              }
            });
          } else {
            this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
          }
        } else {
          this.toastr.warning('Não existem artigos para editar.', 'Aviso');
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
    this.artigosOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (this.selection.selected.length > 0) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '40%',
            width: '50%',
            data: { values: this.selection.selected, component: 'Artigo' }
          });
          dialogRef.afterClosed().subscribe(artigo => {
            if (artigo) {
              this.delete(artigo);
            }
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem artigos para eliminar.', 'Aviso');
      }
    })

    // if (data) {
    //   this.clientesService.delete(data);
    // } else {
    //   this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    // }
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
  checkboxLabel(row?: Artigo): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (this.selection.selected.length > 1) {
      this.unselectRow();
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //function to know which line is selected
  onRowClicked(row: Artigo) {
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

  onCheckBoxClicked(row: Artigo) {
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
    //this.listAllData();
    this.listLocalData();
  }

  //function to unselect the selected row
  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  value: any;
  dialogRef: any;

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

/////////////////////////// // CREATE ARTICLE MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-article',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./artigos.component.scss'],
})

export class CreateArticleModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private categorieServive: CategoriesService, private dialogRefCreate: MatDialogRef<CreateArticleModalComponent>, private toastr: ToastrService) { }

  public artigo: Artigo = new Artigo(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create
  public compareData: any; //save the data to compare

  fileName = '';
  url = './assets/images/productDefault.jpg';
  ivaSelected = "0.23";

  categorySelected = 1;
  categoryItems: any;

  subcategorySelected = 0;
  subcategoryItems: any;

  unitySelected = "peso";
  subUnitySelected = "kg";

  formProducts: FormGroup;

  ngOnInit(): void {

    //get the data from client and set it in the form
    this.getCategories();

    this.formProducts = new FormGroup({ //create form group with form controls and validators
      id: new FormControl(),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      description: new FormControl('', [Validators.required]),
      unity: new FormControl('', [Validators.required]),
      sub_unity: new FormControl('', [Validators.required]),
      iva: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      id_category: new FormControl('', [Validators.required]),
      pvp1: new FormControl(),
      pvp2: new FormControl(),
      pvp3: new FormControl(),
      pvp4: new FormControl(),
      pvp5: new FormControl(),
      pvp6: new FormControl(),
      image: new FormControl(this.url)
    });


    if (this.data) { //if is update 
      this.update = true;
      this.artigo = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.artigo.image; //set the photo in the form

      //set the data in the formcontrols
      this.id.setValue(this.artigo.id);
      this.name.setValue(this.artigo.name);
      this.description.setValue(this.artigo.description);
      this.unity.setValue(this.artigo.unity);
      this.sub_unity.setValue(this.artigo.sub_unity);
      this.iva.setValue(this.artigo.iva.toString());
      this.price.setValue(this.artigo.price);
      this.id_category.setValue(this.artigo.id_category);
      this.pvp2.setValue(this.artigo.pvp2);
      this.pvp3.setValue(this.artigo.pvp3);
      this.pvp4.setValue(this.artigo.pvp4);
      this.pvp5.setValue(this.artigo.pvp5);
      this.pvp6.setValue(this.artigo.pvp6);
      this.image.setValue(this.artigo.image);

      this.categorySelected = this.artigo.id_category; //set the category in the form
      this.unitySelected = this.artigo.unity; //set the unity in the form
      this.subUnitySelected = this.artigo.sub_unity; //set the sub unity in the form
      this.ivaSelected = (this.artigo.iva).toString(); //set the iva in the form
    } else {
      this.categorySelect(); //set the category data if the user don't change the select
      this.ivaSelect(); //set the iva data if the user don't change the select
      this.unitySelect(); //set the unity data if the user don't change the select
      this.subunitySelect();
    }
  }

  //get value of id in form
  get id() {
    return this.formProducts.get('id');
  }

  //get value of name in form
  get name() {
    return this.formProducts.get('name');
  }

  get image() {
    return this.formProducts.get('image');
  }

  //get value of description in form
  get description() {
    return this.formProducts.get('description');
  }

  //get value of iva in form
  get iva() {
    return this.formProducts.get('iva');
  }

  //get value of price in form
  get price() {
    return this.formProducts.get('price');
  }

  //get value of category in form
  get id_category() {
    return this.formProducts.get('id_category');
  }

  //get value of unity in form
  get unity() {
    return this.formProducts.get('unity');
  }

  //get value of sub_unity in form
  get sub_unity() {
    return this.formProducts.get('sub_unity');
  }

  //get value of pvp2 in form
  get pvp2() {
    return this.formProducts.get('pvp2');
  }

  //get value of pvp3 in form
  get pvp3() {
    return this.formProducts.get('pvp3');
  }

  //get value of pvp4 in form
  get pvp4() {
    return this.formProducts.get('pvp4');
  }

  //get value of pvp5 in form
  get pvp5() {
    return this.formProducts.get('pvp5');
  }

  //get value of pvp6 in form
  get pvp6() {
    return this.formProducts.get('pvp6');
  }

  //get the categories
  getCategories() {
    this.categorieServive.getDataOffline().subscribe(data => {
      //this.categorySelected = data[0].name;
      this.categoryItems = data
    });
  };

  //select the category
  categorySelect() {
    this.id_category.setValue(this.categorySelected);
  }

  //select the iva
  ivaSelect() {
    this.iva.setValue(this.ivaSelected);
  }

  //select the unity
  unitySelect() {
    this.unity.setValue(this.unitySelected);

    if (this.unitySelected == "peso") {
      this.subUnitySelected = "kg";
      this.sub_unity.setValue(this.subUnitySelected);
    } else if (this.unitySelected == "volume") {
      this.subUnitySelected = "litro";
      this.sub_unity.setValue(this.subUnitySelected);
    } else if (this.unitySelected == "unidade") {
      this.subUnitySelected = "uni";
      this.sub_unity.setValue(this.subUnitySelected);
    }
  }

  //select the sub unity
  subunitySelect() {
    this.sub_unity.setValue(this.subUnitySelected);
  }

  //get the image
  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.image.setValue(this.url);
      }
      this.fileName = (file.name).substring(0, 15) + '(...)' + file.type.split('/')[1];
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
    }
  }

  //submit the data
  submitForm() {
    this.artigo = this.formProducts.value; //get the data from the form
    this.artigo.iva = parseFloat(this.iva.value); //set the iva in the form

    if (this.artigo === this.compareData) {
      this.toastr.info('Não foram efetuadas alterações.', 'Aviso'); //show error message
    } else {
      if (this.formProducts.valid) {
        this.dialogRefCreate.close(this.artigo); //close the dialog and save data
      } else {
        this.toastr.error('Existem erros no formulário.', 'Aviso'); //show error message
      }
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
        case 'price':
          this.price.setValue(result[0]);
          break;
        case 'description':
          this.description.setValue(result[0]);
          break;
        case 'price':
          this.price.setValue(result[0]);
          break;
        case 'pvp2':
          this.pvp2.setValue(result[0]);
          break;
        case 'pvp3':
          this.pvp3.setValue(result[0]);
          break;
        case 'pvp4':
          this.pvp4.setValue(result[0]);
          break;
        case 'pvp5':
          this.pvp5.setValue(result[0]);
          break;
        case 'pvp6':
          this.pvp6.setValue(result[0]);
          break;
      }
    });
  }
}