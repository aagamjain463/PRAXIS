export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-2xl text-center">
          <p className="mb-6 inline-block rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-600 uppercase dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            Knowledge-to-Action platform
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Praxis
          </h1>
          <p className="mt-4 text-xl font-medium text-zinc-800 sm:text-2xl dark:text-zinc-100">
            Turn what you learn into what you do.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-400">
            Capture what matters. Turn useful knowledge into meaningful action.
          </p>
        </div>
      </main>
      <footer className="px-6 pb-8 text-center text-sm text-zinc-500 dark:text-zinc-500">
        Praxis foundation — more to come.
      </footer>
    </div>
  );
}
