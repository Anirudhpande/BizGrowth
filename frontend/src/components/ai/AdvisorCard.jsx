export default function AdvisorCard({ tool, onSelect }) {
  const { name, description, category, icon } = tool;

  return (
    <div 
      onClick={() => onSelect(tool)}
      className="bg-surface-container-low border border-outline-variant/30 hover:border-secondary/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
    >
      <div className="space-y-4">
        {/* Card Header (Category Badge and Icon) */}
        <div className="flex justify-between items-center">
          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            {category}
          </span>
          <span className="material-symbols-outlined text-secondary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all text-[24px]">
            {icon || 'smart_toy'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-headline-md text-headline-md font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
          {name}
        </h3>

        {/* Description */}
        <p className="text-body-sm text-on-surface-variant/80 line-clamp-3">
          {description}
        </p>
      </div>

      {/* Footer / CTA */}
      <div className="border-t border-outline-variant/20 pt-4 mt-6 flex justify-end items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(tool);
          }}
          className="text-secondary font-bold text-body-sm flex items-center gap-0.5 group-hover:text-secondary/80 transition-colors"
        >
          Use Tool
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
