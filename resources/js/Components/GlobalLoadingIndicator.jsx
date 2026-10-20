import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GlobalLoadingIndicator() {
    const [inertiaRequests, setInertiaRequests] = useState(0);
    const [actionRequests, setActionRequests] = useState(0);

    useEffect(() => {
        const removeStartListener = router.on('start', () => {
            setInertiaRequests((count) => count + 1);
        });
        const removeFinishListener = router.on('finish', () => {
            setInertiaRequests((count) => Math.max(0, count - 1));
        });
        const handleActionLoading = (event) => {
            setActionRequests((count) => Math.max(0, count + event.detail));
        };

        window.addEventListener('app:action-loading', handleActionLoading);

        return () => {
            removeStartListener();
            removeFinishListener();
            window.removeEventListener('app:action-loading', handleActionLoading);
        };
    }, []);

    if (inertiaRequests === 0 && actionRequests === 0) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/15 px-4 backdrop-blur-[1px] dark:bg-black/40"
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="flex min-w-40 items-center gap-3 rounded-md border border-slate-200 bg-white px-5 py-4 shadow-xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Working...</span>
            </div>
        </div>
    );
}