export type QueryView = 'pending' | 'error' | 'stale' | 'data';

/** Which state to render: a failed background refetch keeps the loaded data on screen ('stale'). */
export function queryView(q: { isPending: boolean; isError: boolean; data: unknown }): QueryView {
	if (q.data !== undefined) return q.isError ? 'stale' : 'data';
	if (q.isError) return 'error';
	return 'pending';
}
