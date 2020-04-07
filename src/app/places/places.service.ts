import { Injectable } from '@angular/core';
import { Place } from './place.mode';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place('p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://www.amny.com/wp-content/uploads/2020/03/GettyImages-1089200736.jpg',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31')),
    new Place('p2',
      'L\'Amour Toujours',
      'A romantic place in Paris!',
      'https://photos.mandarinoriental.com/is/image/MandarinOriental/paris-2017-home?$MO_masthead-property-mobile$',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31')),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://cache.gmo2.sistacafe.com/images/uploads/summary/image/35969/City_Trip_Rome.jpg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'))
  ];

  get places() {
    return [...this._places];
  }
  constructor() {
  }

  getPlace(id: string) {
    return {
      ...this._places.find(
        p => p.id === id)
    };
  }

}
