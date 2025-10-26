'use client'

export default function notFound() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
      <main className="grid h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center border-2 border-foreground p-20 rounded-2xl">
          <p className="text-base font-semibold text-foreground">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/dashboard"
              className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-foreground hover:text-background border border-foreground duration-200 shadow-xs hover:bg-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Go back home
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
