import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { Categories } from '../../models/categories';
import { SubCategories } from '../../models/subcategories';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { CategoriesService } from './categories.service';
import { SubcategoriesService } from './subcategories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, AfterViewInit {

  public header: any
  public sticky: any;

  constructor(public dialog: MatDialog, private categoriesService: CategoriesService, private subcategoriesService: SubcategoriesService, private onlineOfflineService: OnlineOfflineService, private toastr: ToastrService) { }

  public categories!: Observable<Categories[]>; //save the clients returned from the API
  public categoriesOff!: Observable<Categories[]>; //save the clients returned from the local storage
  public allCategoriesData!: Observable<Categories[]>; //save all clients from API and local storage

  public subcategories!: Observable<Categories[]>; //save the clients returned from the API
  public subcategoriesOff!: Observable<Categories[]>; //save the clients returned from the local storage
  public allSubCategoriesData!: Observable<Categories[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  selectedRowIndex = -1; //save the selected index from the table

  displayedColumnsCategory: string[] = ['image', 'name', 'state']; //declare columns of the categories table
  displayedColumnsSubCategory: string[] = ['image', 'name', 'category', 'state']; //declare the columns of the subcategories table
  orderBy = 'name'; //save the order by selected

  public tabIndex = 0 //save the index of the tab

  showProgressBar = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSourceCategories = new MatTableDataSource<Categories>();
  dataSourceSubCategories = new MatTableDataSource<SubCategories>();

  ngAfterViewInit() {
    this.dataSourceCategories.paginator = this.paginator;
    this.dataSourceSubCategories.paginator = this.paginator;
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
    this.subscriptionData = this.subcategoriesService.refreshData.subscribe(() => {
      this.listLocalData();
      // this.listAPIdata();
      // this.listAllData();
    });
  }

  //register data in API or local storage
  async register(categorie: Categories) {
    await this.categoriesService.register(categorie);
  }

  //update data in API or local storage
  async update(categorie: Categories) {
    await this.categoriesService.update(categorie);
  }

  async delete(categorie: Categories) {
    await this.categoriesService.delete(categorie);
  }

  //search data from API
  listAPIdata(): void {
    this.categories = this.categoriesService.list();
  }

  //search data from local storage
  async listLocalData() {

    this.showProgressBar = true;

    this.categoriesService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
    ).subscribe(data => {
      this.categoriesOff = of(data);
      this.dataSourceCategories.data = data
    });

    this.subcategoriesService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
    ).subscribe(data => {

      this.subcategoriesOff = of(data);

      for (let i = 0; i < data.length; i++) {
        this.categoriesService.getLocalDataFromId('id', data[i].id_category).then(category => {
          this.dataSourceSubCategories.data[i] = ({
            id: data[i].id,
            id_category: data[i].id_category,
            category_name: category[0].name,
            name: data[i].name,
            image: data[i].image,
            synchronized: false
          });
        });
      }
      
    });

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

    this.unselectRow();

    if (this.tabIndex === 0) {
      const dialogRef = this.dialog.open(CreateCategorieModalComponent, {
        height: '690px',
        width: '770px',
      });
      dialogRef.afterClosed().subscribe(category => {
        //console.log(category)
        if (category) {
          this.categoriesService.register(category);
        }
      });
    } else if (this.tabIndex === 1) {

      this.categoriesService.getDataOffline().subscribe(data => {
        if (data.length == 0) {
          this.toastr.warning('Não existem categorias para criar subcategorias');
        } else {
          const dialogRef = this.dialog.open(CreateSubCategorieModalComponent, {
            height: '690px',
            width: '770px',
          });
          dialogRef.afterClosed().subscribe(subCategory => {
            //console.log(subCategory)
            if (subCategory) {
              this.subcategoriesService.register(subCategory);
            }
          });
        }
      });

    }
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    if (data) {

      if (this.tabIndex === 0) {
        const dialogRef = this.dialog.open(CreateCategorieModalComponent, {
          height: '690px',
          width: '770px',
          data: { values: data, update: true }
        });
        dialogRef.afterClosed().subscribe(category => {
          // console.log(category)
          if (category) {
            this.categoriesService.update(category);
          }
        });

      } else if (this.tabIndex === 1) {

        const dialogRef = this.dialog.open(CreateSubCategorieModalComponent, {
          height: '690px',
          width: '770px',
          data: { values: data, update: true }
        });
        dialogRef.afterClosed().subscribe(subCategory => {
          // console.log(subCategory)
          if (subCategory) {
            this.subcategoriesService.update(subCategory);
          }
        });
      }
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
          if (this.tabIndex === 0) {
            this.categoriesService.delete(data);
          } else if (this.tabIndex === 1) {
            this.subcategoriesService.delete(data);
          }
        }
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
    this.listAllData();
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { }

  public categorie: Categories = new Categories(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  categorySelected = '1';

  ngOnInit(): void {
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.categorie = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.categorie.image; //set the photo in the form
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
          this.categorie.name = result[0];
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
        this.categorie.image = this.url;
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

// |||||||||||||||||||||||||||||||||||||||||| CREATE SUBCATEGORY COMPONENT |||||||||||||||||||||||||||||||||||||||||||||| \\

@Component({
  selector: 'create-new-categorie',
  templateUrl: './create-subcategory-modal.component.html',
  styleUrls: ['./categories.component.scss'],
})

export class CreateSubCategorieModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private categoriesService: CategoriesService) { }

  public subCategorie: SubCategories = new SubCategories(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  subcategorySelected = 1;
  categoryItems: any;

  ngOnInit(): void {
    this.getCategories();
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.subCategorie = this.data.values; //set the data in the form
      this.fileName = 'Alterar imagem'; //set the file name
      this.url = this.subCategorie.image; //set the photo in the form
      this.subcategorySelected = this.subCategorie.id_category;
    } else {
      this.categorySelect();
    }
  }

  categorySelect() {
    this.subCategorie.id_category = this.subcategorySelected;
  }

  getCategories() {
    this.categoriesService.getDataOffline().subscribe(data => {
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
          this.subCategorie.name = result[0];
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
        this.subCategorie.image = this.url;
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