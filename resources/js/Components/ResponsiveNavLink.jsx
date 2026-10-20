import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center rounded-md border-l-2 py-2.5 pe-4 ps-3 ${
                active
                        ? 'border-blue-700 bg-blue-50 text-slate-950 dark:border-blue-500 dark:bg-white dark:text-black'
                        : 'border-transparent text-slate-600 hover:bg-blue-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white dark:hover:text-black'
                    } text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-offset-slate-900 ${className}`}
        >
            {children}
        </Link>
    );
}
