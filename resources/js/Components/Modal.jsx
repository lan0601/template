import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '7xl': 'sm:max-w-7xl',
    }[maxWidth]

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6 sm:px-0"
                onClose={() => closeable && onClose()}
            >
                {/* Overlay */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75" />
                </TransitionChild>

                {/* Modal panel */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel
                        className={`z-50 w-full transform overflow-hidden rounded-lg bg-white shadow-xl transition-all ${maxWidthClass}`}
                    >
                        {children}
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    )
}