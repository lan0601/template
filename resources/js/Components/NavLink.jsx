import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            data-module-active={active ? 'true' : undefined}
            className={
                'module-nav-link flex items-center rounded-md border-l-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 dark:focus:ring-offset-slate-900 ' +
                (active
                    ? 'border-blue-700 bg-blue-50 text-slate-950 dark:border-blue-500 dark:bg-white dark:text-black'
                    : 'border-transparent text-slate-600 hover:bg-blue-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white dark:hover:text-black') +
                className
            }
        >
            {children}
        </Link>
    );
}
