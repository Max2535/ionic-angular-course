import { Injectable } from '@angular/core';
import { Place } from './place.mode';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place('p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://www.amny.com/wp-content/uploads/2020/03/GettyImages-1089200736.jpg',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'xyz'),
    new Place('p2',
      'L\'Amour Toujours',
      'A romantic place in Paris!',
      'https://photos.mandarinoriental.com/is/image/MandarinOriental/paris-2017-home?$MO_masthead-property-mobile$',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'xyz'),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://cache.gmo2.sistacafe.com/images/uploads/summary/image/35969/City_Trip_Rome.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'xyz')
  ]);

  get places() {
    return this._places.asObservable();
  }
  constructor(private authService: AuthService) {
  }

  getPlace(id: string) {
    return this.places.pipe(take(1), map(places => {
      return { ...places.find(p => p.id === id) };
    }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://cache.gmo2.sistacafe.com/images/uploads/summary/image/35969/City_Trip_Rome.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId);

    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(take(1),delay(1000), tap(place => {
      const updatedPlaceIndex = place.findIndex(pl => pl.id == placeId);
      const updatedPlaces = [...place];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId);
        this._places.next(updatedPlaces);
    }));
  }

}
