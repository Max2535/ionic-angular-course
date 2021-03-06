import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Plugins, Capacitor } from '@capacitor/core';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';
import { PlaceLocation, Coordinates } from '../../../places/location.model';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;
  @Input() showPreview=false;
  
  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  onPickLocation() {
    this.actionSheetCtrl.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate', handler: () => {
            this.locateUser();
          }
        },
        {
          text: 'Pick on Map', handler: () => {
            this.openMap();
          }
        },
        { text: 'Cancel', role: 'cancel' },
      ]
    })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading=true;
    Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };
        this.createPlace(coordinates.lat,coordinates.lng,'');
        this.isLoading=false;
      })
      .catch(err => {
        this.isLoading=false;
        this.showErrorAlert();
      });
  }

  private showErrorAlert() {
    this.alertCtrl.create(
      {
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location'
      }).then(alertEl => alertEl.present());
  }

  private openMap() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
    this.isLoading=true;
    Plugins.Geolocation.getCurrentPosition()
    .then(geoPosition => {
      this.modalCtrl.create({ component: MapModalComponent,
        componentProps:{
          center: {
            lat: geoPosition.coords.latitude,
            lng: geoPosition.coords.longitude
          },
          selectable: true,
        }
        }).then(modalEl => {
          modalEl.onDidDismiss().then(modalData => {
            if (!modalData.data) {
              this.isLoading=false;
              return;
            }
            this.createPlace(modalData.data.selectedCoords.lat,modalData.data.selectedCoords.lng,modalData.data.address);
            this.isLoading=false;
          });
          modalEl.present();
        });
      
    })
    .catch(err => {
      this.isLoading=false;
      this.showErrorAlert();
    });
  }

  private createPlace(lat:number,lng:number,address:string){
    const pickedLocation: PlaceLocation = {
      lat:lat,
      lng:lng,
      address: address,
      staticMapImageUrl: null
    };
    this.isLoading = true;
    this.getAddress(lat, lng)
      .pipe(
        switchMap(address => {
          if(address){
            pickedLocation.address = address;
          }
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
  }

  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        `https://nominatim.openstreetmap.org/reverse?key=iTzWSiYpGxDvhATNtSrqx5gDcnMOkntL&format=json&addressdetails=1&lat=${lat}&lon=${lng}`
      )
      .pipe(
        map(geoData => {
          if (!geoData || geoData.length == 0) {
            return null;
          }
          console.log(geoData);
          return geoData.display_name;
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
