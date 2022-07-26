import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DocHeader } from '../../models/doc_header';
import { DocLines } from '../../models/doc_lines';
import { DocProducts } from '../../models/doc_products';
import { DocHeaderService } from './doc-header.service';
import { DocProductsService } from './doc-products.service';
import { DocLinesService } from './doc-lines.service';
import { Observable, of, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Fatura } from '../../models/fatura';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { UsersService } from '../users/users.service';
import { MesasService } from '../boards/mesas.service';
import { ZonasService } from '../boards/zonas.service';
import { ClientesService } from '../clientes/clientes.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { ArtigosService } from '../artigos/artigos.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})

export class DocumentsComponent implements OnInit {

  constructor(
    private docHeaderService: DocHeaderService,
    private docProductsService: DocProductsService,
    private docLinesService: DocLinesService,

    private paymentMethodService: PaymentMethodsService,
    private userService: UsersService,
    private zoneService: ZonasService,
    private mesasService: MesasService,
    private clientesService: ClientesService,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) { }

  public docHeader: DocHeader;
  public docLines: DocLines;
  public docProducts: DocProducts;

  dataSource = new MatTableDataSource<Fatura>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['select', 'id', 'cliente', 'date', 'pagamento', 'state']; //declare columns of the table

  orderBy = 'name'; //save the order by selected
  selection = new SelectionModel<Fatura>(true, []);

  public DocHeader: any[] = []; //save the clients returned from the API
  public DocLines: any[] = []; //save the clients returned from the API
  public DocProducts: any[] = []; //save the clients returned from the API

  public docs!: Observable<Fatura[]>; //save the clients returned from the API
  public docsOff!: Observable<Fatura[]>; //save the clients returned from the local storage
  public allDocsData!: Observable<Fatura[]>; //save all clients from API and local storage

  public subscriptionData!: Subscription; //subscription to refresh data
  public dataRow: any; //save data os selected row of table

  public dialogRef: any; //save the dialog reference

  showProgressBar = false;

  selectedRowIndex = -1; //save the selected index from the table
  selectedRowIds: Set<number> = new Set<number>();
  selectedId: string;

  public fatura: any;
  public faturas: Fatura[] = [];

  public paymentMethod: string;

  public nameClient: string;
  public addressClient: string;
  public nifCliente: number;

  public nameUser: string;
  public nameBoard: string;
  public nameZone: string;

  public nameArticle: string;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {

    this.getFatura();

    this.subscriptionData = this.docHeaderService.refreshData.subscribe(() => {
      this.subscriptionData = this.docLinesService.refreshData.subscribe(() => {
        this.subscriptionData = this.docProductsService.refreshData.subscribe(() => {
          setInterval(() => {
            window.location.reload();
          }, 1000);
        });
      });

    });
  }

  getPayementMethod(id: number) {
    return this.paymentMethodService.getDataOffline().subscribe(data => {
      this.paymentMethod = data.find(x => x.id === id).name;
    });
  }

  getClient(id: number) {
    return this.clientesService.getDataOffline().subscribe(data => {
      this.nameClient = data.find(x => x.id === id).name;
      this.addressClient = data.find(x => x.id === id).address;
      this.nifCliente = data.find(x => x.id === id).nif;
    });
  }

  getUser(id: number) {
    return this.userService.getDataOffline().subscribe(data => {
      this.nameUser = data.find(x => x.id === id).name;
    });
  }

  getBoard(id: number) {
    return this.mesasService.getDataOffline().subscribe(data => {
      this.nameBoard = data.find(x => x.id === id).name;
    });
  }

  getZone(id: number) {
    return this.zoneService.getDataOffline().subscribe(data => {
      this.nameZone = data.find(x => x.id === id).name;
    });
  }

  getFatura() {
    this.showProgressBar = true;

    this.docHeaderService.getDataOffline().subscribe(dataHeader => {
      this.DocHeader = dataHeader;

      for (let i = 0; i < dataHeader.length; i++) {

        this.getPayementMethod(dataHeader[i].id_payment_method);
        this.getClient(dataHeader[i].costumer_id);
        this.getUser(dataHeader[i].user_id);
        this.getBoard(dataHeader[i].board_id);
        this.getZone(dataHeader[i].zone_id);

        this.docLinesService.getDataOffline().subscribe(dataLines => {

          this.DocLines = dataLines.filter(x => x.id_doc_header === dataHeader[i].id);

          this.docProductsService.getDataOffline().subscribe(dataProducts => {
            this.DocProducts = dataProducts.filter(x => x.doc_lines_id === dataLines[i].id);

            this.fatura = {
              id: dataHeader[i].id,
              pagamento: this.paymentMethod,
              user: this.nameUser,
              zona: this.nameZone,
              mesa: this.nameBoard,
              cliente: [{
                nome: this.nameClient,
                morada: this.addressClient,
                nif: this.nifCliente,
              }],
              date: dataHeader[i].date,
              time: dataHeader[i].time,
              artigos: [],
              subtotal_no_iva: dataLines[i].subtotal_no_iva,
              subtotal_iva: dataLines[i].subtotal_iva,
            };

            for (let j = 0; j < dataProducts.length; j++) {
              this.fatura.artigos = this.DocProducts;
            }

            this.faturas[i] = this.fatura;

          });
        });
      }
      this.docsOff = of(this.faturas);
      this.dataSource.data = this.faturas;
    })

    setInterval(() => {
      this.showProgressBar = false;
    }, 1300); //wait 1,30 seconds to show progress bar

  }

  openModal(data: any) {
    if (data) {
      this.selection.select(data);
      this.selectedRowIds.add(data.id);
    }
    if (this.selection.selected.length > 1) {
      this.toastr.info('Não é possível consultar mais de um registo.');
    } else {
      const dialogRef = this.dialog.open(DocModalComponent, {
        height: '690px',
        width: '700px',
        data: data
      });
      dialogRef.afterClosed().subscribe(data => {
        // if (cliente) {
        //   this.register(cliente);
        // }
      });
    }
  }
  remove: boolean = false;
  openDeleteModal() {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      height: '40%',
      width: '50%',
      data: { values: this.selection.selected, component: 'Fatura' }
    });
    dialogRef.afterClosed().subscribe(data => {
      let i = 0;
      data.forEach(element => {

        this.docHeaderService.deleteDataOffline(element).then((dataHeader: any) => {

          this.docLinesService.getDataOffline().subscribe(dataLines => {
            let docLinesData = dataLines.filter(x => x.id_doc_header === dataHeader.id);

            docLinesData.forEach(element => {
              this.docLinesService.deleteDataOffline(element).then((dataLines: any) => {

                this.docProductsService.getDataOffline().subscribe(dataProducts => {
                  let docProductsData = dataProducts.filter(x => x.doc_lines_id === dataLines.id);

                  docProductsData.forEach(element => {
                    this.docProductsService.deleteDataOffline(element).then((dataProducts: any) => {

                      i++;

                      if (dataProducts) {
                        this.remove = true;
                      } else {
                        this.remove = false;
                      }

                      if (this.remove && docProductsData.length == i) {
                        this.toastr.success('Fatura eliminada com sucesso');
                      }

                    });
                  });
                });
              }).catch((error: any) => {
                this.toastr.error('Erro ao eliminar fatura', 'Aviso');
              });
            });
          });
        }).catch(error => {
          this.toastr.error('Erro ao eliminar fatura', 'Aviso');
        });
      });
    });
  }

  onOptionsSelected() {
    this.getFatura();
    //this.listAllData();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedRowIds.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
    for (let i = 0; i < this.dataSource.data.length; i++) {
      this.selectedRowIds.add(this.dataSource.data[i].id);
    }
    this.unselectRow();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Fatura): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    if (this.selection.selected.length > 1) {
      this.unselectRow();
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  onRowClicked(row: Fatura) {
    if (this.selectedRowIndex != row.id) {
      this.selection.clear();
      this.selectedRowIds.clear();
    }
    if (this.selectedRowIds.has(row.id)) {
      this.selectedRowIds.delete(row.id);
      this.selection.toggle(row);
    } else {
      this.selectedRowIds.add(row.id);
      this.selectedRowIndex = row.id;
      this.dataRow = row;
      this.selection.toggle(row);
    }
  }

  rowIsSelected(id: number) {
    return this.selectedRowIds.has(id);
  }

  onCheckBoxClicked(row: Fatura) {
    if (this.selectedRowIds.has(row.id)) {
      this.selectedRowIds.delete(row.id);
    } else {
      this.selectedRowIds.add(row.id);
    }
    this.dataRow = this.selection.selected.length > 0 ? this.selection.selected[0] : null;
    this.selectedRowIndex = this.dataRow ? this.dataRow.id : null;
  }

  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@Component({
  selector: 'app-doc-modal',
  templateUrl: './doc-modal.component.html',
  styleUrls: ['./doc-modal.component.scss']
})
export class DocModalComponent implements OnInit {

  public artigos: any[] = [];
  public nameArtigo: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private artigosService: ArtigosService) { }

  ngOnInit(): void {
    console.log(this.data);
    this.getProducts();
  }

  getProducts() {

    for (let i = 0; i < this.data.artigos.length; i++) {

      this.artigosService.getDataOffline().subscribe(data => {
        this.nameArtigo = data.find(x => x.id === this.data.artigos[i].id_article).name;

        this.artigos[i] = {
          id: this.data.artigos[i].id,
          doc_lines_id: this.data.artigos[i].doc_lines_id,
          name: this.nameArtigo,
          quantity: this.data.artigos[i].quantity,
          iva_tax_amount: this.data.artigos[i].iva_tax_amount,
          total: this.data.artigos[i].total,
        };
      });
    }
    console.log(this.artigos);
  }
}