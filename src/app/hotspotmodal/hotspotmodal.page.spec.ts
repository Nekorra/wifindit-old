import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HotspotmodalPage } from './hotspotmodal.page';

describe('HotspotmodalPage', () => {
  let component: HotspotmodalPage;
  let fixture: ComponentFixture<HotspotmodalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotspotmodalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HotspotmodalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
