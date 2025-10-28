'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Product', href: '/notes' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-foreground to-neutral-800 to-70% bg-linear-180 h-screen font-work-sans snap-start">
      <header className="absolute inset-x-0 top-0 z-50 snap-start">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="/auth/login" target='_blank' className="text-sm/6 font-semibold">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-200"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="/auth/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8 ">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 snap-start">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance font-work-sans text-white dark:text-text-main sm:text-7xl">
              WEBHUB
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
              A modern dashboard made by developer, for developers
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/auth/signup"
                className="rounded-md border border-gray-300 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-foreground duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Get started
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className=' h-screen pt-30 snap-start'>
        <div className='relative flex flex-col gap-5 p-5 text-lg text-gray-300 text-center top-18'>
        <p>
        Stop switching between countless tabs and dashboards. WebHub brings all your favorite developer tools together — GitHub, Vercel, Supabase, and more — into one unified, minimal workspace.
        </p>
        Whether you’re deploying projects, checking your repositories, or monitoring your databases, WebHub gives you a clear overview of your entire development ecosystem in real time.
        <p>
        Built for modern developers who value simplicity, performance, and focus — WebHub helps you manage your workflow without distractions.
        Connect your accounts once, and gain instant access to analytics, activity logs, and project insights — all from one clean interface.
        </p>
        <p>
        Your development life, finally in one place.
        </p>
        </div>
      </div>
      <div className='bg-neutral-800 to-foreground to-100% bg-linear-180 h-screen snap-start'>
        <div className='grid grid-cols-2 relative top-30 gap-5 pl-35'>
          <div className='border border-gray-400 rounded-2xl w-120'>
            <h1 className='text-3xl p-5'>Minimalistic</h1>
            <p className='p-5 blur-sm hover:blur-none duration-300'>Webhub's is clean, minimalistic and simple in design and working in it.</p>
          </div>
          <div className='border border-gray-400 rounded-2xl w-120'>
            <h1 className='text-3xl p-5'>Monitor</h1>
            <p className='p-5 blur-sm hover:blur-none duration-300'>You can monitor your deployments and web analytics trough our simple dashboard</p>
          </div>
          <div className='border border-gray-400 rounded-2xl w-120'>
            <h1 className='text-3xl p-5'>Connections</h1>
            <p className='p-5 blur-sm hover:blur-none duration-300'>If it's either supabase, vercel, github, or other service, We got you covered. </p>
          </div>
          <div className='border border-gray-400 rounded-2xl w-120'>
            <h1 className='text-3xl p-5'>EISD</h1>
            <p className='p-5 blur-sm hover:blur-none duration-300'>Everything.In.Simple.Dashboard</p>
          </div>
        </div>
      </div>

      <div className='h-screen bg-foreground snap-start'>
        <h3 className='text-3xl font-roboto font-bold p-5'>Contact</h3>
      </div>
    </div>
  )
}
