'use client';

export default function MessagesError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] pt-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-12 py-8">
        <div className="rounded-[20px] border border-[#e5e5e5] bg-white p-8 text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <h2 className="text-xl font-semibold mb-2 text-[#111]">Unable to load messages</h2>
          <p className="text-[#666] mb-6">
            There was a problem loading your conversations. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-[#111] text-white hover:bg-[#222] font-semibold transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}


