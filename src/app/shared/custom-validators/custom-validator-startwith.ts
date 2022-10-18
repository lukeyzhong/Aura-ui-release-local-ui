import { AbstractControl, ValidatorFn } from '@angular/forms';

export class StartwithPlus {
    static isStartwithPlus(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const value = control.value;
            const n = value?.startsWith('+');
            if (!n) {
                return { isStartwith: true };
            }
            return null;
        };
    }
}
