import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Attendance Web Portal" />
            <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto flex min-h-[76px] max-w-screen-2xl items-center justify-between gap-4 px-5 sm:px-8">
                        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                            <ApplicationLogo className="h-9 w-auto fill-current text-blue-700" />
                            <span className="text-lg font-bold text-slate-900">Attendance Web Portal</span>
                        </Link>

                        <nav aria-label="Account navigation" className="flex items-center gap-2 sm:gap-3">
                            <ThemeToggle />
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex min-h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white sm:px-4"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex min-h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-screen-2xl px-5 py-10 sm:px-8 sm:py-14">
                    <section className="border-b border-slate-300 pb-10 dark:border-slate-700 sm:pb-14">
                        <p className="dark:text-white text-xs font-bold uppercase text-blue-800">Campus operations</p>
                        <div className="mt-4 max-w-4xl">
                            <div>
                                <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-950 dark:text-white sm:text-4xl">
                                    Attendance Web Portal
                                </h1>
                                {/* <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                                    Sign in to continue to your campus workspace.
                                </p> */}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
