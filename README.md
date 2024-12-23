# README #

The component canicompet-datetime-button replace the component <ion-datetime-button> from the ionic project.

The idea is to improve the selection of the year and removing the "wheel" which is a mess to use.

![canicompet-datetime-button](https://blog.canicompet.fr/wp-content/uploads/2023/08/canicompet-datetime-button.png)

### How do I get set up? ###

0.  Clone the repository in your project
2.  Import the component in *.module.ts
```
import { CanicompetDatetimeButtonModule } from '../../component/canicompet-datetime-button/canicompet-datetime-button-module';
@NgModule({
  imports: [
  	...,
    CanicompetDatetimeButtonModule
  ],
  declarations: [...Page]
})
```

3.  Use it in place of <ion-datetime-button>
```
<canicompet-datetime-button [value]="birthdayDate" (ionChange)="onNgModelBirthdayChange($event)" max="2050-01-01"></canicompet-datetime-button>
```

I have only implemented what I need, feel free to improve it.