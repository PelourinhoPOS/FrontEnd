import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-drinks',
  templateUrl: './food-drinks.component.html',
  styleUrls: ['./food-drinks.component.scss']
})
export class FoodDrinksComponent implements OnInit {

  public products = [
    { id: 1, name: 'Coca Cola', price: '1.00', image: 'https://previews.123rf.com/images/rvlsoft/rvlsoft1509/rvlsoft150900014/45570624-big-hamburger-su-sfondo-bianco.jpg' },
    { id: 2, name: 'Pepsi', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqGT9OxdI7j78oYbAWgltb9O8Ek_0XjRaPsg&usqp=CAU' },
    { id: 3, name: 'Sprite', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwQRczcsW1q6aRz39DhDJx0FmJgbYa3OM85A&usqp=CAU' },
    { id: 4, name: 'Fanta', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2dI66fU-yV3E7VcHivZ9EnRUFb-xYUnnPkA&usqp=CAU' },
    { id: 1, name: 'Coca Cola', price: '1.00', image: 'https://previews.123rf.com/images/rvlsoft/rvlsoft1509/rvlsoft150900014/45570624-big-hamburger-su-sfondo-bianco.jpg' },
    { id: 2, name: 'Pepsi', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqGT9OxdI7j78oYbAWgltb9O8Ek_0XjRaPsg&usqp=CAU' },
    { id: 3, name: 'Sprite', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwQRczcsW1q6aRz39DhDJx0FmJgbYa3OM85A&usqp=CAU' },
    { id: 4, name: 'Fanta', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2dI66fU-yV3E7VcHivZ9EnRUFb-xYUnnPkA&usqp=CAU' },
    { id: 1, name: 'Coca Cola', price: '1.00', image: 'https://previews.123rf.com/images/rvlsoft/rvlsoft1509/rvlsoft150900014/45570624-big-hamburger-su-sfondo-bianco.jpg' },
    { id: 2, name: 'Pepsi', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqGT9OxdI7j78oYbAWgltb9O8Ek_0XjRaPsg&usqp=CAU' },
    { id: 3, name: 'Sprite', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwQRczcsW1q6aRz39DhDJx0FmJgbYa3OM85A&usqp=CAU' },
    { id: 4, name: 'Fanta', price: '1.00', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2dI66fU-yV3E7VcHivZ9EnRUFb-xYUnnPkA&usqp=CAU' },
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
