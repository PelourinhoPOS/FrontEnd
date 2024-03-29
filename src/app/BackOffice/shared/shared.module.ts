import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { AreaComponent } from './widgets/area/area.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualKeyboardComponent } from './components/virtual-keyboard/virtual-keyboard.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { InputMaskModule } from '@ngneat/input-mask';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    AreaComponent,
    VirtualKeyboardComponent,
    DeleteModalComponent,
    ImageGalleryComponent,
  ],
  imports: [
    CommonModule,
    MatDividerModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,
    MatMenuModule,
    MatListModule,
    RouterModule,
    HighchartsChartModule,
    FormsModule,
    MatGridListModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    InputMaskModule.forRoot({ inputSelector: 'input', isAsync: true }),
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    AreaComponent,
    VirtualKeyboardComponent,
    DeleteModalComponent
  ],
  providers: [CookieService],
})
export class SharedModule { }
