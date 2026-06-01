import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface relative z-10 px-margin-mobile">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-lg text-center space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary">domain</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">BizGrowth</span>
        </Link>
        <div className="space-y-2">
          <h1 className="font-headline-xl text-headline-xl text-primary">Create Account</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Register your enterprise node to join the global business network.
          </p>
        </div>
        <div className="p-4 bg-surface-container rounded-xl text-left border border-outline-variant/10 text-on-surface-variant text-body-sm space-y-2">
          <span className="font-semibold text-primary block">Registration Shell Verified!</span>
          This is the Phase 1 placeholder representing the unified authentication card. In Phase 2, this will display the comprehensive split-screen layout, 3D animated globe graphic, floating keyframes, and tabbed forms.
        </div>
        <div className="flex flex-col gap-3">
          <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-primary/95 transition-all shadow-sm">
            Create Account (Placeholder)
          </button>
          <div className="font-body-sm text-body-sm text-outline">
            Already have an enterprise account?{' '}
            <Link to="/login" className="text-secondary font-bold hover:underline">
              Login here
            </Link>
          </div>
        </div>
        <div className="pt-2 border-t border-outline-variant/20">
          <Link to="/" className="font-label-md text-label-md text-secondary hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Return to Main Portal
          </Link>
        </div>
      </div>
    </div>
  )
}
