export default function Resources() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-margin-mobile text-center">
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/10 text-primary border border-primary/10">
          <span className="material-symbols-outlined text-[20px]">library_books</span>
          <span className="font-label-md text-label-md uppercase tracking-wider">Executive Knowledge Base</span>
        </div>
        <h1 className="font-display-lg text-display-lg text-primary leading-tight">
          Knowledge Hub &amp; <span className="text-secondary">Contact Center</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Access specialized research reports, podcast recordings, interactive keynotes, or connect directly with our advisory specialists. This is the temporary placeholder for Resources.
        </p>
        <div className="pt-4">
          <div className="inline-flex bg-surface-container-low border border-outline-variant/35 rounded-xl p-4 gap-3 text-left">
            <span className="material-symbols-outlined text-secondary">info</span>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              <strong className="text-primary block">Phase 1 Route Verified Successfully!</strong>
              Ready to construct the featured bento insight banner, content player tiles, stateful FAQ expanders, and floating contact form side panel.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
