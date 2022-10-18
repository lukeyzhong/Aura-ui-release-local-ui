import { Pipe, PipeTransform } from '@angular/core';
import { CalendarDay } from '../utility-classes/CalendarDay.utility';

@Pipe({
  name: 'chunkdays',
})
export class ChunkDaysPipe implements PipeTransform {
  // tslint:disable-next-line: no-any
  transform(calendarDaysArray: CalendarDay[], chunkSize: number): any {
    const calendarDays: CalendarDay[] = [];
    // tslint:disable-next-line: no-any
    let weekDays: any = [];

    calendarDaysArray.map((day: CalendarDay, index: number) => {
      weekDays.push(day);
      if (++index % chunkSize === 0) {
        calendarDays.push(weekDays);
        weekDays = [];
      }
    });
    return calendarDays;
  }
}
