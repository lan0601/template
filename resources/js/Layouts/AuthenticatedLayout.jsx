import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Dropdowntop from '@/Components/Dropdowntop';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showNav, setShowNav] = useState(false);

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
                        {/* <NavLink
                            href={route('posts.new')}
                            active={route().current('posts.new')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Numbers
                        </NavLink> */}
                        <NavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Dashboard
                        </NavLink>
                        {/* <NavLink
                            href={route('appliance')}
                            active={route().current('appliance')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Appliance
                        </NavLink>
                        <NavLink
                            href={route('students')}
                            active={route().current('students')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Students
                        </NavLink>
                        <NavLink
                            href={route('color')}
                            active={route().current('color')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Colors
                        </NavLink>
                        <NavLink
                            href={route('posts.index')}
                            active={route().current('posts.index')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Posts
                        </NavLink> */}
                        <NavLink
                            href={route('attendance')}
                            active={route().current('attendance')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Attendance
                        </NavLink>
                        <NavLink
                            href={route('enroll')}
                            active={route().current('enroll')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Enroll
                        </NavLink>
                        <NavLink
                            href={route('schedule2')}
                            active={route().current('schedule2')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Schedule
                        </NavLink>
                        
                        <NavLink
                            href={route('classroom')}
                            active={route().current('classroom')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Classroom
                        </NavLink>
                        <NavLink
                            href={route('subject')}
                            active={route().current('subject')}
                            className="px-4 py-2 rounded hover:bg-black hover:text-white"
                        >
                            Subject
                        </NavLink>
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
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                    {children}
                </main>
            </div>
        </div>
    );
}
