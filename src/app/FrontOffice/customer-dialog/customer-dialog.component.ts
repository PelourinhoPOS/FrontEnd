import { Component, OnInit, Inject } from '@angular/core';
import { ClientesService } from 'src/app/BackOffice/modules/clientes/clientes.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, of, Observable, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Cliente } from 'src/app/BackOffice/models/cliente';
import { CreateClientModalComponent } from 'src/app/BackOffice/modules/clientes/clientes.component';
import { ToastrService } from 'ngx-toastr';


export interface DialogData {
  name: string;
  id: string;
}

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.scss']
})
export class CustomerDialogComponent implements OnInit {
  displayedColumns: string[] = ['name', 'nif', 'phone', 'parish', 'address'];

  public customer;
  public selectedRowIndex;
  public dataRow;
  public name;
  public id;
  public orderBy = 'name';
  public customerData;
  dataSource = new MatTableDataSource<Cliente>();

  constructor(private clientesService: ClientesService, public dialogRef: MatDialogRef<CustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog, public toastr: ToastrService) { }
  public subscriptionData!: Subscription;

  getCustomer() {
    this.clientesService.getDataOffline().subscribe(data => {
      this.customer = data
    })
  }

  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
  }

  selectRow() {
    if (this.dataRow == null) {
      this.toastr.warning('Selecione um cliente', 'Erro');
    } else {
      this.dialogRef.close([this.dataRow.name, this.dataRow.id]);
    }
  }

  listLocalData() {

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.clientesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name)))
        ).subscribe(data => {
          this.customer = of(data);
          this.dataSource.data = data
        })
        break;

      case 'nif'://order by nif
        this.clientesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.nif - b.nif))
        ).subscribe(data => {
          this.customer = of(data);
          this.dataSource.data = data
        })
        break;

      case 'location': //order by location
        this.clientesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.parish.localeCompare(b.parish)))
        ).subscribe(data => {
          this.customer = of(data);
          this.dataSource.data = data
        })
        break;
    }
  }

  openUpdateModal() {
    if (this.customerData) {
      if (this.customerData.id === 1) {
        this.toastr.warning('Não pode alterar estes dados', 'Erro');
      } else {
        const dialogRef = this.dialog.open(CreateClientModalComponent, {
          height: '690px',
          width: '770px',
          data: { values: this.customerData, update: true }
        });
        dialogRef.afterClosed().subscribe(cliente => {
          if (cliente) {
            this.clientesService.update(cliente).then(data => {
              if (data) {
                this.toastr.success('Cliente atualizado com sucesso', 'Sucesso');
              }
            });
          }
        });
      }
    }
  }

  getUser(id) {
    this.customerData = id;
  }

  onOptionsSelected() {
    this.listLocalData();
  }

  unselectRow() {
    this.selectedRowIndex = -1;
    this.dataRow = null;
  }

  ngOnInit(): void {
    this.getCustomer();
    this.listLocalData();

    this.subscriptionData = this.clientesService.refreshData.subscribe(() => {
      this.listLocalData();
    });
  }

}
