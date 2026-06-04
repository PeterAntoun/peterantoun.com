export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 py-10">
      <div className="container-px flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
        <p>
          © {year} Peter Antoun
        </p>
        <p className="flex items-center gap-1.5">
          Built by me with
          <span className="text-accent-cyan">Next.js</span>
          <span aria-hidden>·</span>
          <a
            href="#hero"
            className="transition-colors hover:text-white"
          >
            Back to top ↑
          </a>
        </p>
      </div>
    </footer>
  );
}
