import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Dropdowntop from '@/Components/Dropdowntop';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, useRemember } from '@inertiajs/react';
import { useEffect } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { user, permissions = {} } = usePage().props.auth;
    const currentRoute = route().current();

    const isDashboardActive = route().current('dashboard') || route().current('attendance') || route().current('schedule2') || route().current('campus-schedule');
    const isMasterActive = route().current('userrole*') || route().current('subject') || route().current('section*') || route().current('classroom*');
    const isAcademicActive = route().current('subjectoffering*') || route().current('enrollmentsubject*');
    const isTransactionsActive = route().current('enroll*');

    const [showNav, setShowNav] = useRemember(true, 'showNav');
    const [openDashboard, setOpenDashboard] = useRemember(isDashboardActive, 'openDashboard');
    const [openMaster, setOpenMaster] = useRemember(isMasterActive, 'openMaster');
    const [openAcademic, setOpenAcademic] = useRemember(isAcademicActive, 'openAcademic');
    const [openTransactions, setOpenTransactions] = useRemember(isTransactionsActive, 'openTransactions');

    useEffect(() => {
        if (isDashboardActive) setOpenDashboard(true);
        if (isMasterActive) setOpenMaster(true);
        if (isAcademicActive) setOpenAcademic(true);
        if (isTransactionsActive) setOpenTransactions(true);
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
            groupPermission: 'dashboard',
            links: [
                { name: 'Dashboard', routeName: 'dashboard', active: 'dashboard' },
                { name: 'Attendance', routeName: 'attendance', active: 'attendance' },
                { name: 'Schedule', routeName: 'schedule2', active: 'schedule2' },
                { name: 'Campus Schedule', routeName: 'campus-schedule', active: 'campus-schedule' },
            ],
        },
        {
            title: 'Master Data',
            isOpen: openMaster,
            setIsOpen: setOpenMaster,
            marginTop: true,
            links: [
                { name: 'Users', routeName: 'userrole', active: 'userrole', permission: 'userrole' },
                { name: 'Subjects', routeName: 'subject', active: 'subject', permission: 'subject' },
                { name: 'Sections', routeName: 'section', active: 'section', permission: 'section' },
                { name: 'Rooms', routeName: 'classroom', active: 'classroom', permission: 'classroom' },
            ],
        },
        {
            title: 'Academic Setup',
            isOpen: openAcademic,
            setIsOpen: setOpenAcademic,
            marginTop: true,
            links: [
                { name: 'Subject Offerings', routeName: 'subjectoffering', active: 'subjectoffering*', permission: 'subjectoffering' },
                { name: 'Enrollment Subject', routeName: 'enrollmentsubject', active: 'enrollmentsubject*', permission: 'enrollmentsubject' },
            ],
        },
        {
            title: 'Transactions',
            isOpen: openTransactions,
            setIsOpen: setOpenTransactions,
            marginTop: true,
            links: [
                { name: 'Enrollment', routeName: 'enroll', active: 'enroll', permission: 'enroll' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="md:flex md:min-h-screen">
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setShowNav(!showNav)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        {showNav ? 'Close Menu' : 'Menu'}
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo className="h-8 w-auto fill-current text-gray-800" />
                        <span className="text-base font-semibold text-gray-800">Scheduler</span>
                    </Link>
                </div>

                <aside className={`${showNav ? 'block' : 'hidden'} md:block md:w-64 bg-white border-r border-gray-200 flex flex-col`}>
                    <div className="flex items-center h-16 px-4 border-b">
                        <Link href="/" className="flex items-center gap-2">
                            <ApplicationLogo className="h-9 w-auto fill-current text-gray-800" />
                            <span className="text-lg font-semibold text-gray-800">Scheduler</span>
                        </Link>
                    </div>
                    <nav className="flex flex-col p-2 space-y-2 overflow-y-auto">
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
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 rounded ${section.marginTop ? 'mt-4' : ''}`}
                                    >
                                        <span>{section.title}</span>
                                        <span className="text-xs">{section.isOpen ? '▾' : '▸'}</span>
                                    </button>
                                    {section.isOpen && (
                                        <div className="mt-1 ml-2 flex flex-col space-y-1">
                                            {section.links.map(link => (
                                                (!link.permission || canAccess(link.permission)) && (
                                                    <NavLink
                                                        key={link.routeName}
                                                        href={route(link.routeName)}
                                                        active={route().current(link.active)}
                                                        className="px-4 py-2 rounded hover:bg-black hover:text-white"
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
                    </nav>
                    <div className="mt-auto p-4 border-t">
                        <Dropdowntop>
                            <Dropdowntop.Trigger>
                                <button className="w-full text-left text-sm text-gray-600">
                                    {user.name}
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
                <main className="flex-1 p-4 md:p-6 bg-gray-100 overflow-y-auto">
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
