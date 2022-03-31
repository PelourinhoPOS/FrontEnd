import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-drinks',
  templateUrl: './food-drinks.component.html',
  styleUrls: ['./food-drinks.component.scss']
})
export class FoodDrinksComponent implements OnInit {

  position = '';
  visible = false;
  quantity: number = 1;

  public products = [
    { id: 1, name: 'Coca Cola', price: '2.10', weight: "50cl", image: 'https://www.spar.pt/images/thumbs/0003645_refrig-coca-cola-lata-033lt_550.jpeg' },
    { id: 2, name: 'Pepsi', price: '2.50', weight: "50cl", image: 'data:image/jpeg;base64,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' },
    { id: 3, name: 'Sprite', price: '1.90', weight: "100cl", image: 'https://www.continente.pt/dw/image/v2/BDVS_PRD/on/demandware.static/-/Sites-col-master-catalog/default/dw5386b794/images/col/599/5991639-hero.jpg?sw=2000&sh=2000' },
    { id: 4, name: 'Fanta', price: '3.00', weight: "50cl", image: 'data:image/jpeg;base64,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' },
    { id: 5, name: 'Coca Cola', price: '2.10', weight: "50cl", image: 'https://www.spar.pt/images/thumbs/0003645_refrig-coca-cola-lata-033lt_550.jpeg' },
    { id: 6, name: 'Pepsi', price: '1.00', weight: "250g", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqGT9OxdI7j78oYbAWgltb9O8Ek_0XjRaPsg&usqp=CAU' },
    { id: 7, name: 'Sprite', price: '1.00', weight: "200g", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwQRczcsW1q6aRz39DhDJx0FmJgbYa3OM85A&usqp=CAU' },
    { id: 8, name: 'Fanta', price: '1.00', weight: "350g", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2dI66fU-yV3E7VcHivZ9EnRUFb-xYUnnPkA&usqp=CAU' },
    { id: 9, name: 'Coca Cola', price: '1.00', weight: "150g", image: 'https://previews.123rf.com/images/rvlsoft/rvlsoft1509/rvlsoft150900014/45570624-big-hamburger-su-sfondo-bianco.jpg' },
    { id: 10, name: 'Pepsi', price: '1.00', weight: "150g", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqGT9OxdI7j78oYbAWgltb9O8Ek_0XjRaPsg&usqp=CAU' },
    { id: 11, name: 'Sprite', price: '1.00', weight: "210g", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwQRczcsW1q6aRz39DhDJx0FmJgbYa3OM85A&usqp=CAU' },
    { id: 12, name: 'Fanta', price: '1.00', weight: "500g", image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2dI66fU-yV3E7VcHivZ9EnRUFb-xYUnnPkA&usqp=CAU' },
  ]

  showFiller = false;

  constructor() { }

  ngOnInit(): void {
    if (localStorage.getItem('drawer') === '1') {
      this.visible = true;
      this.position = localStorage.getItem('position') ?? '';
    } else if (localStorage.getItem('drawer') === '0') {
      this.visible = false;
    }
  }

  setVisibilty(position: string) {
    this.visible = true;
    this.position = position;

    localStorage.setItem('drawer', '1');
    localStorage.setItem('position', position);
  }

  toggleVisibilty(position: string) {
    this.visible = !this.visible;
    this.position = position;

    const drawer = this.visible ? '1' : '0';
    localStorage.setItem('drawer', drawer);
    localStorage.setItem('position', position);
  }

  onDrawerHide() {
    localStorage.setItem('drawer', '0');
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    this.quantity--;
    if (this.quantity < 1) {
      this.quantity = 0;
    }
  }

}
