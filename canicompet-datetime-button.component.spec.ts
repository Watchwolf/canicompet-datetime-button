import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CanicompetDatetimeComponent } from './canicompet-datetime-button.component';

describe('CanicompetDatetimeButtonComponent', () => {
  let component: CanicompetDatetimeComponent;
  let fixture: ComponentFixture<CanicompetDatetimeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CanicompetDatetimeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CanicompetDatetimeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
