'use client'
import Link from "next/link";
import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { Bars2Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export default function Header() {
    const [open, setOpen] = useState(false)
        const [currentTime, setCurrentTime] = useState<Date>(new Date());
        
          useEffect(() => {
            const timer = setInterval(() => {
              setCurrentTime(new Date());
            }, 1000);
        
            return () => clearInterval(timer);
          }, []);
    
        const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('sk-SK', {
          timeZone: 'Europe/Bratislava',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      };
    
      const formatDate = (date: Date): string => {
        return date.toLocaleDateString('sk-SK', {
          timeZone: 'Europe/Bratislava',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

    return(
    <div>
        <header className="bg-foreground top-0 relative">
        <div className="text-start text-background p-5 hover:shadow-2xl duration-300">
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
                        <DialogTitle className="font-semibold text-2xl flex gap-4 text-foreground">
                          <img src="favicon.ico" className="size-12 hover:-rotate-10 duration-300 shadow-black"/>
                          <span className="font-work-sans pt-2.5">WEBHUB</span>
                        </DialogTitle>
                      </div>
                      <div className="relative mt-6 text-2xl flex flex-col flex-1 gap-y-15 px-4 sm:px-6">
                        <ul>
                          <h3 className="text-4xl">Services</h3>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/resources/vercel">Vercel</Link>
                          </li>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/resources/supabase">Supabase</Link>
                          </li>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/resources/github">Github</Link>
                          </li>
                          <h3 className="text-4xl">Widgets</h3>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/dashboard/widgets/weather">Weather</Link>
                          </li>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/dashboard/widgets/project-tracker">Project Tracker</Link>
                          </li>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/dashboard/widgets/todo">To-Do</Link>
                          </li>
                          <h3 className="text-4xl">Personal</h3>
                          <li className="pl-5 hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/dashboard/widgets/journal">Journal</Link>
                          </li>
                          <div className="relative pt-10">
                          <li className="hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/dashboard/account">Settings</Link>
                          </li>
                          <li className="hover:translate-x-2 hover:bg-blue-500/30 rounded-lg duration-300">
                            <Link href="/dashboard">Return back</Link>
                          </li>
                          </div>
                        </ul>
                        <div className="text-center w-80 bottom-10 left-5 absolute backdrop-blur-md rounded-3xl shadow-background border-foreground border">
                         <div className="mb-4">
                          <h1 className="text-2xl font-mono font-bold text-foreground tracking-wider">
                            {formatTime(currentTime)}
                          </h1>
                          <p className="text-xl text-foreground font-light">
                            {formatDate(currentTime)}
                          </p>
                          </div>
                        </div>
                        <div className="pl-35 top-20 relative ">
                          <AnimatedThemeToggler className="hover:text-black duration-300 cursor-pointer" />
                        </div>
                        <span className="text-sm absolute -bottom-5 pl-25">Version:1.2.6</span>
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