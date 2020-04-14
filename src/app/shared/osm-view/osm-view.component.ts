import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core'
import { marker } from './marker.image'
import { proj, View } from 'openlayers'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { GeoLocationService } from './geo-location.service'
import { LoadingController } from '@ionic/angular'

@Component({
  selector: 'vo-ui-osm-view',
  templateUrl: './osm-view.component.html',
  styleUrls: ['./osm-view.component.scss'],
  providers: [HttpClient, GeoLocationService]
})
export class OsmViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  geoReverseService = 'https://nominatim.openstreetmap.org/reverse?key=iTzWSiYpGxDvhATNtSrqx5gDcnMOkntL&format=json&addressdetails=1&lat={lat}&lon={lon}'

  @Input()
  width: string
  @Input()
  height: string

  @Input()
  latitude = 52.520008
  @Input()
  longitude = 13.404954

  @Input()
  latitudePointer
  @Input()
  longitudePointer

  @Input()
  showControlsZoom: boolean
  @Input()
  titleZoomIn = 'Zoom in'
  @Input()
  titleZoomOut = 'Zoom out'
  @Input()
  showControlsCurrentLocation: boolean
  @Input()
  titleCurrentLocation = 'Current location'

  @Input()
  showDebugInfo: boolean
  @Input()
  opacity = 1
  @Input()
  zoom = 14

  markerImage = marker

  reverseGeoSub: Subscription = null
  pointedAddress: string
  pointedAddressOrg: string
  position: any
  dirtyPosition
  @ViewChild('map', { static: true }) map;
  @Output()
  addressChanged = new EventEmitter<any>()
  constructor(private httpClient: HttpClient,
    private geoLocationService: GeoLocationService,
    private loadingCtrl: LoadingController) {
  }
  ngAfterViewInit(): void {
    const _Map = this.map.instance as ol.Map;
    _Map.updateSize();
  }

  ngOnInit() {
    this.loadingCtrl.create({
      keyboardClose: true,
      message: 'กำลังโหลดแผนที่...'
    }).then(loadingEl => {
      loadingEl.present();
      if (this.showControlsCurrentLocation) {

        this.dirtyPosition = true;
        this.position = {
          coords: {
            longitude: this.longitudePointer,
            latitude: this.latitudePointer
          }
        };
        this.longitude = this.longitudePointer = this.position.coords.longitude;
        this.latitude = this.latitudePointer = this.position.coords.latitude;
        setTimeout(() => {
          let _Map = this.map.instance as ol.Map;
          _Map.updateSize();
          loadingEl.dismiss();
        }, 1000);
        /*this.geoLocationService.getLocation().subscribe((position) => {
          this.position = position
          if (!this.dirtyPosition) {
            this.dirtyPosition = true
            this.longitude = this.longitudePointer = this.position.coords.longitude
            this.latitude = this.latitudePointer = this.position.coords.latitude
            let _Map = this.map.instance as ol.Map;
            _Map.updateSize();
            loadingEl.dismiss();
          }
        })*/
      } else {

        console.log(this.longitudePointer, this.latitudePointer);
        this.longitude = this.longitudePointer;
        this.latitude = this.latitudePointer;
        setTimeout(() => {
          let _Map = this.map.instance as ol.Map;
          _Map.updateSize();
          loadingEl.dismiss();
        }, 1000);
      }
      if (this.reverseGeoSub) {
        this.reverseGeoSub.unsubscribe()
      }
    });

  }

  ngOnDestroy() {
    if (this.reverseGeoSub) {
      this.reverseGeoSub.unsubscribe()
    }
  }
  onSingleClick(event) {
    if (!this.showControlsCurrentLocation) {
      return;
    }
    const lonlat = proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
    this.longitudePointer = lonlat[0]
    this.latitudePointer = lonlat[1]
    this.reverseGeo()
  }
  increaseOpacity() {
    this.opacity += 0.1
  }

  decreaseOpacity() {
    this.opacity -= 0.1
  }
  increaseZoom() {
    this.zoom++
  }
  decreaseZoom() {
    this.zoom--
  }

  setCurrentLocation(event) {
    // TODO FIX: setting current location does move the pointer but not the map!!!
    if (this.position) {
      this.longitude = this.longitudePointer = this.position.coords.longitude
      this.latitude = this.latitudePointer = this.position.coords.latitude
      /**
       * Trigger new address change
       */
      this.reverseGeo()
    }
  }

  reverseGeo() {
    const service = (this.geoReverseService || '')
      .replace(new RegExp('{lon}', 'ig'), `${this.longitudePointer}`)
      .replace(new RegExp('{lat}', 'ig'), `${this.latitudePointer}`)
    this.reverseGeoSub = this.httpClient.get(service).subscribe(data => {
      const val = (data || {})

      this.pointedAddressOrg = val['display_name']
      const address = []

      const building = []
      if (val['address']['building']) {
        building.push(val['address']['building'])
      }
      if (val['address']['mall']) {
        building.push(val['address']['mall'])
      }
      if (val['address']['theatre']) {
        building.push(val['address']['theatre'])
      }

      const zip_city = []
      if (val['address']['postcode']) {
        zip_city.push(val['address']['postcode'])
      }
      if (val['address']['city']) {
        zip_city.push(val['address']['city'])
      }
      const street_number = []
      if (val['address']['street']) {
        street_number.push(val['address']['street'])
      }
      if (val['address']['road']) {
        street_number.push(val['address']['road'])
      }
      if (val['address']['footway']) {
        street_number.push(val['address']['footway'])
      }
      if (val['address']['pedestrian']) {
        street_number.push(val['address']['pedestrian'])
      }
      if (val['address']['house_number']) {
        street_number.push(val['address']['house_number'])
      }

      if (building.length) {
        address.push(building.join(' '))
      }
      if (zip_city.length) {
        address.push(zip_city.join(' '))
      }
      if (street_number.length) {
        address.push(street_number.join(' '))
      }

      this.pointedAddress = address.join(', ')
      const selectedCoords = {
        lat: this.latitudePointer,
        lng: this.longitudePointer
      };
      this.addressChanged.emit({
        selectedCoords: selectedCoords,
        address: this.pointedAddress
      })
    })
  }
}