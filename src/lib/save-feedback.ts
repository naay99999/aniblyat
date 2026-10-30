import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';
import { watchlist, type WatchItem } from './watchlist.svelte';

/** Save or unsave a title and say so, with the way back: open the list, or undo a removal. */
export function toggleSaved(item: Omit<WatchItem, 'addedAt'>): void {
	const before = watchlist.items.find((i) => i.id === item.id);
	if (before) {
		watchlist.remove(item.id);
		toast(m.toast_removed({ title: item.title }), {
			action: { label: m.toast_undo(), onClick: () => watchlist.restore(before) }
		});
	} else {
		watchlist.add(item);
		toast(m.toast_saved({ title: item.title }), {
			action: { label: m.toast_open_list(), onClick: () => goto(resolve('/list')) }
		});
	}
}
