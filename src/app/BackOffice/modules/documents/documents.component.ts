import { Component, OnInit } from '@angular/core';
import { DocHeader } from '../../models/doc_header';
import { DocLines } from '../../models/doc_lines';
import { DocProducts } from '../../models/doc_products';
import { DocHeaderService } from './doc-header.service';
import { DocProductsService } from './doc-products.service';
import { DocLinesService } from './doc-lines.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {

  columnsToDisplay = ['number', 'client', 'date', 'hour'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];

  constructor(private docHeaderService: DocHeaderService, private docProductsService: DocProductsService, private docLinesService: DocLinesService) { }

  public docHeader: DocHeader;
  public docLines: DocLines;
  public docProducts: DocProducts;

  ngOnInit(): void {

    this.docHeaderService.getLocalDataFromId('id', 1).then((dataHeader: any) => {
      this.docHeader = dataHeader;
      console.log(this.docHeader);

      this.docLinesService.getLocalDataFromId('id', this.docHeader[0].id_doc_line).then((dataLine: any) => {
        this.docLines = dataLine;
        console.log(dataLine);

        this.docProductsService.getLocalDataFromId('doc_lines_id', this.docLines[0].id).then((dataProduct: any) => {
          this.docProducts = dataProduct;
          console.log(dataProduct);
        });
      });
    });



  }

  criar() {
    let DocHeader: DocHeader = {
      id: 1,
      id_payment_method: 1,
      id_doc_line: 1,
      costumer_id: 1,
      user_id: 1,
      zone_id: 1,
      board_id: 1,
      date: new Date().toUTCString(),
      time: new Date().getTime(),
    }
    let DocLines: DocLines = {
      id: 1,
      subtotal_no_iva: 1,
      subtotal_iva: 1,
    }
    let DocProducts: DocProducts = {
      id: 2,
      doc_lines_id: 1,
      id_article: 2,
      quantity: 1,
      iva_tax_amount: 0.60,
      total: 3.20
    }
    let DocProducts2: DocProducts = {
      id: 2,
      doc_lines_id: 1,
      id_article: 2,
      quantity: 1,
      iva_tax_amount: 0.39,
      total: 2.09
    }

    let DocLinesUpdate: DocLines = {
      id: 1,
      subtotal_no_iva: DocLines.subtotal_iva + DocProducts.total,
      subtotal_iva: DocLines.subtotal_iva + DocProducts.iva_tax_amount,
    }

    // this.docHeaderService.register(DocHeader).then(() => {
    //   console.log('DocHeader criado com sucesso');
    // })

    // this.docLinesService.register(DocLines).then(() => {
    //   console.log('DocLines criado com sucesso');
    // })

    this.docProductsService.register(DocProducts).then(() => {
      console.log('DocProducts criado com sucesso');
    })

    // this.docProductsService.register(DocProducts2).then(() => {
    //   console.log('DocProducts criado com sucesso');
    // })

    // this.docLinesService.update(DocLinesUpdate).then(() => {
    //   console.log('DocLines atualizado com sucesso');
    // })
  }

}
