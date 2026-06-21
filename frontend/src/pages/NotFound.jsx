import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface px-margin-mobile text-center space-y-6">
      <div className="max-w-md bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 shadow-lg space-y-6">
        <div className="flex justify-center text-secondary">
          <span className="material-symbols-outlined text-[72px] animate-bounce">
            error
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="font-headline-xl text-headline-xl text-primary font-bold">404</h1>
          <h2 className="font-headline-md text-headline-md text-primary font-semibold">Page Not Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The strategic business resource or route you are looking for does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full font-bold shadow-md hover:bg-primary/95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
