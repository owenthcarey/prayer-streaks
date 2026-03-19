import { Injectable } from '@angular/core';
import { Utils, isIOS } from '@nativescript/core';
import { DAILY_QUOTES } from '../data/quotes';
import { DailyQuote } from '../models/quote.model';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  getTodayQuote(): DailyQuote {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = (dayOfYear - 1) % DAILY_QUOTES.length;
    return DAILY_QUOTES[index >= 0 ? index : 0];
  }

  copyToClipboard(quote: DailyQuote): void {
    const text = `${quote.text}\n\u2014${quote.source}`;

    if (isIOS) {
      UIPasteboard.generalPasteboard.string = text;
    } else {
      const ctx = Utils.android.getApplicationContext();
      const clipboard = ctx.getSystemService(
        android.content.Context.CLIPBOARD_SERVICE
      ) as android.content.ClipboardManager;
      const clip = android.content.ClipData.newPlainText('quote', text);
      clipboard.setPrimaryClip(clip);
    }
  }

  shareQuote(quote: DailyQuote): void {
    const text = `${quote.text}\n\u2014${quote.source}\n\nShared via Prayer Streaks`;

    if (isIOS) {
      const str = NSString.stringWithString(text);
      const items = NSArray.arrayWithArray([str]);
      const activityVC = UIActivityViewController.alloc()
        .initWithActivityItemsApplicationActivities(items, null);

      const app = UIApplication.sharedApplication;
      const window = app.keyWindow ?? app.windows.objectAtIndex(0);
      let rootVC = window?.rootViewController ?? null;
      while (rootVC?.presentedViewController) {
        rootVC = rootVC.presentedViewController;
      }
      if (!rootVC) return;

      if (activityVC.popoverPresentationController) {
        activityVC.popoverPresentationController.sourceView = rootVC.view;
        activityVC.popoverPresentationController.sourceRect = CGRectMake(
          rootVC.view.bounds.size.width / 2,
          rootVC.view.bounds.size.height / 2,
          0, 0
        );
      }

      rootVC.presentViewControllerAnimatedCompletion(activityVC, true, null);
    } else {
      const ctx = Utils.android.getApplicationContext();
      const intent = new android.content.Intent(
        android.content.Intent.ACTION_SEND
      );
      intent.setType('text/plain');
      intent.putExtra(android.content.Intent.EXTRA_TEXT, text);
      const chooser = android.content.Intent.createChooser(
        intent, 'Share Quote'
      );
      chooser.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
      ctx.startActivity(chooser);
    }
  }
}
