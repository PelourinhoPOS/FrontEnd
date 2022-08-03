import { Component, OnInit, Inject } from '@angular/core';
import { FlickrService } from 'src/app/BackOffice/services/flickr.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  url: string;
  title: string;
}

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent implements OnInit {

  images = [];
  keyword: string;

  constructor(private flickrService: FlickrService, public dialogRef: MatDialogRef<ImageGalleryComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  onClose(url, title) {
    this.dialogRef.close([url + '_b.jpg', title]);
  }

  search(event: any) {
    this.keyword = event.target.value.toLowerCase();

    if (this.keyword && this.keyword.length > 0) {
      this.flickrService.search_keyword(this.keyword)
        .toPromise()
        .then(res => {
          this.images = res;
        });
    }
  }

  onScroll() {
    if (this.keyword && this.keyword.length > 0) {
      this.flickrService.search_keyword(this.keyword)
        .toPromise()
        .then(res => {
          this.images = this.images.concat(res);
        });
    }
  }


}
