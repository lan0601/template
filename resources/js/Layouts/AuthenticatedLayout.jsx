import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Dropdowntop from '@/Components/Dropdowntop';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, router, usePage, useRemember } from '@inertiajs/react';
import { useEffect } from 'react';

function NavigationIcon({ routeName }) {
    const iconContents = {
        dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
        attendance: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 15l2 2 5-5" /></>,
        cschedule: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M12 13v3l2 1" /></>,
        userrole: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" /></>,
        subject: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 6h8M8 9h8" /></>,
        section: <><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5" /></>,
        classroom: <><path d="M3 21V5l9-3 9 3v16M3 21h18M8 21v-6h8v6M8 8h.01M16 8h.01M8 11h.01M16 11h.01" /></>,
    };
    const iconKey = routeName === 'dashboard' || routeName === 'attendance' || routeName === 'cschedule'
        ? routeName
        : routeName === 'userrole' || routeName === 'subject' || routeName === 'section'
            ? routeName
            : 'classroom';

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
            {iconContents[iconKey]}
        </svg>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { user, permissions = {}, impersonating = false, impersonator } = usePage().props.auth;
    const currentRoute = route().current();

    const isDashboardActive = route().current('dashboard') || route().current('attendance') || route().current('schedule2') || route().current('campus-schedule') || route().current('cschedule');
   

    const [showNav, setShowNav] = useRemember(true, 'showNav');
    const [navCollapsed, setNavCollapsed] = useRemember(false, 'navCollapsed');
    const [openDashboard, setOpenDashboard] = useRemember(isDashboardActive, 'openDashboard');

    useEffect(() => {
        if (isDashboardActive) setOpenDashboard(true);
       
    }, [currentRoute]);


    const canAccess = (page) => {
        if (user?.role?.toLowerCase() === 'admin') {
            return true;
        }

        return Boolean(permissions?.[page]);
    };

    const navItems = [
        {
            title: 'Dashboard',
            isOpen: openDashboard,
            setIsOpen: setOpenDashboard,
            links: [
                { name: 'Dashboard', routeName: 'dashboard', active: 'dashboard', permission: 'dashboard' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="md:flex md:min-h-screen">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 md:hidden">
                    <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowNav(!showNav)}
                        aria-expanded={showNav}
                        aria-label={showNav ? 'Close navigation menu' : 'Open navigation menu'}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    >
                        {showNav ? 'Close Menu' : 'Menu'}
                    </button>
                    <ThemeToggle />
                    </div>
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo className="h-8 w-auto fill-current text-blue-700" />
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">Attendance Web Portal</span>
                    </Link>
                </div>

                <aside className={`${showNav ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-700 dark:bg-slate-900 md:sticky md:top-0 md:flex md:h-screen ${navCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                    <div className={`flex h-[76px] items-center justify-between border-b border-slate-200 dark:border-slate-700 ${navCollapsed ? 'px-2 md:flex-col md:justify-center md:gap-1' : 'px-5'}`}>
                        <Link href="/" className={`flex min-w-0 items-center gap-2 ${navCollapsed ? 'md:justify-center' : ''}`}>
                            <ApplicationLogo className={`w-auto fill-current text-blue-700 ${navCollapsed ? 'h-9 md:h-8' : 'h-9'}`} />
                            <span className={`text-lg font-bold tracking-normal text-slate-900 dark:text-slate-100 ${navCollapsed ? 'md:hidden' : ''}`}>Attendance Portal</span>
                        </Link>
                        <div className="hidden md:block">
                            <button
                                type="button"
                                onClick={() => setNavCollapsed((collapsed) => !collapsed)}
                                aria-label={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                                aria-expanded={!navCollapsed}
                                title={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                                className={`group relative inline-flex shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-blue-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${navCollapsed ? 'h-9 w-9 md:h-8 md:w-8' : 'h-9 w-9'}`}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                                    {navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
                                </span>
                            </button>
                        </div>
                    </div>
                    <nav aria-label="Main navigation" className={`flex flex-1 flex-col gap-1 overflow-y-auto py-5 ${navCollapsed ? 'px-2' : 'px-3'}`}>
                        {navCollapsed && (
                            <div className="hidden flex-col gap-1 md:flex">
                                {navItems.flatMap((section) => {
                                    const canShowSection = section.groupPermission
                                        ? canAccess(section.groupPermission)
                                        : section.links.some((link) => !link.permission || canAccess(link.permission));

                                    return canShowSection
                                        ? section.links
                                            .filter((link) => !link.permission || canAccess(link.permission))
                                            .map((link) => (
                                        <NavLink
                                            key={link.routeName}
                                            href={route(link.routeName)}
                                            active={route().current(link.active)}
                                            title={link.name}
                                            aria-label={link.name}
                                            className="w-full justify-center px-2 py-3"
                                        >
                                            <NavigationIcon routeName={link.routeName} />
                                        </NavLink>
                                            ))
                                        : [];
                                })}
                            </div>
                        )}
                        <div className={`flex flex-col gap-1 ${navCollapsed ? 'md:hidden' : ''}`}>
                        {navItems.map((section) => {
                            const canShowSection = section.groupPermission
                                ? canAccess(section.groupPermission)
                                : section.links.some(link => !link.permission || canAccess(link.permission));

                            if (!canShowSection) {
                                return null;
                            }

                            return (
                                <div key={section.title}>
                                    <button
                                        type="button"
                                        onClick={() => section.setIsOpen(!section.isOpen)}
                                        aria-expanded={section.isOpen}
                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-xs font-bold uppercase text-slate-500 transition hover:bg-blue-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${section.marginTop ? 'mt-4' : ''}`}
                                    >
                                        <span>{section.title}</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`h-4 w-4 text-slate-400 transition-transform ${section.isOpen ? 'rotate-180' : ''}`}>
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </button>
                                    {section.isOpen && (
                                        <div className="mt-1 flex flex-col gap-1">
                                            {section.links.map(link => (
                                                (!link.permission || canAccess(link.permission)) && (
                                                    <NavLink
                                                        key={link.routeName}
                                                        href={route(link.routeName)}
                                                        active={route().current(link.active)}
                                                        className="w-full px-3 py-2.5"
                                                    >
                                                        {link.name}
                                                    </NavLink>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    </nav>
                    <div className={`mt-auto border-t border-slate-200 dark:border-slate-700 ${navCollapsed ? 'p-2' : 'p-3'}`}>
                        <div className={`mb-2 flex items-center px-2 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 ${navCollapsed ? 'justify-center' : 'justify-between'}`}>
                            <span className={navCollapsed ? 'md:hidden' : ''}>Appearance</span>
                            <ThemeToggle />
                        </div>
                        <Dropdowntop>
                            <Dropdowntop.Trigger>
                                <button title={navCollapsed ? user.name : undefined} className={`flex w-full items-center rounded-md p-2 text-left transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900 ${navCollapsed ? 'justify-center md:gap-0' : 'gap-3'}`}>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-950">
                                        {user.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <span className={`min-w-0 flex-1 ${navCollapsed ? 'md:hidden' : ''}`}>
                                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
                                        <span className="mt-0.5 block text-xs capitalize text-slate-500 dark:text-slate-400">{user.role}</span>
                                    </span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`h-4 w-4 text-slate-400 dark:text-slate-300 ${navCollapsed ? 'md:hidden' : ''}`}>
                                        <path d="m6 15 6-6 6 6" />
                                    </svg>
                                </button>
                            </Dropdowntop.Trigger>

                            <Dropdowntop.Content>
                                <Dropdowntop.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdowntop.Link>
                                <Dropdowntop.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdowntop.Link>
                            </Dropdowntop.Content>
                        </Dropdowntop>
                    </div>
                </aside>
                <main className="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-4 dark:bg-slate-950 md:p-7 lg:p-8">
                    {impersonating && (
                        <div className="mb-5 flex flex-col gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                Viewing as <strong>{user.name}</strong>. Signed in originally as {impersonator?.name || 'administrator'}.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.post(route('userrole.stop-impersonating'))}
                                className="rounded-md bg-amber-800 px-3 py-2 font-semibold text-white transition hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-700 focus:ring-offset-2"
                            >
                                Return to admin account
                            </button>
                        </div>
                    )}
                    {/* <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header> */}
                    {children}
                </main>
            </div>
        </div>
    );
}
