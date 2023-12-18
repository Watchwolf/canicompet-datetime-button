import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DateUtilsService } from './../../services/date-utils.service';
import { AlertController, IonModal, IonDatetime } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { parse, parseISO, differenceInSeconds, addDays, addHours, getDay, fromUnixTime, addYears } from 'date-fns'


@Component({
  selector: 'canicompet-datetime-button',
  templateUrl: './canicompet-datetime-button.component.html',
  styleUrls: ['./canicompet-datetime-button.component.scss'],
})
export class CanicompetDatetimeButtonComponent implements OnInit {
  @ViewChild('modal', { static: false }) modal!: IonModal;
  @ViewChild('datetime', { static: false }) datetime!: IonDatetime;
  @ViewChild('datetime', { static: false }) datetimeRef!: ElementRef;

  id = '';
  years = []
  year = 2000
  isFreeze: Boolean = false;
  buttonLabel = ''

  @Output() ionChange = new EventEmitter<void>();

  @Input() presentation: string = 'date';
  @Input() buttonFill: string = 'solid';
  @Input() buttonLabelFormat: string = 'date';

  @Input() title: string = null;
  @Input() doneText: string;
  @Input() cancelText: string;
  @Input() max: string = '2050-12-31';
  @Input() min: string = '1940-01-01';
  valueInitial: string;
  @Input() _value: string;
  @Input() set value(value: string) {
    if(value == null || value == '')
      value = this.dateUtils.toStringIso(new Date())

    if(!this.isFreeze && value != null && value != '') {
      this.valueInitial = value;
      this.selectBtYearCB(this.dateUtils.fromString(value).getFullYear());
    }
    this._value = value;

    if(this.presentation == 'date-time') {
      this.buttonLabel = this.dateUtils.toStringShortWithTimeWithDay(this.dateUtils.fromString(value));
    } else if(this.presentation == 'week') {
      this.buttonLabel = this.translate.instant('Week') + ' ' + this.dateUtils.toStringShortWithoutTimeWithDay(this.dateUtils.fromString(value));
    } else if(this.presentation == 'month') {
      this.buttonLabel = this.dateUtils.toStringMonthYear(this.dateUtils.fromString(value));
    } else if(this.buttonLabelFormat == 'date') {
      this.buttonLabel = this.dateUtils.toStringShortWithoutTimeWithDay(this.dateUtils.fromString(value));
    } else if(this.buttonLabelFormat == 'dateWithDay') {
      this.buttonLabel = this.dateUtils.toStringWithoutTimeWithDay(this.dateUtils.fromString(value));
    }
    this.updateYears();
    this.cdref.detectChanges();
  }

  get value(): string {
    return this._value;
  }

  constructor(public dateUtils: DateUtilsService,
    private cdref: ChangeDetectorRef,
    private translate: TranslateService) { 
    this.id = this.uuidv4()
  }

  ngOnInit() {
  }

  updateYears() {
    this.years = []
    var max = 2050;
    if (this.max != null) {
      max = this.dateUtils.fromString(this.max).getFullYear();
    }

    var min = 1940;
    if (this.min != null) {
      min = this.dateUtils.fromString(this.min).getFullYear();
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
    }
  }

  datetimeIonChange(event) {
    console.log(event.detail.value)
    if(!this.isFreeze) {
      //On arrondis à la date du lundi de la semaine
      if(this.presentation == 'week') {
        var date = this.dateUtils.fromString(event.detail.value);
        date.setDate(date.getDate() - date.getDay() + 1);
        event.detail.value = this.dateUtils.toStringIso(date);
      }

      //On arrondis à la date au1er du mois
      if(this.presentation == 'month') {
        var date = this.dateUtils.fromString(event.detail.value);
        date = addDays(date, -date.getDate() + 1)
        event.detail.value = this.dateUtils.toStringIso(date);
      }

      this.ionChange.emit(event);
      this.modal.dismiss();
      this.cdref.detectChanges();
    }
  }

  selectBtYearCB(year) {
    this.year = year;
    var elt = document.querySelector("#" + this.id.replaceAll('-', '\\-'))
    if(elt != null) {
      if(this.presentation == 'month') {
        elt = elt.shadowRoot.querySelector('ion-picker-column-internal')
        elt = elt.shadowRoot.querySelector('button[part="wheel-item active"]')
        if(elt) {
          var date = new Date(this.year, Number(elt.getAttribute('data-value')) - 1, 1);
          if(date != null) {
            this.isFreeze = true;
            this.value = this.dateUtils.toStringIsoWithoutTimezone(date);
            this.isFreeze = false;
            this.datetime.reset(this.value);
          }
        }
      } else {
        elt = elt.shadowRoot.querySelector('button[aria-selected="true"]')
        if(elt != null) {
          var date = new Date(this.year, Number(elt.getAttribute('data-month')) - 1, Number(elt.getAttribute('data-day')));
          if(date != null) {
            this.isFreeze = true;
            this.value = this.dateUtils.toStringIsoWithoutTimezone(date);
            this.isFreeze = false;
            this.datetime.reset(this.value);
          }
        }
      }
    }
  }

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

  buttonClickCB() {
    this.present();
  }

  datetimeIonCancel(event) {
    this.value = this.valueInitial;
  }

  present() {
    setTimeout(() => {
      this.modal.present();
      setTimeout(() => {
        this.showCalendarCB();
      }, 5);
    }, 5);
  }

}
