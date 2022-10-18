import { AbstractControl, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';

export class FutureDateValidator {
  static futureDateCheck(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value) {
        const date = moment(control.value);
        const today = moment();
        if (date.isBefore(today)) {
          return { invalidDate: true };
        }
      }
      return null;
    };
  }
}
