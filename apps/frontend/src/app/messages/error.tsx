'use client';

export default function MessagesError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Unable to load messages</h2>
          <p className="text-muted-foreground mb-6">
            There was a problem loading your conversations. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}


