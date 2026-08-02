import { useState, useMemo } from 'react';
import AdvisorCard from './AdvisorCard';

export default function AdvisorGrid({ tools, onSelectTool }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Growth', 'Marketing', 'Sales', 'Finance', 'Strategy', 'Operations'];

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || 
        tool.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [tools, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Control Panel (Search & Category Pills) */}
      <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm flex flex-col gap-5">
        
        {/* Search Bar Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
              search
            </span>
            <input
              type="text"
              placeholder="Search advisor tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Reset Filters Option */}
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-body-sm text-secondary hover:text-secondary/80 font-bold underline transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-body-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Display */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant bg-surface rounded-2xl border border-dashed border-outline-variant/60 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-6xl opacity-35 mb-2">
            smart_toy
          </span>
          <h3 className="font-headline-md text-headline-md font-bold text-primary">
            No Tools Found
          </h3>
          <p className="text-body-sm text-on-surface-variant font-medium mt-1">
            Try adjusting your search criteria or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <AdvisorCard
              key={tool.id}
              tool={tool}
              onSelect={onSelectTool}
            />
          ))}
        </div>
      )}
    </div>
  );
}
