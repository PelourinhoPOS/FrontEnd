import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, map, Observable, of, Subscription } from 'rxjs';
import { BoardDialogComponent } from 'src/app/FrontOffice/board-dialog/board-dialog.component';
import { ChangeBoardDialogComponent } from 'src/app/FrontOffice/change-board-dialog/change-board-dialog.component';
import { Mesa } from '../../models/mesa';
import { Zone } from '../../models/zone';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { MesasService } from './mesas.service';
import { ZonasService } from './zonas.service';

export interface DialogData {
  id: string,
  name: string,
  capacity: number,
  number: number,
  occupy: number,
}

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrls: ['./mesas.component.scss']
})

export class MesasComponent implements OnInit, AfterViewInit {

  constructor(public dialog: MatDialog, private mesasService: MesasService, private zonesService: ZonasService, private onlineOfflineService: OnlineOfflineService, private toastr: ToastrService, public cookieService: CookieService) { }

  public mesas!: Observable<Mesa[]>; //save the employees returned from the API
  public mesasOff!: Observable<Mesa[]>; //save the employees returned from the local storage
  public allmesasData!: Observable<Mesa[]>; //save all employees from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table



  selectedRowIndex = -1; //save the selected index from the table

  orderBy = 'name'; //save the order by selected

  showProgressBar = false;

  displayedColumns: string[] = ['name', 'capacity', 'number', 'type'];
  dataSource = new MatTableDataSource<Mesa>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  title = 'Angular Vertical Tabs';
  viewMode;

  /////////////////////////

  public boards
  public self = []
  public position: any = {};
  public boardData;
  public zones;
  public zonesById;

  selectedTabIndex = 0
  selectIdZone = 0;

  /////////////////////////

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    
    this.getZones();

    this.subscriptionData = this.mesasService.refreshData.subscribe(() => {
      this.getBoards();
    });
    this.subscriptionData = this.zonesService.refreshData.subscribe(() => {
      this.getZones();
    });
  }

  //register data in API or local storage
  async register(zone: Zone) {
    await this.zonesService.register(zone).then(() => {
      this.toastr.success('Zona registada com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //update data in API or local storage
  async update(zone: Zone) {
    await this.zonesService.update(zone).then(() => {
      this.toastr.success('Zona atualizada com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //function to delete a employee
  async delete(zone: Zone) {
    await this.zonesService.delete(zone).then(() => {
      this.toastr.success('Zona eliminada com sucesso.');
    }).catch((err) => {
      err
    });
  }

  //search data from API
  listAPIdata(): void {
    this.mesas = this.mesasService.list();
  }

  //search data from local storage
  async listLocalData() {

    this.showProgressBar = true;

    this.mesasOff = this.mesasService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => b.id - a.id))
    );

    this.mesasService.getDataOffline().pipe(
      map(arr => arr.sort((a, b) => b.id - a.id))
    ).subscribe(data => {
      this.mesasOff = of(data);
      this.dataSource.data = data
    });

    setInterval(() => {
      this.showProgressBar = false;
    }, 1300);

  }

  //save data of all clients from API and local storage
  listAllData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.allmesasData = combineLatest(this.mesas, this.mesasOff).pipe(
          map(([a, b]) => a.concat(b))
        ).pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        );
        break;

      // case 'localidade'://order by localidade
      //   this.allEmpregadosData = combineLatest(this.empregados, this.empregadosOff).pipe(
      //     map(([a, b]) => a.concat(b))
      //   ).pipe(
      //     map(arr => arr.sort((a, b) => a.county.localeCompare(b.county)))
      //   );
      //   break;

      case 'id'://order by id
        this.allmesasData = combineLatest(this.mesas, this.mesasOff).pipe(
          map(([a, b]) => a.concat(b))
        )
        break;
    }
  }

  //function to sinchronize data from local storage to API
  synchronizeData() {
    this.mesasService.sendDatatoAPI();
  }

  //function that opens the create client modal
  openCreateModal() {
    this.unselectRow();
    const dialogRef = this.dialog.open(CreateBoardModalComponent, {
      height: '690px',
      width: '770px',
    });
    dialogRef.afterClosed().subscribe(data => {
      //console.log(data)
      if (data) {
        this.register(data);
      }
    });
  }

  //function that opens the update client modal
  openUpdateModal(data: any) {
    if (data[0]) {
      const dialogRef = this.dialog.open(CreateBoardModalComponent, {
        height: '690px',
        width: '770px',
        data: { values: data[0], update: true }
      });
      dialogRef.afterClosed().subscribe(data => {
        // console.log(data)
        if (data) {
          this.update(data);
        }
      });
    } else {
      this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    }
  }

  //function that opens the delete client modal
  openDeleteModal(data: any) {
    if (data[0]) {
      const dialogRef = this.dialog.open(DeleteModalComponent, {
        height: '30%',
        width: '50%',
        data: { values: data[0] }
      });
      dialogRef.afterClosed().subscribe(data => {
        // console.log(data)
        if (data) {
          this.delete(data);
        }
      });
    } else {
      this.toastr.info('É necessário escolher um registo para continuar.', 'Aviso');
    }
  }

  //function to know which line is selected
  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
  }

  //function event to change the order by
  onOptionsSelected() {
    this.listAllData();
  }

  //function to unselect the selected row
  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  onTabChanged(event) {
    this.selectIdZone = (event.tab.textLabel).split(' - ')[0];
    this.getBoards();
    this.getZonesById(this.selectIdZone);
  }

  openDialog() {
    this.dialog.open(BoardDialogComponent, {
      width: '800px',
      height: '400px',
      data: this.selectIdZone
    });
  }

  openUpdateDialog(id) {
    this.mesasService.getDataOffline().subscribe(data => {
      this.boardData = data.find(x => x.id == id);

      this.dialog.open(ChangeBoardDialogComponent, {
        width: '540px',
        height: '480px',
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

    this.mesasService.updateDataOffline(position).then(() => {
      this.toastr.info('Posição atualizada com sucesso.');
    }).catch(() => {
      this.toastr.error('Não foi possível atualizar a posição.', 'Erro');
    })  //update position of the board
  }

  getBoards() {
    this.mesasService.getDataOffline().pipe(
      map(data => data.filter(x => x.id_zone == this.selectIdZone))
    ).subscribe(data => {
      this.boards = data
    })
  }

  getZones() {
    this.zonesService.getDataOffline().subscribe(data => {
      this.selectIdZone = data[0].id;
      this.zones = data;
      this.getBoards();
      this.getZonesById(this.selectIdZone);
    })
  }

  getZonesById(id: any) {
    this.zonesService.getDataOffline().pipe(
      map(data => data.filter(x => x.id == id))
    ).subscribe(data => {
      this.zonesById = data
    })
  }

  deleteCollection() {

    this.boards.forEach(board => {
      this.mesasService.deleteDataOffline(board);
    });

    //   db.collection('boards').delete().then(() => {
    //     window.location.reload();
    //   })
  }

  logout() {
    this.cookieService.delete('userId');
    this.cookieService.delete('role');
  }

  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

}

/////////////////////////// // CREATE ZONE MODAL COMPONENT // /////////////////////////////////////////////

@Component({
  selector: 'create-new-zone',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./mesas.component.scss']
})

export class CreateBoardModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) { }

  public zone: Zone = new Zone(); //save the client data
  public dialogRef: any; //save the dialog reference
  public update: boolean = false; //save if is update or create

  fileName = '';
  url = './assets/images/user.png';
  typeSelected = 'square';

  ngOnInit(): void {
    //get the data from client and set it in the form
    if (this.data) {
      this.update = true; //set update to true, to know if is update or create
      this.zone = this.data.values; //set the data in the form
      this.url = this.data.values.image;
      this.fileName = 'Alterar imagem'; //set the file name
    } else {

    }

  }

  onFileSelected(event) {

    const file: File = event.target.files[0];

    if (file) {
      var reader = new FileReader();
      reader.readAsDataURL(file)
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.zone.image = this.url;
      }
      // this.fileName = file.name;
      // const formData = new FormData();
      // formData.append("thumbnail", file);
      // console.log(file);
      // const upload$ = this.http.post("/api/thumbnail-upload", formData);
      // upload$.subscribe();
    }
  }

  //open the modal keyboard
  openKeyboard(inputName: string, type: string, data: any, maxLength?: number) {
    //verify if type is number or text to open the respective keyboard
    if (type == 'text') { //if text
      this.dialogRef = this.dialog.open(VirtualKeyboardComponent, {
        height: '57%',
        width: '48%',
        data: [inputName, type, data, maxLength]
      });
    } else { //else is number
      this.dialogRef = this.dialog.open(VirtualKeyboardComponent, {
        height: '72%',
        width: '48%',
        data: [inputName, type, data, maxLength]
      });
    }

    this.dialogRef.afterClosed().subscribe((result: any) => {
      //switch to know which input is changed
      switch (result[1][0]) {
        case 'name':
          this.zone.name = result[0];
          break;
      }
    });
  }
}