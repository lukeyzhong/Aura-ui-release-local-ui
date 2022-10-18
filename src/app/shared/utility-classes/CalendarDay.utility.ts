export class CalendarDay {
  date: Date;
  title!: string;
  isPastDate: boolean;
  isToday: boolean;

  getDateString(): string {
    return this.date.toISOString().split('T')[0];
  }

  constructor(d: Date) {
    this.date = d;
    this.isPastDate = d.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    this.isToday = d.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0);
  }
}
