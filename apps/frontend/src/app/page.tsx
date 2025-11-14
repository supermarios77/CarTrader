export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            🚗 CarTrader
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A production-ready automotive marketplace platform
          </p>
          <div className="mt-8 flex flex-col gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <p>✅ Next.js Frontend (Port 3000)</p>
            <p>✅ NestJS Backend (Port 3001)</p>
            <p>✅ Monorepo with pnpm workspaces</p>
          </div>
        </div>
      </main>
    </div>
  );
}
