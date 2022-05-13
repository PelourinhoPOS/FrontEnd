import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import SwiperCore, { FreeMode, Pagination } from 'swiper';
import { CategoriesService } from 'src/app/BackOffice/modules/categories/categories.service';
import { ArtigosService } from 'src/app/BackOffice/modules/artigos/artigos.service';
import { SubcategoriesService } from 'src/app/BackOffice/modules/categories/subcategories.service';

SwiperCore.use([FreeMode, Pagination]);

@Component({
  selector: 'app-category-slider',
  templateUrl: './category-slider.component.html',
  styleUrls: ['./category-slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CategorySliderComponent implements OnInit {
  public selectedID: number = 0; //guarda o id do utilizador selecionado

  public categories = [];
  public categoryItems

  constructor(private categoryService: CategoriesService, private artigosService: ArtigosService, private subcategoryService: SubcategoriesService) { }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategoryItems(id) {
    this.artigosService.getDataOffline().subscribe(data => {
      this.categoryItems = data.filter(item => item.id_category == id);
      console.log(this.categoryItems);
    });

    // db.collection('products')
    //   .doc({ category: name })
    //   .get()
    //   .then((categoryItems) => {
    //     this.categoryItems = categoryItems;
    //     console.log(this.categoryItems.name);
    //   });
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
    let categoryData = document.getElementById('card ' + id);
    let oldCategoryData = document.getElementById('card ' + this.selectedID);

    if (id != this.selectedID) {
      //console.log("id " + id + " selecionado")
      if (categoryData) {
        categoryData.style.backgroundColor = '#f7e083';
        categoryData.style.padding = '11px';
        categoryData.style.borderRadius = '12px';
      }
      if (oldCategoryData) {
        oldCategoryData.style.backgroundColor = '';
      }
    }
    this.selectedID = id;
  }
}
