import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]',
})
export class OnlyNumbersDirective {
  constructor() { }

  private readonly allowedControlKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
  ];

  /**
   * Prevents invalid characters in a numeric input.
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (
      this.isKeyboardShortcut(event) ||
      this.isAllowedInputKey(event)
    ) {
      return;
    }
    event.preventDefault();
  }

  /**
   * Checks whether a common keyboard shortcut is used.
   */
  private isKeyboardShortcut(event: KeyboardEvent): boolean {
    const shortcutKeys = ['a', 'c', 'v', 'x'];
    return (
      (event.ctrlKey || event.metaKey) &&
      shortcutKeys.includes(event.key.toLowerCase())
    );
  }

  /**
   * Checks whether the pressed key is valid for the input.
   */
  private isAllowedInputKey(event: KeyboardEvent): boolean {
    if (this.allowedControlKeys.includes(event.key)) {
      return true;
    }
    if (/^[0-9]$/.test(event.key)) {
      return true;
    }
    return this.isAllowedDecimalSeparator(event);
  }

  /**
   * Checks whether a decimal separator may be entered.
   */
  private isAllowedDecimalSeparator(
    event: KeyboardEvent
  ): boolean {
    const input = event.target as HTMLInputElement;
    const isSeparator = event.key === ',' || event.key === '.';
    const alreadyExists = /[,.]/.test(input.value);
    return (
      isSeparator &&
      input.value.length > 0 &&
      !alreadyExists
    );
  }
}
