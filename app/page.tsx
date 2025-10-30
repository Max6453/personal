'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { CloudArrowUpIcon, ComputerDesktopIcon , CheckIcon } from '@heroicons/react/20/solid'

const navigation = [
  { name: 'Docs', href: '/notes' },
  { name: 'Getting started', href: '#' },
  { name: 'Pricing', href: '#' },
  { name: 'Contact', href: '#' },
]

const features = [
  {
    name: 'Real time insights',
    description:
      'See what’s happening across your stack in real time — deployments, logs, performance stats, and usage metrics all in one clean view.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Instant Integrations',
    description: 'Connect your favorite services in seconds. WebHub automatically syncs data from GitHub, Supabase, Vercel, and more with just a few clicks.',
    icon: CheckIcon,
  },
  {
    name: 'Centralized dashboard.',
    description: 'Bring GitHub, Supabase, and Vercel together in one clean interface. No more switching tabs — manage your entire dev workflow from a single hub.',
    icon: ComputerDesktopIcon,
  },
]

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
<div className="bg-gray-900">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="favicon.ico"
                className="h-12 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white hover:scale-120 duration-300 hover:bg-foreground p-0.5 rounded-xs">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="/dashboard" target='_blank' className="text-sm/6 font-semibold text-white hover:text-foreground duration-300">
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
                    href="/dashboard"
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

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight font-quantico text-balance text-white sm:text-7xl">
              Webhub
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty font-work-sans text-gray-400 sm:text-xl/8">
              Dashboard from developers to developers
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/auth/signup"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Get started
              </a>
              <a href="/docs" className="text-sm/6 font-semibold text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
        </div>
      </div>

      <div className="overflow-hidden bg-gray-800 py-24 sm:py-32 font-roboto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <p className="mt-2 text-4xl font-semibold font-work-sans tracking-tight text-pretty text-white sm:text-5xl">
                All-in-one service
              </p>
              <p className="mt-6 text-lg/8 text-gray-300">
                Frustrating to switch between multiple services to see your deployment on vercel or github?
                Now you have all in one sophisticated dashboard for multiple services
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-400 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-indigo-400" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src="/landingPage.png"
            width={2432}
            height={1442}
            className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>

    <div className="relative isolate overflow-hidden font-roboto bg-gray-900 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl justify-items-center gap-x-8 gap-y-16 lg:max-w-none">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-6xl text-center font-work-sans font-semibold tracking-tight text-white">Pricing</h2>
            <p className="mt-10 text-5xl text-center text-gray-300">
              0€
            </p>
            <p className='mt-5 text-white text-md'>
              You pay nothing and you can use our app free with full functions
            </p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
      </div>
    </div>

    <section className="bg-gray-800 py-20 text-center">
        <div className='grid lg:grid-cols-3 gap-y-5 max-sm:grid-cols-2 sm:grid-cols-2 text-xl text-white'>
          <div>
            <h3 className='font-work-sans font-bold'>Product</h3>
            <ul className='pt-2'>
              <li className='hover:translate-x-1 duration-200'>Docs</li>
              <li className='hover:translate-x-1 duration-200'>Features</li>
              <li className='hover:translate-x-1 duration-200'>Pricing</li>
            </ul>
          </div>
          <div>
            <h3 className='font-work-sans font-bold'>Company</h3>
            <ul className='pt-2'>
              <li className='hover:translate-x-1 duration-200'>About</li>
              <li className='hover:translate-x-1 duration-200'>Carrers</li>
              <li className='hover:translate-x-1 duration-200'>blog</li>
            </ul>
          </div>
          <div>
            <h3 className='font-work-sans font-bold'>Legal</h3>
            <ul className='pt-2'>
              <li className='hover:translate-x-1 duration-200'>Support</li>
              <li className='hover:translate-x-1 duration-200'>Terms of use</li>
              <li className='hover:translate-x-1 duration-200'>Privacy policy</li>
            </ul>
          </div>
        </div>
    </section>

      {/* Footer */}
      <footer className="py-2 bg-gray-800 text-center text-neutral-400 text-sm">
        © {new Date().getFullYear()} WebHub. All rights reserved.
      </footer>
    </div>
  )
}
