import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { Categories } from '../../models/categories';
import { SubCategories } from '../../models/subcategories';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { ImageGalleryComponent } from '../../shared/components/image-gallery/image-gallery.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { CategoriesService } from './categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, AfterViewInit {

  public header: any
  public sticky: any;

  constructor(public dialog: MatDialog, private categoriesService: CategoriesService, private toastr: ToastrService) { }

  public categories!: Observable<Categories[]>; //save the clients returned from the API
  public categoriesOff!: Observable<Categories[]>; //save the clients returned from the local storage
  public allCategoriesData!: Observable<Categories[]>; //save all clients from API and local storage

  public subcategories!: Observable<Categories[]>; //save the clients returned from the API
  public subcategoriesOff!: Observable<Categories[]>; //save the clients returned from the local storage
  public allSubCategoriesData!: Observable<Categories[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table
  selectedRowIds: Set<number> = new Set<number>(); //save data of selected rows
  selectedId: string; //save the selected row id

  displayedColumns: string[] = ['select', 'image', 'name', 'categorie', 'state']; //declare columns of the categories table
  orderBy = 'name'; //save the order by selected

  public tabIndex = 0 //save the index of the tab

  showProgressBar = false;

  @ViewChild('paginatorCategories', { static: true }) paginator: MatPaginator;
  @ViewChild('paginatorSubCategories', { static: true }) paginator1: MatPaginator;

  dataSource = new MatTableDataSource<Categories>();
  selection = new SelectionModel<Categories>(true, []);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {

    //list data on init
    this.listLocalData();
    // this.listAPIdata();
    // this.listAllData();

    //subscribe to refresh data, when data is changed
    this.subscriptionData = this.categoriesService.refreshData.subscribe(() => {
      this.listLocalData();
      // this.listAPIdata();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(categorie: Categories) {
    await this.categoriesService.register(categorie).then((category) => {
      if (category) {
        this.toastr.success('Categoria registada com sucesso');
      }
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(categorie: Categories) {
    await this.categoriesService.update(categorie).then((category) => {
      console.log(category);
      if (category) {
        this.toastr.success('Categoria atualizada com sucesso');
      }
    }).catch((err) => {
      err
    });
  }

  async delete(categorie: Categories) {
    await this.categoriesService.delete(categorie).then((category) => {
      if (category) {
        this.toastr.success('Categoria eliminada com sucesso');
      }
    }).catch((err) => {
      err
    });
  }

  //search data from API
  listAPIdata(): void {
    this.categories = this.categoriesService.list();
  }

  namesCategories: any[] = [];

  getCategoryName(id, id_category: number) {
    return this.categoriesService.getLocalDataFromId('id', id_category).then(category => {
      this.namesCategories[id - 1] = category[0].name;
    });
  }

  //search data from local storage
  async listLocalData() {

    this.showProgressBar = true;

    switch (this.orderBy) {
      case 'name':
        this.categoriesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe((data: any) => {
          for (let i = 0; i < data.length; i++) {
            this.getCategoryName(data[i].id, data[i].id_category);
          }
          this.categoriesOff = of(data);
          this.dataSource.data = data
        });
        break;

      case 'id':
        this.categoriesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.id - b.id))
        ).subscribe((data: any) => {
          for (let i = 0; i < data.length; i++) {
            this.getCategoryName(data[i].id, data[i].id_category);
          }
          this.categoriesOff = of(data);
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
        this.allCategoriesData = combineLatest(this.categories, this.categoriesOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        );
        break;

      case 'id'://order by id
        this.allCategoriesData = combineLatest(this.categories, this.categoriesOff).pipe(
          map(([a, b]) => a.concat(b))
        );
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.categoriesService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.selection.clear();
    this.selectedRowIds.clear();
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateCategorieModalComponent, {
      height: '600px',
      width: '770px',
    });
    dialogRef.afterClosed().subscribe(category => {
      //console.log(category)
      if (category) {
        this.register(category);
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
      this.categoriesOff.subscribe(dataOff => {
        if (dataOff.length > 0) {
          if (data) {
            const dialogRef = this.dialog.open(CreateCategorieModalComponent, {
              height: '600px',
              width: '770px',
              data: { values: data, update: true }
            });
            dialogRef.afterClosed().subscribe(category => {
              // console.log(category)
              if (category) {
                this.update(category);
              }
            });
          } else {
            this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
          }
        } else {
          this.toastr.warning('Não existem categorias para editar.', 'Aviso');
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
    this.categoriesOff.subscribe(dataOff => {
      if (dataOff.length > 0) {
        if (this.selection.selected.length > 0) {
          const dialogRef = this.dialog.open(DeleteModalComponent, {
            height: '40%',
            width: '50%',
            data: { values: this.selection.selected, component: 'Categoria' }
          });
          dialogRef.afterClosed().subscribe(data => {
            if (data) {
              this.delete(data);
            }
          });
        } else {
          this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
        }
      } else {
        this.toastr.warning('Não existem categorias para eliminar.', 'Aviso');
      }
    })
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
  checkboxLabel(row?: Categories): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (this.selection.selected.length > 1) {
      this.unselectRow();
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  //function to know which line is selected
  onRowClicked(row: Categories) {
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

  onCheckBoxClicked(row: Categories) {
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

  tabClick(tab) {
    this.unselectRow();
    this.tabIndex = tab.index;
  }

  //function event to change the order by
  onOptionsSelected() {
    //this.listAllData();
    this.listLocalData();
  }

  //when component is closed, unsubscribe from the observable to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

}

// |||||||||||||||||||||||||||||||||||||||||| CREATE CATEGORY COMPONENT |||||||||||||||||||||||||||||||||||||||||||||| \\
@Component({
  selector: 'create-new-categorie',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./categories.component.scss'],
})

export class CreateCategorieModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private categoriesService: CategoriesService, public dialogRefCreate: MatDialogRef<CreateCategorieModalComponent>, private toastr: ToastrService) { }

  public categorie: Categories = new Categories(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/categoryDefault.jpg';
  categoryItems: any;
  subcategorySelected: any;
  picute;
  title;

  categoriesForm: FormGroup;

  ngOnInit(): void {

    this.getCategories();
    this.subcategorySelected = 0;

    this.categoriesForm = new FormGroup({
      id: new FormControl(),
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      id_category: new FormControl(this.subcategorySelected, [Validators.required]),
      image: new FormControl(''),
    });

    this.image.setValue(this.url);

    //get the data from client and set it in the form
    if (this.data) {
      this.update = true;
      this.categorie = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.categorie.image; //set the photo in the form

      this.id.setValue(this.categorie.id);
      this.name.setValue(this.categorie.name);
      this.id_category.setValue(this.categorie.id_category);
      this.image.setValue(this.url);

      if (this.categorie.id_category == 0) {
        this.subcategorySelected = '0';
      } else {
        this.subcategorySelected = this.categorie.id_category;
      }

    }
  }

  get id() {
    return this.categoriesForm.get('id');
  }

  get name() {
    return this.categoriesForm.get('name');
  }

  get id_category() {
    return this.categoriesForm.get('id_category');
  }

  get image() {
    return this.categoriesForm.get('image');
  }

  getCategories() {
    this.categoriesService.getDataOffline().subscribe(data => {
      //this.categorySelected = data[0].name;
      this.categoryItems = data
    });
  };

  categorySelect() {
    this.categorie.id_category = parseInt(this.subcategorySelected);
  }

  submitForm() {
    this.categorie = this.categoriesForm.value;
    if (this.categoriesForm.valid) {
      this.dialogRefCreate.close(this.categorie);
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
      this.picute = data[0];
      this.title = data[1];
      console.log(this.picute);
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
          this.name.setValue(result[0]);
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
      this.fileName = (file.name).substring(0, 15) + '(...)' + file.type.split('/')[1];
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
    }
  }

}