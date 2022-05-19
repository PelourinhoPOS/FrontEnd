import { Injectable } from '@angular/core';
import { ArtigosService } from 'src/app/BackOffice/modules/artigos/artigos.service';

@Injectable({
  providedIn: 'root'
})
export class CategorySliderService {

  constructor(private artigosService: ArtigosService) { }

  public categoryItems;

  getCategoryItems(id) {
    this.artigosService.getDataOffline().subscribe(data => {
      this.categoryItems = data.filter(item => item.id_category == id);
      console.log(this.categoryItems);
    });
  }
}
