import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DateUtilsService } from './../../services/date-utils.service';
import { AlertController, IonModal, IonDatetime } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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

  @Input() title: string;
  @Input() doneText: string;
  @Input() cancelText: string;
  @Input() max: string;
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
    } else {
      this.buttonLabel = this.dateUtils.toStringShortWithoutTimeWithDay(this.dateUtils.fromString(value));
    }
    this.cdref.detectChanges();
  }
  get value(): string {
    return this._value;
  }

  constructor(public dateUtils: DateUtilsService,
    private cdref: ChangeDetectorRef,
    private translate: TranslateService) { 
    this.id = this.uuidv4()

    this.title = this.translate.instant('Select a date')

    for(var i = 1960; i < 2050; i++) {
      this.years.push(i)
    }
  }

  ngOnInit() {
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
      elt = elt.shadowRoot.querySelector('slot[name="time-label"]')
      if(elt != null)
        elt.innerHTML = this.translate.instant('Time');
    }
  }

  datetimeIonChange(event) {
    if(!this.isFreeze) {
      this.ionChange.emit(event);
      this.modal.dismiss();
      this.cdref.detectChanges();
    }
  }

  selectBtYearCB(year) {
    this.year = year;

    var elt = document.querySelector("#" + this.id.replaceAll('-', '\\-'))
    if(elt != null) {
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

  showCalendarCB() {
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
    this.modal.present();
    setTimeout(() => {
        this.showCalendarCB();
    }, 100);
  }

}
