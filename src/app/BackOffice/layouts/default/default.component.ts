import { Component, OnInit } from '@angular/core';
import { OnlineOfflineService } from '../../services/online-offline.service';
import { PermissionsService } from '../../services/permissions.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  sideBarOpen: boolean = true;

  constructor( private permissions: PermissionsService ) { }

  ngOnInit(): void {
    this.getPermissions();
  }

  sideBarToogler(e: any) {
    this.sideBarOpen = !this.sideBarOpen;
  }

  getPermissions() {
    this.permissions.getPermissions();
  }

}
