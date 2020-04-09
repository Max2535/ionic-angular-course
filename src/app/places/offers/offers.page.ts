import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlacesService } from '../places.service';
import { Place } from '../place.mode';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss']
})
export class OffersPage implements OnInit,OnDestroy {
  offers: Place[];
  private placesSub:Subscription;

  constructor(private placesService: PlacesService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.placesSub=this.placesService.places.subscribe(places => {
      this.offers = places;
    });
  }


  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing item', offerId);
  }

  ngOnDestroy(): void {
    if(this.placesSub){
      this.placesSub.unsubscribe();
    }
  }
}
