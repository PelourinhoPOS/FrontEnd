import { HttpClient } from '@angular/common/http';
import { Inject, Injector } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { Dexie } from 'dexie';
import { ToastrService } from 'ngx-toastr';
import { OnlineOfflineService } from './online-offline.service';
import { tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Inject({
  providedIn: 'root'
})
export abstract class BaseService<T extends { id: number, nif?: number, phone?: number, name?: string, id_category?: number }> {

  //variables dexie-indexedDB
  private db: Dexie = new Dexie('pos');
  private table!: Dexie.Table<T, any>;
  protected http!: HttpClient;
  protected onlineOfflineService!: OnlineOfflineService;
  protected toastr!: ToastrService;
  protected cookieService: CookieService

  private sendData: boolean = false;

  constructor(protected injector: Injector, protected nomeTabela: string, protected urlAPI: string, protected dataName: string) {
    this.http = this.injector.get(HttpClient);
    this.onlineOfflineService = this.injector.get(OnlineOfflineService);
    this.toastr = this.injector.get(ToastrService);
    this.cookieService = this.injector.get(CookieService);
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
      mesa: 'id',
      artigo: 'id',
      categories: 'id',
      subcategories: 'id, id_category',
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

  public getData: any;
  public nifCliente: any;

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

      this.validateData(data, 'register');

    } catch (error) {
      this.toastr.error('Erro ao guardar ' + this.dataName + ' localmente', 'Aviso');
      //console.log('erro ao salvar data offline ' + error);
    }
  }

  //validate data before register or update
  async validateData(data: T, method: string) {

    switch (this.nomeTabela) {

      case 'cliente':
        try {
          this.getDataOffline().subscribe(async (getData: any[]) => {
            this.getData = getData.find(x => x.nif == data.nif || x.phone == data.phone);

            if (this.getData === undefined || this.getData.id == data.id) {
              if (method === 'register') {

                await this.table.add(data);
                this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

              } else if (method === 'update') {

                await this.table.update(data.id, data);
                this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');

              }
              this.refreshData.next();
            } else {
              this.toastr.warning('Já existe um cliente registado com estes dados', 'Aviso');
              this.refreshData.next();
            }

          });
        } catch (error) {
          this.toastr.error('Erro ao validar os dados', 'Aviso');
        }
        break;

      case 'empregado':
        try {
          this.getDataOffline().subscribe(async (getData: any[]) => {
            this.getData = getData.find(x => x.phone == data.phone);

            if (this.getData === undefined || this.getData.id == data.id) {
              if (method === 'register') {

                await this.table.add(data);
                this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

              } else if (method === 'update') {

                await this.table.update(data.id, data);
                this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');

              }

              this.refreshData.next();

            } else {
              this.toastr.warning('Já existe um utilizador registado com estes dados', 'Aviso');
              this.refreshData.next();
            }

          });
        } catch (error) {
          this.toastr.error('Erro ao validar os dados', 'Aviso');
        }
        break;

      default:
        try {
          if (method === 'register') {

            await this.table.add(data);
            this.refreshData.next();
            this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

          } else if (method === 'update') {

            await this.table.update(data.id, data);
            this.refreshData.next();
            this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');

          }

          this.refreshData.next();

        } catch (error) {
          this.toastr.error('Erro ao validar os dados', 'Aviso');
        }
        break;

      // case 'artigo':
      //   try {
      //     if (method === 'register') {

      //       await this.table.add(data);
      //       this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

      //     } else if (method === 'update') {

      //       await this.table.update(data.id, data);
      //       this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');

      //     }

      //     this.refreshData.next();

      //   } catch (error) {
      //     this.toastr.error('Erro ao validar os dados', 'Aviso');
      //   }
      //   break;

      // case 'categories':
      //   try {
      //     if (method === 'register') {

      //       await this.table.add(data);
      //       this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

      //     } else if (method === 'update') {

      //       await this.table.update(data.id, data);
      //       this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');

      //     }

      //     this.refreshData.next();

      //   } catch (error) {
      //     this.toastr.error('Erro ao validar os dados', 'Aviso');
      //   }
      //   break;

      // case 'mesa':
      //   try {
      //     if (method === 'register') {

      //       await this.table.add(data);
      //       this.toastr.info(this.dataName + ' guardado localmente', 'Aviso');

      //     } else if (method === 'update') {

      //       await this.table.update(data.id, data);
      //       this.toastr.info(this.dataName + ' atualizado localmente', 'Aviso');

      //     }

      //     this.refreshData.next();

      //   } catch (error) {
      //     this.toastr.error('Erro ao validar os dados', 'Aviso');
      //   }
      //   break;
    }
  }

  //update data in LocalStorage
  async updateDataOffline(data: T) {
    try {
      this.validateData(data, 'update');
    } catch (error) {
      this.toastr.error('Erro ao atualizar ' + this.dataName + ' localmente', 'Aviso');
      //console.log('erro ao atualizar data offline ' + error);
    }
  }

  public userId;

  //delete data from LocalStorage
  async deleteDataOffline(data: T) {

    switch (this.nomeTabela) {
      case 'empregado':
        try {
          this.userId = this.cookieService.get('userId');
          if (this.userId == data.id) {
            this.toastr.warning('Não pode eliminar o seu próprio utilizador', 'Aviso');
          } else {
            await this.table.delete(data.id);
            this.toastr.info(this.dataName + ' eliminado', 'Aviso');
            this.refreshData.next();
          }
        } catch (error) {
          this.toastr.error('Erro ao eliminar ' + this.dataName + ' localmente', 'Aviso');
        }
        break;

      case 'categories':
        try {
          // this.table = this.db.table('artigo');
          // this.getDataOffline().subscribe(async (getData) => {
          //   this.getData = getData.find(x => x.category == data.name);

          //   if (this.getData === undefined) {
          //     this.table = this.db.table(this.nomeTabela);
          //     await this.table.delete(data.id);
          //     this.toastr.info(this.dataName + ' eliminada', 'Aviso');
          //   } else {
          //     this.toastr.warning('Não é possível eliminar uma categoria que contém artigos associados', 'Aviso');
          //   }
          //   this.table = this.db.table(this.nomeTabela);
          //   this.refreshData.next();
          // });
          this.table = this.db.table('subcategories');
          this.getDataOffline().subscribe(async (getData) => {
            this.getData = getData.find(x => x.id_category == data.id);

            if (this.getData === undefined) {
              this.table = this.db.table(this.nomeTabela);
              await this.table.delete(data.id);
              this.toastr.info(this.dataName + ' eliminada', 'Aviso');
              this.table = this.db.table(this.nomeTabela);
              this.refreshData.next();
            } else {
              this.toastr.warning('Não é possível eliminar uma categoria que contém subcategorias associadas', 'Aviso');
            }

          })

        } catch (error) {
          this.toastr.error('Erro ao eliminar ' + this.dataName + ' localmente', 'Aviso');
        }
        break;

      default:
        await this.table.delete(data.id);
        this.refreshData.next();
        this.toastr.info(this.dataName + ' eliminado', 'Aviso');
        break;
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

  async getLocalDataFromId(campo: string, valor: any) {
    const data = await this.table.where(campo).equals(valor).toArray();
    return data;
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
    //console.log(data);
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
