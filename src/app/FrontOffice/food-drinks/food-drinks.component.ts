import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KeyboardDialogComponent } from '../keyboard-dialog/keyboard-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ChangeProductDialogComponent } from '../change-product-dialog/change-product-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { authenticationService } from '../authentication-dialog/authentication-dialog.service';
import { EmpregadosService } from 'src/app/BackOffice/modules/empregados/empregados.service';
import { ArtigosService } from 'src/app/BackOffice/modules/artigos/artigos.service';
import { MesasService } from 'src/app/BackOffice/modules/mesas/mesas.service';
import { Mesa } from 'src/app/BackOffice/models/mesa';
import { Subscription, map } from 'rxjs';
import SwiperCore, { FreeMode, Pagination } from 'swiper';
import { CategoriesService } from 'src/app/BackOffice/modules/categories/categories.service';

import { SubcategoriesService } from 'src/app/BackOffice/modules/categories/subcategories.service';

SwiperCore.use([FreeMode, Pagination]);

@Component({
  selector: 'app-food-drinks',
  templateUrl: './food-drinks.component.html',
  styleUrls: ['./food-drinks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FoodDrinksComponent implements OnInit {
  public item: string;
  public boardId;
  public board;
  public cart = [];
  public total: number;
  public totalIva: number;
  public userId;
  public avatar: string;
  public time: string;
  public products;
  public productId;
  public userData;
  public subscriptionData!: Subscription; //subscription to refresh data
  public productarray: any = [];
  public quantity: number = 0;
  public ivaround;
  public selectedID: number = 0; //guarda o id do utilizador selecionado
  public id: number = 0;
  public categories = [];
  public categoryItems;
  public subCategories;
  public subcategoryItems;
  public length: number = 0;
  public changedprice;

  constructor(
    private empregadosService: EmpregadosService,
    private artigosService: ArtigosService,
    private mesasService: MesasService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private authService: authenticationService,
    private categoryService: CategoriesService,
    private subcategoryService: SubcategoriesService
  ) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(KeyboardDialogComponent, {
      data: { name: this.item },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.item = result;
    });
  }

  getCookies() {
    this.userId = parseInt(this.cookieService.get('userId'));

    this.empregadosService.getDataOffline().subscribe((data) => {
      this.userData = data.find(x => x.id == this.userId)
    })

    // db.collection('empregado').doc({ id: this.userId }).get().then((user) => {
    //   this.userData = user;
    //   console.log(this.userData);
    // });
  }

  openProductDialog(id) {
    const dialogRef = this.dialog.open(ChangeProductDialogComponent, {
      width: '750px',
      height: '550px',
      data: {
        id: id,
        cart: this.cart,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.cart.forEach(element => {
        if (result == null) {
          element.product.price = element.product.price;
        } else if (element.product.id == id) {
          element.product.price = result;
          this.changedprice = result;
        }
      });
      this.totalPrice();
    });
  }

  // public artigo: Artigo = {
  //   id: 0,
  //   name: 'tete',
  //   price: 2.15,
  //   iva: 0.23,
  //   weight: 0.75,
  //   id_category: 1,
  //   image:
  //     'data:image/jpeg;base64,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',
  // }

  // addNewProduct() {
  //   this.artigosService.registerDataOffline(this.artigo);
  // }

  getProducts() {
    this.artigosService.getDataOffline().subscribe((data) => {
      this.products = data;
      this.categoryItems = data;
    });
  }

  getBoard() {
    this.mesasService.getDataOffline().subscribe((data) => {
      this.board = data.find(x => x.id == this.boardId);
      if (this.board.cart) {
        this.cart = this.board.cart;
      }
      this.totalPrice();
    })
  }

  // Verify if Product Data Come by Id

  // getProduct(id) {
  //   console.log(this.products[id]);
  // }

  getProductsId() {
    this.mesasService.getDataOffline().subscribe((data) => {
      data.forEach((board) => {
        this.productId = data.find(x => x.id == this.boardId)

        board.cart?.forEach((id) => {
          this.productarray.push(id.product.id);
        });

      })
    })
  }

  addProduct(id) {

    let product;

    this.artigosService.getLocalDataFromId('id', id).then(
      (data => {
        product = data

        if (!this.productarray.includes(id)) {
          this.cart.push({ product: product[0], quantity: 1 });
          this.totalPrice();
        } else {
          for (let i = 0; i < this.cart.length; i++) {
            if (this.cart[i].product.id == id) {
              this.cart[i].quantity++;
              this.totalPrice();
            }
          }
        }
      })
    );

    let mesa: Mesa = {
      id: this.boardId,
      cart: this.cart,
      total: this.total
    }

    this.mesasService.updateDataOffline(mesa);
  }

  removeProduct(id) {

    let mesa: Mesa = {
      id: this.boardId,
      cart: this.cart,
      total: this.total
    }

    this.cart.forEach((product) => {
      if (product.product.id == id) {
        this.cart.splice(this.cart.indexOf(product), 1);
        this.productarray.splice(this.productarray.indexOf(id));
      }
      this.mesasService.updateDataOffline(mesa);
    });
  }

  totalPrice() {
    const round = (num, places) => {
      return +parseFloat(num).toFixed(places);
    };

    let total = 0;
    this.cart.forEach((product) => {
      total += product.product.price * product.quantity;
    });
    this.getIva();
    this.total = round(total + this.totalIva, 2);
  }

  getIva() {
    let iva = 0;
    this.cart.forEach((product) => {
      iva += product.product.iva * product.product.price * product.quantity;
    });
    this.totalIva = parseFloat(iva.toFixed(2));
  }

  getAuthTime() {
    this.time = this.authService.getTime();
  }

  getSubCategory(id) {
    this.subcategoryService.getDataOffline().pipe(
      map(data => data.filter(item => item.id_category == id)))
      .subscribe(data => {
        this.subCategories = data;
        this.length = this.subCategories.length;
      })
  }

  getSubCategoryItems(id) {
    this.artigosService.getDataOffline().pipe(
      map(data => data.filter(item => item.id_subcategory == id)))
      .subscribe(data => {
        this.categoryItems = data;
      });
  }

  getCategoryItems(id) {
    this.artigosService.getDataOffline().subscribe(data => {
      this.categoryItems = data.filter(item => item.id_category == id);
    });
  }

  getCategories() {
    this.categoryService.getDataOffline().subscribe(data => {
      this.categories = data;
    })
  }

  teste(id: number): number {
    return id;
  }

  selectCategory(id: number) {
    this.id = 0;

    let categoryData = document.getElementById('card ' + id);
    let oldCategoryData = document.getElementById('card ' + this.selectedID);

    if (id != this.selectedID) {
      // console.log("id " + id + " selecionado")
      if (categoryData) {
        categoryData.style.backgroundColor = '#f7e083';
        categoryData.style.width = '90%';
        categoryData.style.height = '90%';
        categoryData.style.borderRadius = '15px';
        categoryData.style.display = 'flex';
        categoryData.style.flexDirection = 'column';
        categoryData.style.justifyContent = 'center';
        categoryData.style.alignItems = 'center';
        categoryData.style.border = '3px solid orange';
      }
      if (oldCategoryData) {
        oldCategoryData.style.backgroundColor = 'white';
        oldCategoryData.style.border = 'none';
      }
    }
    this.selectedID = id;
  }

  selectSubCategory(id: number) {

    let subcategoryData = document.getElementById('cardSub ' + id);
    let oldSubcategoryData = document.getElementById('cardSub ' + this.id);

    if (id != this.id) {
      console.log(this.id)
      if (subcategoryData) {
        subcategoryData.style.backgroundColor = '#f7e083';
        subcategoryData.style.width = '90%';
        subcategoryData.style.height = '90%';
        subcategoryData.style.borderRadius = '15px';
        subcategoryData.style.display = 'flex';
        subcategoryData.style.flexDirection = 'column';
        subcategoryData.style.justifyContent = 'center';
        subcategoryData.style.alignItems = 'center';
      }

      if (oldSubcategoryData) {
        oldSubcategoryData.style.backgroundColor = '';
        oldSubcategoryData.style.display = 'flex';
        oldSubcategoryData.style.flexDirection = 'column';
        oldSubcategoryData.style.alignItems = 'center';
        oldSubcategoryData.style.justifyContent = 'center';
        oldSubcategoryData.style.width = '90%';
        oldSubcategoryData.style.height = '90%';
        oldSubcategoryData.style.border = '3px solid orange';
        oldSubcategoryData.style.borderRadius = '15px';
      }
    }
    this.id = id;
  }

  ngOnInit(): void {
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.boardId = id;
    this.getCategories();
    this.getProductsId();
    //this.addNewProduct();
    this.getProducts();
    this.getBoard();
    this.selectCategory(0);
    this.getCookies();
    this.getAuthTime();
    this.subscriptionData = this.authService.refreshData.subscribe(() => {
      this.getAuthTime();
    });
  }
}
