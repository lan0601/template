import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Dropdowntop from '@/Components/Dropdowntop';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, useRemember } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const { user, permissions = {} } = usePage().props.auth;
    const [showNav, setShowNav] = useRemember(true,'showNav');
    const [openDashboard, setOpenDashboard] = useRemember(false,'openDashboard');
    const [openMaster, setOpenMaster] = useRemember(false,'openMaster');
    const [openAcademic, setOpenAcademic] = useRemember(false,'openAcademic');
    const [openTransactions, setOpenTransactions] = useRemember(false,'openTransactions');

    const canAccess = (page) => {
        if (user?.role === 'admin') {
            return true;
        }

        return Boolean(permissions?.[page]);
    };

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
                        <div>
                            <button
                                type="button"
                                onClick={() => setOpenDashboard(!openDashboard)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 rounded"
                            >
                                <span>Dashboard</span>
                                <span className="text-xs">{openDashboard ? '▾' : '▸'}</span>
                            </button>
                            {openDashboard && canAccess('dashboard') && (
                                <div className="mt-1 ml-2 flex flex-col space-y-1">
                                    <NavLink href={route('dashboard')} active={route().current('dashboard')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                        Dashboard
                                    </NavLink>
                                    <NavLink href={route('attendance')} active={route().current('attendance')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                        Attendance
                                    </NavLink>
                                </div>
                            )}
                            
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setOpenMaster(!openMaster)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 rounded mt-4"
                            >
                                <span>Master Data</span>
                                <span className="text-xs">{openMaster ? '▾' : '▸'}</span>
                            </button>
                            {openMaster && (
                                <div className="mt-1 ml-2 flex flex-col space-y-1">
                                    {canAccess('userrole') && (
                                        <NavLink href={route('userrole')} active={route().current('userrole')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                            Users
                                        </NavLink>
                                    )}
                                    {canAccess('subject') && (
                                        <NavLink href={route('subject')} active={route().current('subject')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                            Subjects
                                        </NavLink>
                                    )}
                                    {/* {canAccess('users') && (
                                        <NavLink href={route('userrole')} active={route().current('userrole')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                            Teachers
                                        </NavLink>
                                    )} */}
                                    {canAccess('section') && (
                                        <NavLink href={route('section')} active={route().current('section')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                            Sections
                                        </NavLink>
                                    )}
                                    {canAccess('classroom') && (
                                        <NavLink href={route('classroom')} active={route().current('classroom')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                            Rooms
                                        </NavLink>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setOpenAcademic(!openAcademic)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 rounded mt-4"
                            >
                                <span>Academic Setup</span>
                                <span className="text-xs">{openAcademic ? '▾' : '▸'}</span>
                            </button>
                            {openAcademic && (
                                <div className="mt-1 ml-2">
                                    <div className="px-4 py-2 text-sm text-gray-700 rounded">Subject Offerings</div>
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setOpenTransactions(!openTransactions)}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 rounded mt-4"
                            >
                                <span>Transactions</span>
                                <span className="text-xs">{openTransactions ? '▾' : '▸'}</span>
                            </button>
                            {openTransactions && (
                                <div className="mt-1 ml-2 flex flex-col space-y-1">
                                    {canAccess('enroll') && (
                                        <NavLink href={route('enroll')} active={route().current('enroll')} className="px-4 py-2 rounded hover:bg-black hover:text-white">
                                            Enrollment
                                        </NavLink>
                                    )}
                                </div>
                            )}
                        </div>
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
