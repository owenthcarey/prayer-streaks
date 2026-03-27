import { Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { TouchAction, TouchGestureEventData, View } from '@nativescript/core';

@Directive({
  selector: '[brutPress]',
  standalone: true,
})
export class BrutPressDirective {
  @Input() brutPressDisabled = false;
  @Input() brutPressOffset = 2;
  @Input() brutPressDuration = 70;

  @HostBinding('class.brut-pressable')
  readonly pressableClass = true;

  @HostBinding('class.brut-pressable--active')
  private isPressed = false;

  constructor(private elementRef: ElementRef<View>) {}

  @HostListener('touch', ['$event'])
  onTouch(args: TouchGestureEventData): void {
    if (this.brutPressDisabled) {
      this.release(true);
      return;
    }

    switch (args.action) {
      case TouchAction.down:
        this.press();
        break;
      case TouchAction.up:
      case TouchAction.cancel:
        this.release();
        break;
    }
  }

  @HostListener('unloaded')
  onUnloaded(): void {
    this.release(true);
  }

  private press(): void {
    if (this.isPressed) return;
    this.isPressed = true;
    this.animateTo(this.brutPressOffset, this.brutPressOffset);
  }

  private release(immediate = false): void {
    if (!this.isPressed && !immediate) return;
    this.isPressed = false;

    if (immediate) {
      const view = this.elementRef.nativeElement;
      view.translateX = 0;
      view.translateY = 0;
      return;
    }

    this.animateTo(0, 0);
  }

  private animateTo(x: number, y: number): void {
    void this.elementRef.nativeElement.animate({
      translate: { x, y },
      duration: this.brutPressDuration,
    });
  }
}
