import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center bg-gray-100 px-4 pt-6 dark:bg-slate-950 sm:justify-center sm:pt-0">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="mb-5 text-center">
                <Link href="/" className="inline-flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                    <ApplicationLogo className="h-12 w-auto fill-current text-blue-700" />
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Project X</span>
                </Link>
            </div>

            <div className="w-full overflow-hidden rounded-md border border-slate-200 bg-white px-6 py-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:max-w-md sm:px-8">
                {children}
            </div>
        </div>
    );
}
