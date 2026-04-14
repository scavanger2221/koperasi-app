export function LoadingSpinner({ message = 'Sedang memuat data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
      <p className="text-[12px] text-[var(--color-primary)] font-extrabold uppercase tracking-widest mt-6 bg-[var(--color-primary-light)] px-4 py-1.5 rounded-full border border-[var(--color-primary)]/10">
        {message}
      </p>
    </div>
  )
}
