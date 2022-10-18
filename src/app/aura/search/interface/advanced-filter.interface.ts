import { FormArray } from '@angular/forms';

export interface FilterValues {
    advancedFilters: FormArray;
    title: string;
    status: number;
    department: string;
}
