import { AbstractControl, ValidatorFn } from '@angular/forms';

export class FoundInList {
  // tslint:disable-next-line: no-any
  static isFoundInList(keyValueData: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value;

      if (value === '') {
        return { isFoundInList: false };
      }
      if (value !== null) {
        if (keyValueData) {
          const isNotFound = Object?.keys(keyValueData)?.find(
            (key) => keyValueData[key] === value
          );

          if (!isNotFound) {
            return { isFoundInList: true };
          }
        }
      }
      return null;
    };
  }
}
