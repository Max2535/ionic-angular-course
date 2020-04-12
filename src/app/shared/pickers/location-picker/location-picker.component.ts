import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';
import { PlaceLocation } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient) { }

  ngOnInit() { }

  onPickLocation() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const pickedLocation: PlaceLocation = {
          lat: modalData.data.selectedCoords.lat,
          lng: modalData.data.selectedCoords.lng,
          address: modalData.data.address,
          staticMapImageUrl: null
        };
        console.log(pickedLocation);
        this.isLoading = true;
        this.getAddress(modalData.data.lat, modalData.data.lng)
          .pipe(
            switchMap(address => {
              //pickedLocation.address = address;
              return of(
                this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
              );
            })
          )
          .subscribe(staticMapImageUrl => {
            pickedLocation.staticMapImageUrl = staticMapImageUrl;
            this.selectedLocationImage = staticMapImageUrl;
            this.isLoading = false;
            this.locationPick.emit(pickedLocation);
          });
      });
      modalEl.present();
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&polygon_svg=1&namedetails=1&q=%E0%B8%A3%E0%B8%B2%E0%B8%A1`
      )
      .pipe(
        map(geoData => {
          if (!geoData||geoData.length==0) {
            return null;
          }
          return geoData;
        })
      );
      // `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${
      //  environment.googleMapsAPIKey
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `
    https://api.mapbox.com/v4/mapbox.emerald/pin-s-cross+285A98(${lng},${lat})/${lng},${lat},${zoom}/500x300@2x.png?access_token=${environment.mapBox.APT_KEY}`;

//return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
//&markers=color:red%7Clabel:Place%7C${lat},${lng}
//&key=${environment.googleMapsAPIKey}`;
  }

}
