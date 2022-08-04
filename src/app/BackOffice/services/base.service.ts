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
export abstract class BaseService<T extends { id?: number, nif?: number, phone?: number, name?: string, id_category?: number, teste?: T[], id_doc_header?: number, doc_lines_id?: number }> {

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
      cliente: 'id, registerDate',
      empregado: 'id',
      mesa: 'id, id_zone, boardType',
      zone: 'id',
      artigo: 'id, id_category',
      categories: 'id, id_category',
      paymentMethods: 'id',
      doc_header: 'id, date',
      doc_line: 'id',
      doc_product: 'id',
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

  //register data offline in indexedDB
  async registerDataOffline(data: T) {
    try {

      if (data.id === undefined || data.id === null) {
        const allData: T[] = await this.table.toArray();

        if (allData.length > 0) {
          let lastID: any = allData[allData.length - 1].id;
          data.id = lastID + 1;
        } else {
          data.id = 1;
        }
      }

      return this.validateData(data, 'register');

    } catch (error) {
      this.toastr.error('Erro ao guardar ' + this.dataName + ' localmente', 'Aviso');
      //console.log('erro ao salvar data offline ' + error);
    }
  }

  //validate data before register or update
  async validateData(data: T, method: string) {

    switch (this.nomeTabela) {

      case 'cliente':
        return new Promise((resolve, reject) => {
          try {
            this.getDataOffline().subscribe(async (getData: any[]) => {
              this.getData = getData.find(x => x.nif == data.nif || x.phone == data.phone);

              if (this.getData === undefined || this.getData.id == data.id) {
                if (method === 'register') {

                  await this.table.add(data);
                  resolve(data);

                } else if (method === 'update') {

                  await this.table.update(data.id, data);
                  resolve(data);
                }


                this.refreshData.next();

              } else {
                reject(this.toastr.warning('Já existe um cliente registado com estes dados', 'Aviso'));
              }

            });
          } catch (error) {
            reject(this.toastr.error('Erro ao validar os dados', 'Aviso'));
          }
        });
        break;

      case 'empregado':
        return new Promise((resolve, reject) => {
          try {
            this.getDataOffline().subscribe(async (getData: any[]) => {
              this.getData = getData.find(x => x.phone == data.phone);

              if (this.getData === undefined || this.getData.id == data.id) {
                if (method === 'register') {

                  await this.table.add(data);
                  resolve(data);

                } else if (method === 'update') {

                  await this.table.update(data.id, data);
                  resolve(data);
                }

                this.refreshData.next();

              } else {
                reject(this.toastr.warning('Já existe um utilizador registado com estes dados', 'Aviso'));
              }

            });
          } catch (error) {
            reject(this.toastr.error('Erro ao validar os dados', 'Aviso'));
          }
        });
        break;

      case 'categories':
        return new Promise((resolve, reject) => {
          try {
            this.getDataOffline().subscribe(async (getData: any[]) => {
              this.getData = getData.find(x => x.name == data.name);

              if (this.getData === undefined || this.getData.id == data.id) {

                if (data.id != data.id_category) {

                  if (method === 'register') {

                    await this.table.add(data);
                    resolve(data);

                  } else if (method === 'update') {

                    await this.table.update(data.id, data);
                    resolve(data);

                  }

                  this.refreshData.next();

                } else {
                  reject(this.toastr.error('Não pode associar uma categoria a ela mesma', 'Aviso'));
                }

              } else {
                reject(this.toastr.warning('Já existe uma categoria registada com este nome', 'Aviso'));
              }

            });

          } catch (error) {
            reject(this.toastr.error('Erro ao validar os dados', 'Aviso'));
          }
        });
        break;

      default:
        return new Promise(async (resolve, reject) => {
          try {
            if (method === 'register') {

              await this.table.add(data);
              resolve(data);

            } else if (method === 'update') {

              await this.table.update(data.id, data);
              resolve(data);

            }

            this.refreshData.next();

          } catch (error) {
            console.log(error);
            reject(this.toastr.error('Erro ao validar os dados', 'Aviso'));
          }

        });
        break;

    }
  }

  //update data in LocalStorage
  async updateDataOffline(data: T) {
    try {
      return this.validateData(data, 'update');
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
        return new Promise(async (resolve, reject) => {
          try {
            this.userId = this.cookieService.get('userId');
            if (this.userId == data.id) {
              reject(this.toastr.warning('Não pode eliminar o seu próprio utilizador', 'Aviso'));
            } else {
              await this.table.delete(data.id);
              resolve(data);

              this.refreshData.next();
            }
          } catch (error) {
            reject(this.toastr.error('Erro ao eliminar empregado localmente', 'Aviso'));
          }
        });
        break;

      case 'categories':
        return new Promise(async (resolve, reject) => {
          try {
            this.getDataOffline().subscribe(async (getData: any[]) => {
              this.getData = getData.find(x => x.id_category == data.id);

              if (this.getData === undefined) {
                this.table = this.db.table('artigo');

                this.getDataOffline().subscribe(async (getData: any[]) => {
                  this.getData = getData.find(x => x.id_category == data.id);

                  if (this.getData === undefined) {
                    await this.table.delete(data[0].id);
                    this.refreshData.next();
                    resolve(data[0]);
                  } else {
                    reject(this.toastr.warning('Não pode eliminar uma categoria que está associada a um artigo.', 'Aviso'));
                  }
                });

              } else {
                reject(this.toastr.warning('Não pode eliminar uma categoria que está associada a outra.', 'Aviso'));
              }
              this.table = this.db.table(this.nomeTabela);
            });
          } catch (error) {
            reject(this.toastr.error('Erro ao eliminar categoria localmente', 'Aviso'));
          }
        });
        break;

      case 'zone':
        return new Promise(async (resolve, reject) => {
          try {
            this.table = this.db.table('mesa');
            this.getDataOffline().subscribe(async (getData: any[]) => {
              this.getData = getData.find(x => x.id_zone == data.id);

              if (this.getData === undefined) {

                await this.table.delete(data.id);
                this.refreshData.next();
                resolve(data);

              } else {
                reject(this.toastr.warning('Não pode eliminar uma zona que está associada a uma ou mais mesas.', 'Aviso'));
              }
            });

            this.table = this.db.table(this.nomeTabela);

          } catch (error) {
            reject(this.toastr.error('Erro ao eliminar zona localmente', 'Aviso'));
          }
        });
        break;

      case 'doc_line':
        return new Promise(async (resolve, reject) => {
          try {
            await this.table.delete(data.id);
            this.refreshData.next();
            resolve(data);
          } catch {
            reject(this.toastr.error('Erro ao eliminar linha de documento localmente', 'Aviso'));
          }
        });

      case 'doc_product':
        return new Promise(async (resolve, reject) => {
          try {
            console.log(data);
            await this.table.delete(data.id);
            this.refreshData.next();
            resolve(data);
          } catch {
            reject(this.toastr.error('Erro ao eliminar linha de documento localmente', 'Aviso'));
          }
        });

      case 'artigo':
        return new Promise(async (resolve, reject) => {
          try {
            await this.table.delete(data[0].id);
            this.refreshData.next();
            resolve(data[0]);
          } catch {
            reject(this.toastr.error('Erro ao eliminar produto localmente', 'Aviso'));
          }
        });
        break;

      default:
        return new Promise(async (resolve, reject) => {
          try {
            await this.table.delete(data.id);
            this.refreshData.next();
            resolve(data);
          } catch (error) {
            reject(this.toastr.error('Erro ao eliminar ' + this.dataName + ' localmente', 'Aviso'));
          }
        });
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

  async getCountLocalData(campo: string, valor: any) {
    const data = await this.table.where(campo).equals(valor).count();
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
    return this.registerDataOffline(data);
  }

  update(data: T) {
    return this.updateDataOffline(data);
  }

  delete(data: T) {
    return this.deleteDataOffline(data);
  }

  //list data from API
  list(): Observable<T[]> {
    return this.http.get<T[]>(this.urlAPI);
  }

}