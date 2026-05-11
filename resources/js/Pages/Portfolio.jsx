import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Portfolio({ auth, laravelVersion, phpVersion }) {
    const [currentJob, setCurrentJob] = useState(0);

    const jobs = [
        {
            position: 'Junior IT Developer',
            company: 'Z Connect Inc.',
            duration: '2023 - Present',
            description: 'Leading development of enterprise web applications using <strong>Mendix</strong> low-code platform, integrating PHP backends and React frontends for scalable solutions.',
            techStack: ['PHP', 'Laravel', 'React', 'JavaScript', 'MySQL', 'Tailwind CSS']
        },
        {
            position: 'Full-Stack Engineer',
            company: 'StartupXYZ',
            duration: '2021 - 2023',
            description: 'Built responsive web apps using Laravel for APIs and React for dynamic UIs, integrating jQuery for legacy features.',
            techStack: ['PHP', 'Laravel', 'React', 'jQuery', 'JavaScript', 'Inertia.js']
        },
        {
            position: 'Backend Developer',
            company: 'DataSolutions Ltd.',
            duration: '2019 - 2021',
            description: 'Developed RESTful APIs and database systems with PHP, optimized performance and security.',
            techStack: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'API Development']
        },
        {
            position: 'Frontend Developer',
            company: 'WebAgency Pro',
            duration: '2017 - 2019',
            description: 'Created interactive user interfaces with React and jQuery, ensuring cross-browser compatibility.',
            techStack: ['JavaScript', 'React', 'jQuery', 'HTML', 'CSS', 'PHP']
        }
    ];

    const nextJob = () => setCurrentJob((prev) => (prev + 1) % jobs.length);
    const prevJob = () => setCurrentJob((prev) => (prev - 1 + jobs.length) % jobs.length);

    return (
        <>
            <Head title="Software Engineer Portfolio" />
            <div className="bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
                <div className="relative min-h-screen px-6 py-10">
                    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur sm:p-10">
                        <header className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 ring-1 ring-cyan-500/20">
                                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                                    Full-Stack Engineer | PHP · JavaScript · React · jQuery
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Portfolio profile</p>
                                    <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                        Allan Tinambacan Jr.
                                    </h1>
                                    <p className="text-lg font-medium text-cyan-300">Senior Full-Stack Developer</p>
                                    <p className="max-w-2xl text-slate-300 sm:text-lg">
                                        I design backend services in PHP, develop dynamic frontend apps with React, and integrate jQuery-powered enhancements for legacy compatibility and rapid feature delivery.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/20">
                                        <span className="text-2xl">💡</span>
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Highlight</p>
                                        <p className="mt-1 text-lg font-semibold text-white">Full-stack delivery for web products</p>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-4 text-slate-300">
                                    <div>
                                        <h2 className="text-sm uppercase tracking-[0.35em] text-slate-500">Core strengths</h2>
                                        <ul className="mt-3 space-y-2 text-sm sm:text-base">
                                            <li>• PHP backend design with Laravel and MySQL</li>
                                            <li>• React-driven UI architecture and component design</li>
                                            <li>• Vanilla JS and jQuery for progressive enhancement</li>
                                            <li>• API integration, authentication, and responsive UI delivery</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h2 className="text-sm uppercase tracking-[0.35em] text-slate-500">Approach</h2>
                                        <p className="mt-2 text-sm sm:text-base text-slate-300">
                                            I focus on clean, maintainable code, fast page interactions, and applications that bridge modern React tooling with real-world PHP workflows.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:gap-8">
                            <section className="space-y-8 rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-white">Featured experience</h2>
                                    <p className="text-slate-300">
                                        Delivering web applications from backend systems to polished front-end experiences, with expertise across PHP, Node-style JavaScript, React, and jQuery.
                                    </p>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-800">
                                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Backend</p>
                                        <h3 className="mt-3 text-xl font-semibold text-white">PHP & Laravel</h3>
                                        <p className="mt-3 text-slate-300 text-sm sm:text-base">
                                            Building RESTful APIs, database models, and authentication flows for web applications that scale.
                                        </p>
                                    </div>
                                    <div className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-800">
                                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Frontend</p>
                                        <h3 className="mt-3 text-xl font-semibold text-white">React & jQuery</h3>
                                        <p className="mt-3 text-slate-300 text-sm sm:text-base">
                                            Creating interactive React interfaces while preserving smooth jQuery integrations for existing product features.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-800">
                                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Selected projects</p>
                                    <ul className="mt-4 space-y-3 text-sm sm:text-base text-slate-300">
                                        <li>• Dashboard web app with Laravel API, Inertia.js, and React components</li>
                                        <li>• Legacy feature upgrade using jQuery widgets and modern JS patterns</li>
                                        <li>• E-commerce checkout flows built for performance and accessibility</li>
                                        <li>• Real-time schedule management tools with client-side state and backend sync</li>
                                    </ul>
                                </div>

                                {/* Job Experience Carousel */}
                                <div className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-slate-800">
                                    <h2 className="text-xl font-semibold text-white mb-4">Professional Experience</h2>
                                    <div className="relative">
                                        <div className="overflow-hidden">
                                            <div className="transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentJob * 100}%)` }}>
                                                {jobs.map((job, index) => (
                                                    <div key={index} className="w-full flex-shrink-0">
                                                        <div className="space-y-3">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-white">{job.position}</h3>
                                                                <p className="text-cyan-300">{job.company} · {job.duration}</p>
                                                            </div>
                                                            <p className="text-slate-300 text-sm sm:text-base">{job.description}</p>
                                                            <div>
                                                                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Tech Stack</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {job.techStack.map((tech, i) => (
                                                                        <span key={i} className="rounded-2xl bg-slate-800 px-3 py-1 text-xs text-slate-200">
                                                                            {tech}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-6">
                                            <button
                                                onClick={prevJob}
                                                className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            >
                                                ‹
                                            </button>
                                            <div className="flex space-x-2">
                                                {jobs.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentJob(index)}
                                                        className={`w-2 h-2 rounded-full transition-colors ${
                                                            index === currentJob ? 'bg-cyan-400' : 'bg-slate-600'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                onClick={nextJob}
                                                className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            >
                                                ›
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-8 shadow-xl shadow-slate-950/20">
                                <div className="space-y-3">
                                    <h2 className="text-xl font-semibold text-white">Professional summary</h2>
                                    <p className="text-slate-300 text-sm sm:text-base">
                                        Software engineer experienced in architecting full-stack solutions with PHP and JavaScript. I deliver modern applications that are maintainable, performant, and user-friendly.
                                    </p>
                                </div>

                                <div className="space-y-4 rounded-3xl bg-slate-900/80 p-5 ring-1 ring-slate-800">
                                    <h3 className="text-sm uppercase tracking-[0.35em] text-slate-500">Technical stack</h3>
                                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">PHP</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">Laravel</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">MySQL</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">JavaScript</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">React</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">jQuery</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">Inertia.js</span>
                                        <span className="rounded-2xl bg-slate-800 px-3 py-2 text-slate-200">Tailwind CSS</span>
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-slate-900/80 p-5 ring-1 ring-slate-800">
                                    <h3 className="text-sm uppercase tracking-[0.35em] text-slate-500">Contact</h3>
                                    <p className="mt-3 text-sm text-slate-300">
                                        Seeking opportunities to build scalable web products with clean architecture, strong frontend interaction, and reliable backend systems.
                                    </p>
                                    <div className="mt-4 space-y-2 text-sm text-slate-200">
                                        <p>Email: <span className="text-cyan-300">allantinambacanjr@gmail.com</span></p>
                                        <p>Location: Remote / Philippines</p>
                                    </div>
                                </div>
                            </aside>
                        </main>

                        <footer className="mt-12 text-center text-sm text-slate-500">
                            Laravel v{laravelVersion} · PHP v{phpVersion} · Built with React and Tailwind CSS
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}