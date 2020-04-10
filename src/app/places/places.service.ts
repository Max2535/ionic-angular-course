import { Injectable } from '@angular/core';
import { BehaviorSubject,of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Place } from './place.mode';
import { AuthService } from '../auth/auth.service';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    /* new Place('p1',
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
       'xyz')*/
  ]);

  get places() {
    return this._places.asObservable();
  }
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
  }

  fetchPlaces() {
    return this.http.get<{ [key: string]: PlaceData }>('https://ionic-angular-course-d7320.firebaseio.com/offered-places.json')
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
              )
            );
          }
        }
        return places;
        //return [];
      }),
        tap(places => {
          this._places.next(places);
        })
      );
  }

  getPlace(id: string) {
    return this.http.get<PlaceData>(`https://ionic-angular-course-d7320.firebaseio.com/offered-places/${id}.json`)
    .pipe(
     map(placeData=>{
       return new Place(
         id,
         placeData.title,
         placeData.description,
         placeData.imageUrl,
         placeData.price,
         new Date(placeData.availableFrom),
         new Date(placeData.availableTo),
         placeData.userId
       )
     })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://cache.gmo2.sistacafe.com/images/uploads/summary/image/35969/City_Trip_Rome.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId);

    return this.http.post<{ name: string }>('https://ionic-angular-course-d7320.firebaseio.com/offered-places.json', { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces:Place[];
    return this.places.pipe(
      take(1), 
      switchMap(places => {
        if(!places||places.length<=0){
            return this.fetchPlaces();
        }else{
          return of(places);
        }
      }),
      switchMap(places=>{
        const updatedPlaceIndex = places.findIndex(pl => pl.id == placeId);
        updatedPlaces = [...places];
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
          return this.http.put(
            `https://ionic-angular-course-d7320.firebaseio.com/offered-places/${placeId}.json`,
            {...updatedPlaces[updatedPlaceIndex],id:null}
            );
      })
      ,tap(()=>{
        this._places.next(updatedPlaces);
      })
    );
  }

}
