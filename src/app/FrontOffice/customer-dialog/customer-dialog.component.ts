import { Component, OnInit, Inject} from '@angular/core';
import { ClientesService } from 'src/app/BackOffice/modules/clientes/clientes.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, of, Observable, Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Cliente } from 'src/app/BackOffice/models/cliente';

export interface DialogData {
  name: string;
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
  public orderBy = 'name';
  dataSource = new MatTableDataSource<Cliente>();

  constructor(private clientesService: ClientesService, public dialogRef: MatDialogRef<CustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }
    public subscriptionData!: Subscription; 

  getCustomer() {
    this.clientesService.getDataOffline().subscribe(data => {
      this.customer = data
    })
  }

  onRowClicked(row: any) {
    this.selectedRowIndex = row.id;
    this.dataRow = row;
    this.name = row.name;
  }

  listLocalData() {

    console.log(this.orderBy);

    switch (this.orderBy) { //order by
      case 'name'://order by name
        this.clientesService.getDataOffline().pipe(
          map(arr => arr.sort((a, b) => a.name.localeCompare(b.name))) 
        ).subscribe(data => {
          this.customer= of(data);
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


  onOptionsSelected() {
    this.listLocalData();
  }

  ngOnInit(): void {
    this.getCustomer();
    this.listLocalData();

    this.subscriptionData = this.clientesService.refreshData.subscribe(() => {
      this.listLocalData();
    });
  }

}
