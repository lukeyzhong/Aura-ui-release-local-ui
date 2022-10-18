import {
    Directive,
    ElementRef,
    Input,
    OnInit,
    OnDestroy,
    Renderer2,
  } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[formControlName][phoneMask]',
  })
  export class PhoneMaskDirective implements OnInit, OnDestroy {
    private preVal!: string;

    @Input()
    set preValue(value: string) {
      this.preVal = value;
    }

    private sub!: Subscription | undefined;

    constructor(
      private el: ElementRef,
      private phoneControl: NgControl,
      private renderer: Renderer2
    ) {}

    ngOnInit(): void {
      this.phoneValidate();
    }

    ngOnDestroy(): void {
      this.sub?.unsubscribe();
    }

    phoneValidate(): void {
      this.sub = this.phoneControl?.control?.valueChanges.subscribe((data) => {

        // tslint:disable-next-line: prefer-const
        let preInputValue: string = this.preVal;

        const lastChar = preInputValue.substr(preInputValue.length - 1);

        if (data) {
          // tslint:disable-next-line: no-var-keyword
          var newVal = data.replace(/\D/g, '');
        }

        let start = this.el.nativeElement.selectionStart;
        let end = this.el.nativeElement.selectionEnd;

        if (data && preInputValue) {
          if (data.length < preInputValue.length) {
            if (preInputValue.length < start) {
              if (lastChar === ')') {
                newVal = newVal.substr(0, newVal.length - 1);
              }
            }

            if (newVal.length === 0) {
              newVal = '';
            } else if (newVal.length <= 3) {
              newVal = newVal.replace(/^(\d{0,3})/, '($1');
            } else if (newVal.length <= 6) {
              newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
            } else {
              newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1) $2-$3');
            }

            this.phoneControl?.control?.setValue(newVal, { emitEvent: false });

            this.renderer
              .selectRootElement(this.el)
              .nativeElement.setSelectionRange(start, end);

          } else {
            const removedD = data.charAt(start);

            if (newVal.length === 0) {
              newVal = '';
            } else if (newVal.length <= 3) {
              newVal = newVal.replace(/^(\d{0,3})/, '($1)');
            } else if (newVal.length <= 6) {
              newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
            } else {
              newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(.*)/, '($1) $2-$3');
            }

            if (preInputValue.length >= start) {
              if (removedD === '(') {
                start = start + 1;
                end = end + 1;
              }
              if (removedD === ')') {
                start = start + 2; // +2 so there is also space char after ')'.
                end = end + 2;
              }
              if (removedD === '-') {
                start = start + 1;
                end = end + 1;
              }
              if (removedD === ' ') {
                start = start + 1;
                end = end + 1;
              }
              this.phoneControl?.control?.setValue(newVal, { emitEvent: false });
              this.renderer
                .selectRootElement(this.el)
                .nativeElement.setSelectionRange(start, end);
            } else {
              this.phoneControl?.control?.setValue(newVal, { emitEvent: false });
              this.renderer
                .selectRootElement(this.el)
                .nativeElement.setSelectionRange(start + 2, end + 2); // +2 because of wanting standard typing
            }
          }
        }
      });
    }
}
