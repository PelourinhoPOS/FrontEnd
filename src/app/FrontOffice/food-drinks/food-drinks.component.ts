import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KeyboardDialogComponent } from '../keyboard-dialog/keyboard-dialog.component';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { ChangeProductDialogComponent } from '../change-product-dialog/change-product-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { authenticationService } from '../authentication-dialog/authentication-dialog.service';
import { UsersService } from 'src/app/BackOffice/modules/users/users.service';
import { ArtigosService } from 'src/app/BackOffice/modules/artigos/artigos.service';
import { MesasService } from 'src/app/BackOffice/modules/boards/mesas.service';
import { Mesa } from 'src/app/BackOffice/models/mesa';
import { Subscription, map } from 'rxjs';
import SwiperCore, { FreeMode, Pagination } from 'swiper';
import { CategoriesService } from 'src/app/BackOffice/modules/categories/categories.service';
import { Router } from '@angular/router';

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
  public categories: any = [];
  public categoryItems;
  public subCategories;
  public subcategoryItems;
  public length: number = 0;
  public changedprice;
  public selfid;
  public productbyid;
  public asked;
  public subcategories = [];
  public find;

  constructor(
    private empregadosService: UsersService,
    private artigosService: ArtigosService,
    private mesasService: MesasService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,
    private authService: authenticationService,
    private categoryService: CategoriesService,
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
  }

  openProductDialog(id) {
    const dialogRef = this.dialog.open(ChangeProductDialogComponent, {
      width: '750px',
      height: '580px',
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
          this.totalPrice();

          let mesa: Mesa = {
            id: this.boardId,
            cart: this.cart,
            total: this.total
          }

          this.mesasService.updateDataOffline(mesa)
        }
      });
    });
  }

  getProducts() {
    this.artigosService.getDataOffline().subscribe((data) => {
      this.products = data;
      this.categoryItems = data;
    });
  }

  getBoard() {
    this.mesasService.getDataOffline().subscribe((data) => {
      this.board = data.find(x => x.id == this.boardId);
      console.log(this.board);
      if (this.board.cart) {
        this.cart = this.board.cart;
        this.board.products = this.board.cart.map(x => x.product.id);
        this.productarray = this.board.products;
      }
      this.totalPrice();
    })
  }

  // Verify if Product Data Come by Id

  // getProduct(id) {
  //   console.log(this.products[id]);
  // }

  getProductsId(id) {
    setTimeout(() => {
      this.productarray.push(id)
      let mesa: any = {
        id: this.boardId,
        products: this.productarray
      }
      this.mesasService.update(mesa);
    }, 100);
  }

  addProduct(id) {

    let product;

    this.artigosService.getLocalDataFromId('id', id).then(
      (data => {
        product = data;
        this.find = this.cart.find(x => x.product.id == id);
        
        if (this.productarray.includes(id) == false || this.find === undefined) {
          this.cart.push({ product: product[0], quantity: 1 });
        } else {
          for (let i = 0; i < this.cart.length; i++) {
            this.selfid = this.cart[i].product.id
            // this.getProductById();
            this.artigosService.getLocalDataFromId('id', this.selfid).then(
              (data => {
                this.productbyid = data;
                console.log(data);
                if (this.cart[i].product.id == id && this.productbyid[0].price == this.cart[i].product.price) {
                  this.cart[i].quantity++;
                  this.totalPrice();
                  let mesa: Mesa = {
                    id: this.boardId,
                    cart: this.cart,
                    total: this.total
                  }

                  this.mesasService.updateDataOffline(mesa);
                }
              })
            );
          }
        }
        this.totalPrice();

        let mesa: Mesa = {
          id: this.boardId,
          cart: this.cart,
          total: this.total
        }

        this.mesasService.updateDataOffline(mesa);
      }));
  }

  // getProductById() {
  //   this.artigosService.getLocalDataFromId('id', this.selfid).then(
  //     (data => {
  //       this.productbyid = data;
  //       console.log(data);
  //     })
  //   );
  // }

  removeProduct(id) {

    this.cart.forEach((product) => {
      if (product.product.id == id) {
        this.cart.splice(this.cart.indexOf(product), 1);
        this.productarray.splice(this.productarray.indexOf(id));
      }

      this.totalPrice();

      let mesa: any = {
        id: this.boardId,
        cart: this.cart,
        total: this.total,
        products: this.productarray
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

  getCategoryItems(id) {
    this.artigosService.getDataOffline().subscribe(data => {
      this.categoryItems = data.filter(item => item.id_category == id);
    });
  }

  getCategories() {
    this.categoryService.getDataOffline().pipe(map(data => data.filter(item => item.id_category == 0))).subscribe(data => {
      this.categories = data;
    });
  }

  getSubcategories(id) {
    this.categoryService.getDataOffline().pipe(map(data => data.filter(item => item.id_category == id))).subscribe(data => {
      this.subcategories = data;
      this.length = this.subcategories.length;
    });
  }

  teste(id: number): number {
    return id;
  }

  openAsk() {

    let MesaPedido: any = {
      boardType: 'Pedidos',
      cart: [],
    }

    this.mesasService.getLocalDataFromId('boardType', 'Pedidos').then((data) => {
      if (data.length == 0) {
        this.mesasService.registerDataOffline(MesaPedido);
      } else {
        this.asked = data[0].id;
        this.cookieService.set('boardId', this.asked);
      }
      this.router.navigate(['/food&drinks/' + this.asked]);
    });
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

  removeFilters() {
    this.item = undefined;
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let id = parseInt(this.route.snapshot.paramMap.get('id'));
        this.boardId = id;
        this.getCategories();
        //this.addNewProduct();
        this.getBoard();
        this.getProducts();
        this.selectCategory(0);
        this.getCookies();
        this.getAuthTime();
      }
    });
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.boardId = id;
    this.getCategories();
    //this.addNewProduct();
    this.getBoard();
    this.getProducts();
    this.selectCategory(0);
    this.getCookies();
    this.getAuthTime();
    this.subscriptionData = this.authService.refreshData.subscribe(() => {
      this.getAuthTime();
    });
  }
}