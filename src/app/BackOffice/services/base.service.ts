import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Observable, Subject, from, of } from 'rxjs';
import { Dexie } from 'dexie';
import { ToastrService } from 'ngx-toastr';
import { OnlineOfflineService } from './online-offline.service';
import { tap } from 'rxjs/operators';

@Inject({
  providedIn: 'root'
})
export abstract class BaseService<T extends { id: number }> {

  //variables dexie-indexedDB
  private db: Dexie = new Dexie('pos');
  private table!: Dexie.Table<T, any>;

  protected http!: HttpClient;
  protected onlineOfflineService!: OnlineOfflineService;
  protected toastr!: ToastrService;

  private sendData: boolean = false;

  constructor(protected injector: Injector, protected nomeTabela: string, protected urlAPI: string, protected dataName: string) {
    this.http = this.injector.get(HttpClient);
    this.onlineOfflineService = this.injector.get(OnlineOfflineService);
    this.toastr = this.injector.get(ToastrService);

    this.listenerStatusConnection(); //listener status connection
    this.startIndexedDb(); //start indexedDB
  }

  public refreshData = new Subject<void>();

  //sync data with API every 10 minutes 
  synchronizeData() {
    setInterval(() => {
      this.sendDatatoAPI();
    }, 600000);
  }

  //get status of connection
  listenerStatusConnection() {
    this.onlineOfflineService.statusConection.subscribe(
      online => {
        if (online) {
          this.toastr.info('Está online!', 'Aviso');
          //this.sendDatatoAPI()
        } else {
          this.toastr.info('Está offline', 'Aviso');
        }
      }
    )
  }

  //configuration table indexedDB
  startIndexedDb() {
    //this.db = new Dexie('pos-' + this.nomeTabela)
    this.db.version(1).stores({
      cliente: 'id',
      empregado: 'id',
    });
    this.table = this.db.table(this.nomeTabela);
  }

  //register data in API
  registerAPI(data: T) {
    return this.http.post(this.urlAPI, data).pipe(
      tap(() => {
        this.refreshData.next();
      })
    ).subscribe(
      () => {
        if (!this.sendData) {
          this.toastr.success(this.dataName + ' registado com sucesso!');
        }
      }, error => {
        this.toastr.error(error, 'Erro ao registar ' + this.dataName + '. Tente novamente mais tarde.');
      }
    );
  }

  //register data offline in indexedDB
  async registerDataOffline(data: T) {
    try {
      const allData: T[] = await this.table.toArray();

      if (allData.length > 0) {
        let lastID: any = allData[allData.length - 1].id;
        data.id = lastID + 1;
      } else {
        data.id = 1;
      }

      await this.table.add(data);
      this.refreshData.next();
      this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

    } catch (error) {
      this.toastr.error('Erro ao guardar ' + this.dataName + ' localmente', 'Aviso');
      //console.log('erro ao salvar data offline ' + error);
    }
  }

  //update data in LocalStorage
  async updateDataOffline(data: T) {
    try {
      await this.table.update(data.id, data);
      this.refreshData.next();
      this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');
    } catch (error) {
      this.toastr.error('Erro ao atualizar ' + this.dataName + ' localmente', 'Aviso');
      //console.log('erro ao atualizar data offline ' + error);
    }
  }

  //delete data from LocalStorage
  async deleteDataOffline(data: T){
    try {
      await this.table.delete(data.id);
      this.refreshData.next();
      this.toastr.info(this.dataName + ' eliminado', 'Aviso');
    } catch (error) {
      this.toastr.error('Erro ao eliminar ' + this.dataName + ' localmente', 'Aviso');
      //console.log('erro ao eliminar data offline ' + error);
    }
  }

  //get data from LocalStorage
  getDataOffline() {
    // this.table.toArray().then(
    //   (data) => {
    //     for (let i = 0; i < data.length; i++) {
    //       this.dataOffArray[i] = data[i];
    //     }
    //   }
    // );

    // return of(this.dataOffArray);
     const allData = from(this.table.toArray());
     return allData;
  }

  //send data to API when online
  async sendDatatoAPI() {

    this.sendData = true;

    try {
      const allData: T[] = await this.table.toArray();

      for (const data of allData) {
        this.registerAPI(data);
        await this.table.delete(data.id);
        //console.log('eliminou localmente')
      }

      //when data in indexedDB is send to API, send the notification to the user
      if (allData.length > 0) {
        this.toastr.info(this.dataName + 's enviados para o servidor!', 'Aviso');
      }
    } catch (error) {
      this.toastr.error(this.dataName + 's não enviados para o servidor, tente mais tarde', 'Aviso');
    }

  }

  //register function - if online register in api, if offline register in indexedDB
  register(data: T) {
    //  if (this.onlineOfflineService.isOnline) { //if online
    //    this.registerAPI(data); //register in api
    //  } else { //if offline
    //    this.registerDataOffline(data); //register in indexedDB
    //    //console.log('salvar na base de dados local');
    //  }
    this.registerDataOffline(data);
  }

  update(data: T) {
    this.updateDataOffline(data);
  }

  delete(data: T) {
    this.deleteDataOffline(data);
  }

  //list data from API
  list(): Observable<T[]> {
    return this.http.get<T[]>(this.urlAPI);
  }
}
