import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OsmViewComponent } from './osm-view.component';

describe('OsmViewComponent', () => {
  let component: OsmViewComponent;
  let fixture: ComponentFixture<OsmViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsmViewComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OsmViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
