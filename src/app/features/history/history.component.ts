import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { isIOS } from '@nativescript/core';
import { CheckInService } from '../../core/services/checkin.service';
import { ShareService } from '../../core/services/share.service';
import { CheckIn, prayerTypeLabel } from '../../core/models/checkin.model';
import {
  formatDisplayDate,
  getMonthYear,
  getTodayISO,
  addDays,
} from '../../core/utils/date.utils';

export interface HistoryItem {
  date: string;
  displayDate: string;
  monthYear: string;
  checked: boolean;
  shielded: boolean;
  prayerType?: string;
  note?: string;
  isMonthHeader: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'ns-history',
  templateUrl: './history.component.html',
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {
  checkinService = inject(CheckInService);
  private shareService = inject(ShareService);

  isIOS = isIOS;

  checkIcon = String.fromCharCode(0xe86c);   // check_circle
  closeIcon = String.fromCharCode(0xe5cd);   // close
  shieldIcon = String.fromCharCode(0xe8e8);  // verified_user
  searchIcon = String.fromCharCode(0xe8b6);  // search
  exportIcon = String.fromCharCode(0xe2c6);  // file_download
  expandIcon = String.fromCharCode(0xe5cf);  // expand_more
  collapseIcon = String.fromCharCode(0xe5ce); // expand_less
  noteIcon = String.fromCharCode(0xe244);    // edit_note

  searchQuery = signal('');
  expandedDates = signal<Set<string>>(new Set());

  hasJournalEntries = computed(() =>
    this.checkinService.checkIns().some((c) => !!c.note)
  );

  historyItems = computed(() => {
    const checkIns = this.checkinService.checkIns();
    const query = this.searchQuery().toLowerCase().trim();
    const expanded = this.expandedDates();

    const checkInMap = new Map<string, CheckIn>();
    for (const c of checkIns) {
      checkInMap.set(c.date, c);
    }

    const shieldedSet = new Set(this.checkinService.shieldedDates());
    const shieldsOn = this.checkinService.shieldsEnabled();

    const items: HistoryItem[] = [];
    const today = getTodayISO();
    let lastMonth = '';

    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i);
      const checkIn = checkInMap.get(date);

      if (query && !(checkIn?.note?.toLowerCase().includes(query))) {
        continue;
      }

      const monthYear = getMonthYear(date);
      if (monthYear !== lastMonth) {
        items.push({
          date: '',
          displayDate: '',
          monthYear,
          checked: false,
          shielded: false,
          isMonthHeader: true,
        });
        lastMonth = monthYear;
      }

      items.push({
        date,
        displayDate: formatDisplayDate(date),
        monthYear,
        checked: !!checkIn,
        shielded: !checkIn && shieldsOn && shieldedSet.has(date),
        prayerType: checkIn?.prayerType
          ? prayerTypeLabel(checkIn.prayerType)
          : undefined,
        note: checkIn?.note,
        isMonthHeader: false,
        isExpanded: expanded.has(date),
      });
    }

    return items;
  });

  onSearchInput(text: string): void {
    this.searchQuery.set(text);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  toggleExpand(date: string): void {
    const current = new Set(this.expandedDates());
    if (current.has(date)) {
      current.delete(date);
    } else {
      current.add(date);
    }
    this.expandedDates.set(current);
  }

  onExportJournal(): void {
    const text = this.checkinService.exportJournalText();
    if (!text) return;
    this.shareService.shareTextFile(text, 'prayer-journal.txt');
  }
}

