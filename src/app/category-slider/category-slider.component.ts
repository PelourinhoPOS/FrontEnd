import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import SwiperCore, { FreeMode, Pagination } from "swiper";

SwiperCore.use([FreeMode, Pagination]);

@Component({
  selector: 'app-category-slider',
  templateUrl: './category-slider.component.html',
  styleUrls: ['./category-slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CategorySliderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
