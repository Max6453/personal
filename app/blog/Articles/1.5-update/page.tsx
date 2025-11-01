import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
export default function updateArticle() {
    return(
        <div className="bg-gray-900 text-foreground font-roboto">
           <header className="p-10">
            <div className="w-40 h-5">
            <Link href="/blog" className="flex flex-row-reverse gap-2 right-8 relative hover:text-blue-400 duration-200">
            Back to blog
            <ArrowLeftIcon className="size-6 "/>
            </Link>
            </div>
            <div className="flex flex-col gap-1 p-2">
                <span>posted by: Maxim harvančík</span>
                <span>Date: 01/11/2025</span>
            </div>
           </header>

           <section>
            <h1 className="text-7xl font-work-sans p-10">Update 1.5</h1>

            <p className="text-lg w-300 p-12">
                We revealed our newest 1.5 update for webhub.
                Here is a list of new features and improvements:
            </p>
            <p className="text-lg w-300 p-12">
              Modified sidebar with dropdowns for better navigating and also already listed our newest service - WH1.
              A cloud storage for your data.
            </p>
            <p className="text-lg w-300 p-12">
                Severe modifications across blog such as new articles, little changes in color pallete and various modifications and improvements.
            </p>
            <p className="text-lg w-300 p-12">
                Thank you for your support and we can't be more exiting for 1.6 update.
            </p>
           </section>
        </div>
    )
}