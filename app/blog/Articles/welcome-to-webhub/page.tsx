import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function welcomeArticle() {
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
                <span>Date: 29/10/2025</span>
            </div>
           </header>

           <section>
            <h1 className="text-7xl font-work-sans p-10">Welcome to webhub</h1>

            <p className="text-lg w-300 p-12">
                We sincerely welcome you at our sanctuary for web developers.
                This web app provides you many features which are valuable for every developer who wants to have an order in his work.
            </p>

            <p className="text-lg w-300 p-12">
              Webhub is service like no other.
              You can expect from us a vercel dashboard. If you have deployed websites trough vercel, you can view them in our comprehensive dashboard.
              Issues and pull requests can be viewed faster than before by 2 clicks, you can analyse latest issue, find solution or view latest pull request across different repos.
              A table need your attention but you are unavailable to check it ASAP? then you can count on our dashboard to view you issue.
            </p>
            <p className="text-lg w-300 p-12">
                Another great tools we provide are project tracker, notes or to-do list. Why switch between applications or websites when you can have it in one place.
            </p>
            <p className="text-lg w-300 p-12">
                As of beggining of november, we provide only three services. But we are extending it to an 'aws S3' clone.
                it is still in development phase but if everything will go as planned, we can push it in the beggining of the first november week.
            </p>
            <p className="text-lg w-300 p-12">
                We appreciate you support and we would also appreciate if you would write a short feedback what to improve.
            </p>
           </section>
        </div>
    )
}