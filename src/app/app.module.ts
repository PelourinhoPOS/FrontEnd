import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthenticationDialogComponent } from './authentication-dialog/authentication-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { SideBarComponent } from './side-bar/side-bar.component';
import { FoodDrinksComponent } from './food-drinks/food-drinks.component';
import { SwiperModule } from 'swiper/angular';
import { CategorySliderComponent } from './category-slider/category-slider.component';
@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    AuthenticationDialogComponent,
    SideBarComponent,
    FoodDrinksComponent,
    CategorySliderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    SwiperModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
