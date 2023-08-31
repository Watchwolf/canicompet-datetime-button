import {NgModule} from '@angular/core';
import {CanicompetDatetimeButtonComponent} from './canicompet-datetime-button.component';
import {CommonModule} from "@angular/common";
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    CanicompetDatetimeButtonComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule
  ],
  exports: [
    CanicompetDatetimeButtonComponent
  ]
})
export class CanicompetDatetimeButtonModule {
}
