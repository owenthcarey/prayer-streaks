import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  Output,
} from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';

@Component({
  selector: 'ns-brut-toggle',
  standalone: true,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <GridLayout
      width="46"
      height="26"
      borderRadius="13"
      class="brut-toggle"
      [class.brut-toggle--checked]="checked"
      [class.brut-toggle--disabled]="disabled"
      (tap)="toggle()"
    >
      <GridLayout
        width="16"
        height="16"
        borderRadius="8"
        class="brut-toggle__thumb"
        [class.brut-toggle__thumb--checked]="checked"
        [horizontalAlignment]="checked ? 'right' : 'left'"
        verticalAlignment="center"
        margin="3"
      ></GridLayout>
    </GridLayout>
  `,
})
export class BrutToggleComponent {
  @Input() checked = false;
  @Input() disabled = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  toggle(): void {
    if (this.disabled) return;
    this.checkedChange.emit(!this.checked);
  }
}
