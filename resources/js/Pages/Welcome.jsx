import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Attendance Web Portal" />
            <div className="relative h-screen h-[100svh] overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                <header className="absolute inset-x-0 top-0 z-20 border-b border-white/30 bg-white/35 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/35">
                    <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-8">
                        <Link href="/" className="flex min-w-0 shrink items-center gap-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:gap-3">
                            <ApplicationLogo className="h-8 w-auto shrink-0 fill-current text-blue-700 sm:h-9" />
                            <span className="truncate text-sm font-bold text-slate-900 sm:text-lg">Attendance Web Portal</span>
                        </Link>

                        <nav aria-label="Account navigation" className="flex shrink-0 items-center gap-1 sm:gap-3">
                            <ThemeToggle />
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex min-h-10 items-center rounded-md bg-blue-700 px-2.5 text-xs font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:px-4 sm:text-sm"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex min-h-10 items-center rounded-md px-2 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white sm:px-4 sm:text-sm"
                                    >
                                        Log in
                                    </Link>
                                    {/* <Link
                                        href={route('register')}
                                        className="inline-flex min-h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                    >
                                        Register
                                    </Link> */}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="h-full">
                    <section
                        className="relative flex h-full w-full items-end justify-center overflow-hidden bg-slate-900"
                        aria-label="National Teachers College campus"
                    >
                        <img
                            src="/storage/images/NTC.jpeg"
                            alt="National Teachers College campus in Manila"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/10" aria-hidden="true" />
                        <div className="relative mx-auto w-full max-w-screen-2xl px-5 pb-6 sm:px-8 sm:pb-10">
                            <p className="text-xs font-bold uppercase text-white/90">Campus operations</p>
                            <h1 className="mt-2 max-w-3xl text-2xl font-bold leading-tight text-white sm:mt-3 sm:text-4xl">
                                Attendance Web Portal
                            </h1>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
