import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AngularOpenlayersModule } from 'ngx-openlayers';
import { FormsModule } from '@angular/forms';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { OsmViewComponent } from './osm-view/osm-view.component';
import {HttpClientModule} from '@angular/common/http'

@NgModule({
  declarations: [LocationPickerComponent, MapModalComponent,OsmViewComponent],
  imports: [CommonModule, IonicModule,AngularOpenlayersModule,FormsModule,HttpClientModule],
  exports: [LocationPickerComponent, MapModalComponent,OsmViewComponent],
  entryComponents: [MapModalComponent,OsmViewComponent]
})
export class SharedModule {}
