import { AbstractControl, ValidatorFn } from '@angular/forms';

export class DateValidator {
  static fromToDate(
    fromDateField: string,
    toDateField: string,
    errorName: string = 'fromToDate'
  ): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      const fromDate = formGroup?.get(fromDateField)?.value;
      const toDate = formGroup?.get(toDateField)?.value;

      if (fromDate !== null && toDate === '') {
        return null;
      }
      if (fromDate !== null && toDate !== null && fromDate > toDate) {
        return { [errorName]: true };
      }

      return null;
    };
  }
}
