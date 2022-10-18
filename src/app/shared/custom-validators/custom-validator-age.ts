import { AbstractControl, ValidatorFn } from '@angular/forms';

export class AgeValidator {
    static isAgeInvalid(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            const age = this.ageFromDateOfBirthday(control.value);
            if (age < 18 || age > 100) {
                return { isAgeInvalid: true };
            }
            return null;
        };
    }


    static ageFromDateOfBirthday(dateOfBirth: string): number {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

}

