'use client'
import Link from "next/link";
import { useState, useEffect } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react'
import { Bars2Icon, XMarkIcon, ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { ChevronRight } from 'lucide-react';


export default function Header() {
    const [open, setOpen] = useState(false)
    const [openAnalytics, setOpenAnalytics] = useState(false);
    const [openStorage, setOpenStorage] = useState(false);
    const [openTools, setOpenTools] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [isFixed, setIsFixed] = useState(false);
    const [theme, setTheme] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY || window.pageYOffset;
        
        if (scrollPosition > 10 
        ) {
          setIsFixed(true);
        } else {
          setIsFixed(false);
        }
      };
      // Check initial scroll position
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    if (!theme) return;
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return null; // or return a loading skeleton
  }

    return(
    <div>
        <header className={`bg-foreground top-0 ${isFixed ? 'fixed left-0 right-0' : 'relative'} w-full z-50 transition-all duration-300`}>
          <div className="text-start text-background p-5 font-work-sans transition-all duration-300">
            <h1 className={`transition-all duration-300 ${isFixed ? 'text-center text-6xl' : 'text-6xl'}`}>
              Webhub
            </h1>
            <h3 className={`text-4xl transition-all duration-300 ${isFixed ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-20'}`}>
              Modern dashboard for developers
            </h3>
          </div>
          <button
            onClick={() => setOpen(true)}
            className={`absolute rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-white/20 transition-all duration-300 ${isFixed ? 'top-10 right-20' : 'top-20 right-20'}`}
          >
            <Bars2Icon className="size-8"/>
          </button>
        </header>
      <div>
      <Dialog open={open} onClose={setOpen} className="relative z-50 font-roboto">
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
                          <Link href="/dashboard">
                          <img src="/favicon.ico" className="size-12 hover:-rotate-10 duration-300 shadow-black"/>
                          </Link>
                          <span className="font-work-sans pt-2.5">WEBHUB</span>
                        </DialogTitle>
                      </div>
                      <div className="relative mt-6 text-2xl flex flex-col flex-1 gap-y-15 px-4 sm:px-6">
                        <ul>
                          {/* 1st */}
                          <li>
                            <div className="pb-2">
                              <ul className="spacing-y-3">
                                <div className="mx-auto">
                                  {/* Dropdown Header */}
                                  <button
                                    onClick={() => setOpenAnalytics(!openAnalytics)}
                                    className="w-full flex items-center justify-between transition-colors rounded-lg"
                                  >
                                    <span className="text-foreground text-4xl">Analytics</span>
                                    
                                    {/* Rotating Arrow Icon */}
                                    <ArrowRightIcon 
                                      className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                                        openAnalytics ? 'rotate-90' : 'rotate-0'
                                      }`}
                                    />
                                  </button>
                                  {/* Dropdown Content */}
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                      openAnalytics ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="border-gray-200">
                                      <ul className="flex flex-col gap-2 pt-2 pb-2">
                                        <Link href="/dashboard/resources/vercel" target="_blank">
                                        <li className="px-4 hover:bg-blue-500/30 rounded cursor-pointer transition-colors">
                                          Vercel 
                                        </li>
                                        </Link>
                                        <Link href="/dashboard/resources/supabase" target="_blank">
                                        <li className="px-4 hover:bg-blue-500/30 rounded cursor-pointer transition-colors">
                                          Supabase
                                        </li>
                                        </Link>
                                        <Link href="/dashboard/resources/github" target="_blank">
                                        <li className="px-4 hover:bg-blue-500/30 rounded cursor-pointer transition-colors">
                                          Github
                                        </li>
                                        </Link>
                                        <Link href="/dashboard/resources/firebase" target="_blank">
                                        <li className="px-4 hover:bg-blue-500/30 rounded cursor-pointer transition-colors">
                                          Firebase
                                        </li>
                                        </Link>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </ul>
                            </div>
                          </li>
                          {/* 2nd */}
                          <li>
                            <div className="pb-2">
                              <ul className="spacing-y-3">
                                <div className="mx-auto">
                                  {/* Dropdown Header */}
                                  <button
                                    onClick={() => setOpenStorage(!openStorage)}
                                    className="w-full flex items-center justify-between transition-colors rounded-lg"
                                  >
                                    <span className="text-foreground text-4xl">Storage</span>
                                    
                                    {/* Rotating Arrow Icon */}
                                    <ArrowRightIcon 
                                      className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                                        openStorage ? 'rotate-90' : 'rotate-0'
                                      }`}
                                    />
                                  </button>
                                  {/* Dropdown Content */}
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                      openStorage ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="border-gray-200">
                                      <ul className="flex flex-col gap-2 pt-2 pb-2">
                                        <Link href="/dashboard/storage/wh1" target="_blank">
                                        <li className="px-4 hover:bg-blue-700/30 duration-300 rounded-4xl cursor-pointer transition-colors">
                                          WH1
                                        </li>
                                        </Link>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </ul>
                            </div>
                          </li>
                          {/* 3rd */}
                          <li>
                            <div className="pb-2">
                              <ul className="spacing-y-3">
                                <div className="mx-auto">
                                  {/* Dropdown Header */}
                                  <button
                                    onClick={() => setOpenTools(!openTools)}
                                    className="w-full flex items-center justify-between transition-colors rounded-lg"
                                  >
                                    <span className="text-foreground text-4xl">Tools</span>
                                    
                                    {/* Rotating Arrow Icon */}
                                    <ArrowRightIcon 
                                      className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                                        openTools ? 'rotate-90' : 'rotate-0'
                                      }`}
                                    />
                                  </button>
                                  {/* Dropdown Content */}
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                      openTools ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    <div className="border-gray-200">
                                      <ul className="flex flex-col gap-2 pt-2 pb-2">
                                        <Link href="/dashboard/widgets/project-tracker" target="_blank">
                                        <li className="px-4 hover:bg-blue-700/30 duration-300 rounded-4xl cursor-pointer transition-colors">
                                          Project tracker
                                        </li>
                                        </Link>
                                        <Link href="/dashboard/widgets/notes" target="_blank">
                                        <li className="px-4 hover:bg-blue-700/30 duration-300 rounded-4xl cursor-pointer transition-colors">
                                          Notes
                                        </li>
                                        </Link>
                                        <Link href="/dashboard/widgets/todo" target="_blank">
                                        <li className="px-4 hover:bg-blue-700/30 duration-300 rounded-4xl cursor-pointer transition-colors">
                                          To-Do
                                        </li>
                                        </Link>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </ul>
                            </div>
                          </li>
                          <li className="flex flex-col gap-2">
                            <Link href="/dashboard/account" className="hover:bg-blue-700/30 duration-300 rounded-4xl">
                            <span>Account</span>
                            </Link>
                            <Link href="/dashboard/support" className="hover:bg-blue-700/30 duration-300 rounded-4xl">
                            <span>Support</span>
                            </Link>
                            <Link href="/blog" className="hover:bg-blue-700/30 duration-300 rounded-4xl">
                            <span>Blog</span>
                            </Link>
                          </li>
                        </ul>
                        <div>
                         <AnimatedThemeToggler className="hover:text-black duration-300 cursor-pointer absolute -bottom-5 right-5" />
                        </div>
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