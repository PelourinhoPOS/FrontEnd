import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './FrontOffice/authentication/authentication.component';
import { AuthenticationDialogComponent } from './FrontOffice/authentication-dialog/authentication-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { FoodDrinksComponent } from './FrontOffice/food-drinks/food-drinks.component';
import { SwiperModule } from 'swiper/angular';
import { CategorySliderComponent } from './FrontOffice/category-slider/category-slider.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DrawerComponent } from './FrontOffice/drawer/drawer.component';
import { BoardComponent } from './FrontOffice/board/board.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KeyboardDialogComponent } from './FrontOffice/keyboard-dialog/keyboard-dialog.component';
import { ToastrModule } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { BoardDialogComponent } from './FrontOffice/board-dialog/board-dialog.component';
import { ChangeBoardDialogComponent } from './FrontOffice/change-board-dialog/change-board-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { ChangeProductDialogComponent } from './FrontOffice/change-product-dialog/change-product-dialog.component';
import { PaymentModalComponent } from './FrontOffice/payment-modal/payment-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { authenticationService } from './FrontOffice/authentication-dialog/authentication-dialog.service';
import { OnlineOfflineService } from './BackOffice/services/online-offline.service';
import { HttpClientModule } from '@angular/common/http';
import { DefaultModule } from './BackOffice/layouts/default/default.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    AuthenticationDialogComponent,
    FoodDrinksComponent,
    CategorySliderComponent,
    DrawerComponent,
    BoardComponent,
    KeyboardDialogComponent,
    BoardDialogComponent,
    ChangeBoardDialogComponent,
    ChangeProductDialogComponent,
    PaymentModalComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    SwiperModule,
    MatGridListModule,
    MatSidenavModule,
    MatTabsModule,
    DragDropModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    DefaultModule,
    ToastrModule.forRoot({
      timeOut: 1500,
      progressBar: true,
      progressAnimation: 'increasing',

    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [CookieService, authenticationService, OnlineOfflineService],
  bootstrap: [AppComponent]
})
export class AppModule { }