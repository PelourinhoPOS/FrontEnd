import { Component, OnInit } from '@angular/core';
import { map, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialogComponent } from '../board-dialog/board-dialog.component';
import { ChangeBoardDialogComponent } from '../change-board-dialog/change-board-dialog.component';
import { MesasService } from 'src/app/BackOffice/modules/boards/mesas.service';
import { authenticationService } from '../authentication-dialog/authentication-dialog.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ZonasService } from 'src/app/BackOffice/modules/boards/zonas.service';

export interface DialogData {
  id: string,
  name: string,
  capacity: number,
  number: number,
  occupy: number,
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  public boards
  public self = []
  public position: any = {};
  public boardData;

  public subscriptionData!: Subscription; //subscription to refresh data

  public zones;
  public zonesById;

  selectedTabIndex = 0
  selectIdZone = 0;

  dragPosition = {
    x: 0,
    y: 0
  }

  constructor(public dialog: MatDialog, private mesasService: MesasService, public authService: authenticationService,
    public cookieService: CookieService, private router: Router, private zonesService: ZonasService) { }


  openDialog() {
    this.dialog.open(BoardDialogComponent, {
      width: '800px',
      height: '400px',
    });
  }

  onTabChanged(event) {
    this.selectIdZone = (event.tab.textLabel).split(' - ')[0];
    this.getBoards();
    this.getZonesById(this.selectIdZone);
  }

  openUpdateDialog(id) {
    this.mesasService.getDataOffline().subscribe(data => {
      this.boardData = data.find(x => x.id == id);


      this.dialog.open(ChangeBoardDialogComponent, {
        width: '540px',
        height: '440px',
        data: {
          id: this.boardData.id,
          name: this.boardData.name,
          capacity: this.boardData.capacity,
          number: this.boardData.number,
          occupy: this.boardData.occupy,
        }
      });
    })
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }

  onDragEnded(event, id) {

    let element = event.source.getRootElement();
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    let position: any = {
      id: id,
      dragPosition: {
        x: (boundingClientRect.x - parentPosition.left),
        y: (boundingClientRect.y - parentPosition.top),
      }
    }
    // this.position = event.source.getRootElement().getBoundingClientRect();

    // let position: any = {
    //   id: id,
    //   bottom: this.position.bottom,
    //   height: this.position.height,
    //   left: this.position.left,
    //   right: this.position.right,
    //   top: this.position.top,
    //   width: this.position.width,
    //   dragPosition: {
    //     x: this.position.x-210,
    //     y: this.position.y,
    //   }
    // }

    this.mesasService.updateDataOffline(position);
  }

  onPress(id) {
    this.router.navigate(['/food&drinks', id]);
    this.cookieService.set('boardId', id);
  }

  logout() {
    this.authService.stopWatch();
    this.cookieService.delete('userId');
    this.cookieService.delete('role');
  }

  getBoards() {
    this.mesasService.getDataOffline().pipe(
      map(data => data.filter(x => x.id_zone == this.selectIdZone))
    ).subscribe(data => {
      this.boards = data
      console.log(data);
    })
  }

  getZones() {
    this.zonesService.getDataOffline().subscribe(data => {
      this.selectIdZone = data[0].id;
      this.zones = data
    })
  }

  getZonesById(id: any) {
    this.zonesService.getDataOffline().pipe(
      map(data => data.filter(x => x.id == id))
    ).subscribe(data => {
      this.zonesById = data
    })
  }

  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

  ngOnInit(): void {
    this.getBoards();
    this.getZones();
    this.subscriptionData = this.mesasService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.getBoards();
      // this.listAllData();
    });
  }

}