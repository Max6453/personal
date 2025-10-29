'use client'
import { useState, useEffect } from "react";
import { Bars2Icon, XMarkIcon } from '@heroicons/react/24/outline'

const posts = [
  {
    id: 1,
    title: 'Boost your conversion rate',
    href: '#',
    description:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    date: 'Mar 16, 2020',
    datetime: '2020-03-16',
    category: { title: 'Marketing', href: '#' },
    author: {
      name: 'Michael Foster',
      role: 'Co-Founder / CTO',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
]


export default function blog() {
    const [open, setOpen] = useState(false)
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [isFixed, setIsFixed] = useState(false);
    const [theme, setTheme] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
        const scrollPosition = window.scrollY || window.pageYOffset;
        console.log('Scroll position:', scrollPosition); // Debug log
        
        if (scrollPosition > 50) {
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
    return(
        <div>
         <header className={`bg-foreground top-0 ${isFixed ? 'fixed left-0 right-0' : 'relative'} w-full z-50 transition-all duration-300`}>
          <div className="text-start text-background p-5 font-work-sans transition-all duration-300">
            <h1 className={`transition-all duration-300 ${isFixed ? 'text-center text-6xl' : 'text-6xl'}`}>
              Webhub blog
            </h1>
            <h3 className={`text-4xl transition-all duration-300 ${isFixed ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-20'}`}>
              Latest news around webhub
            </h3>
          </div>
         </header>

        <div className="bg-gray-900 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 className="text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">Latest News</h2>
                <p className="mt-2 text-lg/8 text-gray-300">Latest news and updates from Webhub</p>
                </div>
                <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-gray-700 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <div className="w-sm h-80 bg-background rounded-2xl">
                        <img
                        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
                        className="overflow-hidden object-cover absolute w-sm h-60 rounded-2xl hover:scale-110 duration-300"/>
                        <div className="flex flex-col backdrop-blur-md p-2 bg-black/20 relative top-56 rounded-b-2xl">
                            <span>Welcome to Webhub!</span>
                            <span>learn about webhub, what it is capable of and make it your #1 tool for your everyday use.</span>
                            <span>October 29th, 2025</span>
                        </div>
                    </div>
                    <div className="w-sm h-80 bg-amber-400 rounded-2xl">
                        <img
                        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
                        className="overflow-hidden object-cover absolute w-sm h-60 rounded-2xl"/>
                        <div className="flex flex-col backdrop-blur-3xl p-2 bg-black/20 relative top-56 rounded-b-2xl">
                            <span>Welcome to Webhub!</span>
                            <span>learn about webhub, what it is capable of and make it your #1 tool for your everyday use.</span>
                            <span>October 29th, 2025</span>
                        </div>
                    </div>
                   <div className="w-sm h-80 bg-amber-400 rounded-2xl">
                        <img
                        src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070"
                        className="overflow-hidden object-cover absolute w-sm h-60 rounded-2xl"/>
                        <div className="flex flex-col backdrop-blur-3xl p-2 bg-black/20 relative top-56 rounded-b-2xl">
                            <span>Welcome to Webhub!</span>
                            <span>learn about webhub, what it is capable of and make it your #1 tool for your everyday use.</span>
                            <span>October 29th, 2025</span>
                        </div>
                    </div>
                    <div className="w-sm h-60 bg-amber-400 rounded-2xl">
                        <div className="flex flex-col backdrop-blur-3xl bg-black/20 relative top-36 rounded-b-2xl">
                            <span>Welcome to Webhub!</span>
                            <span>learn about webhub, what it is capable of and make it your #1 tool for your everyday use.</span>
                            <span>October 29th, 2025</span>
                        </div>
                    </div>
                    <div className="w-sm h-60 bg-amber-400 rounded-2xl">
                        <div className="flex flex-col backdrop-blur-3xl bg-black/20 relative top-36 rounded-b-2xl">
                            <span>Welcome to Webhub!</span>
                            <span>learn about webhub, what it is capable of and make it your #1 tool for your everyday use.</span>
                            <span>October 29th, 2025</span>
                        </div>
                    </div>
                    <div className="w-sm h-60 bg-amber-400 rounded-2xl">
                        <div className="flex flex-col backdrop-blur-3xl bg-black/20 relative top-36 rounded-b-2xl">
                            <span>Welcome to Webhub!</span>
                            <span>learn about webhub, what it is capable of and make it your #1 tool for your everyday use.</span>
                            <span>October 29th, 2025</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}