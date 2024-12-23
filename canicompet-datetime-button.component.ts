import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AlertController, IonModal, IonDatetime } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { parse, parseISO, differenceInSeconds, addDays, addHours, getDay, fromUnixTime, addYears } from 'date-fns'
import { da, de, enGB, es, fi, fr, it, nl, pt, sv } from 'date-fns/locale';
import { toZonedTime, format, getTimezoneOffset } from 'date-fns-tz'

@Component({
  selector: 'canicompet-datetime-button',
  templateUrl: './canicompet-datetime-button.component.html',
  styleUrls: ['./canicompet-datetime-button.component.scss'],
  standalone: false
})
export class CanicompetDatetimeButtonComponent implements OnInit {
  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('datetime', { static: false }) datetime!: IonDatetime;
  @ViewChild('datetime', { static: false }) datetimeRef!: ElementRef;

  id: string = '';
  years: number[] = []
  year: number = 2000
  isFreeze: Boolean = false;
  buttonLabel: string = ''
  valueInitial: string;

  //Emit when the user validate a new date
  @Output() ionChange = new EventEmitter<void>();

  //same value than the ion-datetime presentation
  @Input() presentation: string = 'date';
  //same value than the button fill
  @Input() buttonFill: string = 'solid';
  //date or dateWithDay
  @Input() buttonLabelFormat: string = 'date';

  //the title of the modal
  @Input() title: string = null;
  //the text of the button which valid the new date
  @Input() doneText: string;
  //the text of the button which cancel the change
  @Input() cancelText: string;
  //The maximum date, format yyyy-mm-dd
  @Input() max: string = '2050-12-31';
  //The minimum date, format yyyy-mm-dd
  @Input() min: string = '1940-01-01';

  //The maximum height of the input 
  @Input() maxHeight: string = null;

  _value: string;
  //Set the date, old form working with date-fns.parseISO
  @Input() set value(value: string) {

    if(!this.isFreeze && value != null && value != '') {
      this.valueInitial = value;
      this.selectBtYearCB(this.dateFromString(value).getFullYear());
    }

    if(value == null) {
      this.buttonLabel = this.translate.instant('Undefined')
    } else if(this.presentation == 'date-time') {
      this.buttonLabel = this.dateToStringShortWithTimeWithDay(this.dateFromString(value));
    } else if(this.presentation == 'week') {
      this.buttonLabel = this.translate.instant('Week') + ' ' + this.dateToStringShortWithoutTimeWithDay(this.dateFromString(value));
    } else if(this.presentation == 'month') {
      this.buttonLabel = this.dateToStringMonthYear(this.dateFromString(value));
    } else if(this.buttonLabelFormat == 'date') {
      this.buttonLabel = this.dateToStringShortWithoutTimeWithDay(this.dateFromString(value));
    } else if(this.buttonLabelFormat == 'dateWithDay') {
      this.buttonLabel = this.dateToStringWithoutTimeWithDay(this.dateFromString(value));
    }

    if(value == null || value == '')
      value = this.dateToStringIso(new Date())
    this._value = value;

    this.updateYears();
    this.cdref.detectChanges();
  }

  //get the date
  get value(): string {
    return this._value;
  }

  constructor(
    private cdref: ChangeDetectorRef,
    private translate: TranslateService) { 
    this.id = this.uuidv4()
  }

  ngOnInit() {
  }

  //populate the list of availables year
  updateYears() {
    this.years = []
    var max: number = 2050;
    if (this.max != null) {
      max = this.dateFromString(this.max).getFullYear();
    }

    var min = 1940;
    if (this.min != null) {
      min = this.dateFromString(this.min).getFullYear();
    }

    for(var i = min; i <= max; i++) {
      this.years.push(i)
    }
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return 'i' + v.toString(16);
    });
  }

  //Hack some CSS of ion-datetime
  setCSS() {
    if(document.querySelector("#" + this.id.replaceAll('-', '\\-')) != null) {
      document.querySelector("#" + this.id.replaceAll('-', '\\-')).shadowRoot.append(
        Object.assign(document.createElement("STYLE"),{ innerText : 'div.calendar-month-year { pointer-events: none; } div.datetime-calendar { max-width: 270px; }' }));
    }

    var elt = document.querySelector("#" + this.id.replaceAll('-', '\\-'))
    if(elt != null) {
      var elt2 = elt.shadowRoot.querySelector<HTMLElement>('slot[name="time-label"]')
      if(elt2 != null)
        elt2.innerHTML = this.translate.instant('Time');

      elt2 = elt.shadowRoot.querySelector<HTMLElement>('div.calendar-body')
      if(elt2 != null) {
        elt2.style.opacity = '1'
      }

      elt2 = elt.shadowRoot.querySelector<HTMLElement>('div.calendar-month-year > ion-item > ion-label > ion-icon')
      if(elt2 != null) {
        elt2.remove();
      }
    }
  }

  //Execute by ion-datetime when the date change
  datetimeIonChange(event) {
    if(!this.isFreeze) {
      //On arrondis à la date du lundi de la semaine
      if(this.presentation == 'week') {
        var date = this.dateFromString(event.detail.value);
        date.setDate(date.getDate() - date.getDay() + 1);
        event.detail.value = this.dateToStringIso(date);
      }

      //On arrondis à la date au1er du mois
      if(this.presentation == 'month') {
        var date = this.dateFromString(event.detail.value);
        date = addDays(date, -date.getDate() + 1)
        event.detail.value = this.dateToStringIso(date);
      }

      this.ionChange.emit(event);
      this.modal.dismiss();
      this.cdref.detectChanges();
    }
  }

  //The user select a year
  selectBtYearCB(year) {
    this.year = year;
    var elt = document.querySelector("#" + this.id.replaceAll('-', '\\-'))
    if(elt != null) {
      if(this.presentation == 'month') {
        elt = elt.shadowRoot.querySelector('ion-picker-column-internal')
        elt = elt.shadowRoot.querySelector('button[part="wheel-item active"]')
        if(elt) {
          var date: Date = new Date(this.year, Number(elt.getAttribute('data-value')) - 1, 1);
          if(date != null) {
            this.isFreeze = true;
            this.value = this.dateToStringIso(date);
            this.isFreeze = false;
            this.datetime.reset(this.value);
          }
        }
      } else {
        elt = elt.shadowRoot.querySelector('button[aria-selected="true"]')
        if(elt != null) {
          var date: Date = new Date(this.year, Number(elt.getAttribute('data-month')) - 1, Number(elt.getAttribute('data-day')));
          if(date != null) {
            this.isFreeze = true;
            this.value = this.dateToStringIso(date);
            this.isFreeze = false;
            this.datetime.reset(this.value);
          }
        }
      }
    }
  }

  //Execute when the modal is open
  showCalendarCB() {
    if(this.title == null) {
      this.title = this.translate.instant('Select a date')
    }
    
    var myElement = document.getElementById(this.id + '__item__' + this.year);
    if(myElement != null) {
      var topPos = myElement.offsetTop;
      document.getElementById(this.id + '__items').scrollTop = topPos - 100;
    }
    this.datetime.reset(this.value);
    this.setCSS();
  }

  showWillCalendarCB() {
  }

  hideCalendarCB() {
  }

  //Open the modal
  buttonClickCB() {
    this.present();
  }

  //The user cancel the change
  datetimeIonCancel(event) {
    this.value = this.valueInitial;
  }

  //Open the modal
  present() {
    setTimeout(() => {
      this.modal.present();
      setTimeout(() => {
        this.showCalendarCB();
      }, 5);
    }, 5);
  }


  dateFromString(date: string): Date {
    return date ? toZonedTime(parseISO(date), Intl.DateTimeFormat().resolvedOptions().timeZone): null;
  }

  dateToStringShortWithTimeWithDay(date: Date, locale = fr): string {
    if(date == null)
      return '';
    return format(date, 'd LLL yyyy HH:mm', {locale: this.dateGetLocale(this.translate.currentLang)});
  }

  dateToStringShortWithoutTimeWithDay(date: Date, locale = fr): string {
    if(date == null)
      return '';
    return format(date, 'd LLL yyyy', {locale: this.dateGetLocale(this.translate.currentLang)});
  }

  dateToStringMonthYear(date: Date, locale = fr): string {
    if(date == null)
      return '';

    return format(date, 'MM/yyyy', {locale: this.dateGetLocale(this.translate.currentLang)});
  }

  dateToStringWithoutTimeWithDay(date: Date, locale = fr): string {
    if(date == null)
      return '';
    return format(date, 'EEEE d LLLL yyyy', {locale: this.dateGetLocale(this.translate.currentLang)});
  }

  dateToStringIso(date: Date, locale = fr): string {
    if(date == null)
      return '';
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXXXX", {locale: this.dateGetLocale(this.translate.currentLang)});
  }


  dateGetLocale(code: String) {
    if(code == 'da')
      return da;
    if(code == 'de')
      return de;
    if(code == 'en')
      return enGB;
    if(code == 'es')
      return es;
    if(code == 'fi')
      return fi;
    if(code == 'fr')
      return fr;
    if(code == 'it')
      return it;
    if(code == 'nl')
      return nl;
    if(code == 'pt')
      return pt;
    if(code == 'sv')
      return sv;
    return enGB;
  }
}
