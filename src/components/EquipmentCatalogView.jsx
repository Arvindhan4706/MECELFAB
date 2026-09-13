'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wind, 
  Droplets, 
  Settings, 
  Hammer, 
  Search, 
  ChevronRight, 
  ArrowRight, 
  SlidersHorizontal,
  FileText,
  X
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_ITEMS } from '@/lib/equipmentData';

const CATEGORY_ICONS = {
  'power-generation': Zap,
  'compressed-air': Wind,
  'hydraulics-pneumatics': Droplets,
  'turbochargers': Settings,
  'machinery-rigging': Hammer,
};

export default function EquipmentCatalogView() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return EQUIPMENT_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        item.title.toLowerCase().includes(q) ||
        item.capacityRange.toLowerCase().includes(q) ||
        item.supportedBrands.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="pt-24 bg-primary min-h-screen">
      {/* Header Section */}
      <section className="pt-8 pb-14 md:pt-12 md:pb-18 border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <Breadcrumbs items={[{ label: 'Equipment & Capabilities' }]} />
          
          <div className="max-w-3xl">
            <span className="inline-block text-secondary text-sm font-heading tracking-widest uppercase mb-4">
              Equipment Catalog
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-light text-white tracking-tight leading-tight mb-6">
              Industrial Equipment<br />
              <span className="text-white/40 italic font-serif">& Technical Systems</span>
            </h1>
            <p className="text-base sm:text-lg text-secondary font-light leading-relaxed max-w-2xl">
              Explore equipment types, certified capacity ranges, and verified brand families deployed, serviced, and overhauled by MECELFAB across India.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <label htmlFor="equipment-search" className="sr-only">Search equipment catalog</label>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                id="equipment-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search generators, compressors, cylinders, HPUs..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-xs font-heading tracking-wider uppercase text-white/40 flex items-center gap-2">
              <SlidersHorizontal size={14} />
              <span>Showing {filteredItems.length} of {EQUIPMENT_ITEMS.length} items</span>
            </div>
          </div>

          {/* Category Tabs (Horizontally scrollable with touch momentum) */}
          <div 
            className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Equipment categories"
          >
            {EQUIPMENT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-heading tracking-wider uppercase transition-all duration-200 min-h-[40px] flex items-center gap-2 ${
                    isActive 
                      ? 'bg-white text-black font-medium shadow-sm' 
                      : 'bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.07] border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Equipment Cards Grid */}
      <section className="py-14 md:py-20" aria-label="Catalog Items">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const Icon = CATEGORY_ICONS[item.category] || Settings;

                return (
                  <article 
                    key={item.slug} 
                    className="group bg-white/[0.02] border border-white/5 rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                          <Icon size={18} />
                        </div>
                        <span className="text-[10px] font-heading uppercase tracking-widest px-2.5 py-1 bg-white/[0.04] border border-white/10 text-white/50 rounded">
                          {item.categoryLabel}
                        </span>
                      </div>

                      {/* Title & Range */}
                      <h2 className="text-xl font-heading font-light text-white mb-1.5 group-hover:text-white transition-colors">
                        <Link href={`/equipment/${item.slug}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h2>
                      <p className="text-xs font-heading tracking-wide text-accent/80 font-medium mb-4">
                        {item.capacityRange}
                      </p>

                      {/* Description */}
                      <p className="text-secondary text-sm font-light leading-relaxed mb-6 line-clamp-3">
                        {item.shortDescription}
                      </p>

                      {/* Brands tag */}
                      <div className="mb-6 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs font-light text-white/50">
                        <span className="text-white/30 uppercase tracking-widest font-heading text-[10px] block mb-1">
                          Supported Brands / Makes
                        </span>
                        <span className="text-white/80">{item.supportedBrands}</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                      <Link
                        href={`/equipment/${item.slug}`}
                        className="text-xs font-heading tracking-wider uppercase text-white/70 hover:text-white flex items-center gap-1.5 min-h-[44px]"
                      >
                        Details <ArrowRight size={13} />
                      </Link>
                      
                      <Link
                        href={`/contact?equipment=${item.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-heading text-[11px] tracking-wider uppercase rounded hover:bg-white/90 transition-colors min-h-[44px]"
                      >
                        <FileText size={13} />
                        RFQ
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center bg-white/[0.02] border border-white/5 rounded-xl max-w-xl mx-auto">
              <Settings size={32} className="mx-auto text-white/30 mb-4 animate-spin-slow" />
              <h3 className="text-lg font-heading text-white mb-2">No matching equipment found</h3>
              <p className="text-sm text-secondary font-light mb-6">
                We could not find equipment matching &ldquo;{searchQuery}&rdquo;. Try another keyword or clear the search.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="px-6 py-2.5 bg-white text-black text-xs font-heading tracking-wider uppercase rounded hover:bg-white/90 transition-colors"
              >
                Reset Catalog Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Conversion Section */}
      <section className="py-16 md:py-20 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-4xl text-center">
          <span className="text-white/40 text-[11px] font-heading tracking-[0.3em] uppercase block mb-3">
            Custom Industrial Engineering
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-light text-white mb-4">
            Need Specific Machinery, Deployment, or Sizing?
          </h2>
          <p className="text-secondary font-light max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
            Our engineering team assesses capacity requirements, site power draws, and operational constraints to deploy or service the right industrial machinery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-heading text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
            >
              REQUEST RFQ
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/capabilities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white font-heading text-xs tracking-widest uppercase hover:border-white/40 hover:text-white transition-colors"
            >
              View Full Capabilities
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
