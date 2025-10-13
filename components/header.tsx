'use client'
import Link from "next/link";
import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { Bars2Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function Header() {
    const [open, setOpen] = useState(false)
    return(
    <div>
        <header className="bg-foreground top-0 relative">
        <div className="text-start text-background p-5">
          <h1 className="text-6xl">Webhub</h1>
          <h3 className="text-4xl">Modern dashboard for developers</h3>
        </div>
        <button
            onClick={() => setOpen(true)}
            className="absolute top-20 right-20 rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20"
          >
            <Bars2Icon className="size-8"/>
          </button>
      </header>
      <div>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/50 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
        />
        <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                  <DialogPanel
                    transition
                    className="pointer-events-auto relative w-screen max-w-sm transform transition duration-500 ease-in-out data-closed:-translate-x-full sm:duration-700">
                    <TransitionChild>
                      <div className="absolute top-0 right-0 -ml-8 flex pt-4 pr-2 duration-500 ease-in-out data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative right-0 z-50 rounded-md text-gray-400 hover:text-red-500 hover:rotate-90 duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                      </div>
                    </TransitionChild>
                    <div className="relative flex h-full flex-col overflow-y-auto bg-background text-foreground border-r-4 border-foreground py-6 shadow-xl after:absolute after:inset-y-0 after:left-0 after:w-px after:bg-white/10">
                      <div className="px-2 sm:px-6">
                        <DialogTitle className="font-semibold text-2xl text-foreground">Webhub</DialogTitle>
                      </div>
                      <div className="relative mt-6 text-2xl flex flex-col flex-1 gap-y-15 px-4 sm:px-6">
                        <ul>
                          <h3 className="text-4xl">Useful widgets</h3>
                          <li className="pl-5">
                            <Link href="/Widgets">Weather</Link>
                          </li>
                          <li className="pl-5">
                            <Link href="/Widgets">Notes</Link>
                          </li>
                          <li className="pl-5">
                            <Link href="/Widgets">To-Do</Link>
                          </li>
                          <h3 className="text-4xl">Services</h3>
                          <li className="pl-5">
                            <Link href="/resources/vercel">Vercel</Link>
                          </li>
                          <li className="pl-5">
                            <Link href="/resources/supabase">Supabase</Link>
                          </li>
                          <li className="pl-5">
                            <Link href="/resources/github">Github</Link>
                          </li>
                          <li>
                            <Link href="/dashboard/account">Settings</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </DialogPanel>
                </div>
              </div>
            </div>
          </Dialog>
        </div>
    </div>
    )
}