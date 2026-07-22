import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]',
})
export class OnlyNumbersDirective {
  constructor() { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    let input = event.target as HTMLInputElement;
    let isFirstCharacter =
      input.value.length === 0;
    let controlKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    let isNumber = /^[0-9]$/.test(event.key);
    let isDecimalSeparator = event.key === ',' || event.key === '.';
    let hasDecimalSeparator =
      input.value.includes(',') || input.value.includes('.');
    if (
      (!isNumber &&
        !isDecimalSeparator &&
        !controlKeys.includes(event.key)) ||
      (isDecimalSeparator && hasDecimalSeparator) ||
      (isDecimalSeparator && isFirstCharacter)
    ) {
      event.preventDefault();
    }
  }
}
