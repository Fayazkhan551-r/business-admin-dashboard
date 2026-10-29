import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 font-display text-base font-bold text-slate-950 shadow-lg">
        PP
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">
        404 — Court or View Not Found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        The requested PakPadel Club Manager page could not be located. Return to the main dashboard workspace to manage courts and bookings.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 transition-colors hover:bg-emerald-400"
      >
        Return to Club Dashboard
      </Link>
    </div>
  );
}
