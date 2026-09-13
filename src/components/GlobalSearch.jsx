'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, Wrench, Factory, Cpu, FileText } from 'lucide-react';
import { EQUIPMENT_ITEMS } from '@/lib/equipmentData';

const STATIC_SEARCH_ITEMS = [
  // Core Services
  { type: 'Service', title: 'Industrial Generator Rental', href: '/services/generator-rental', subtitle: 'Base load, temporary, & standby power generation', icon: Cpu },
  { type: 'Service', title: 'Industrial Generator Spare Parts', href: '/services/generator-spare-parts', subtitle: 'OEM filtration, alternators, AVRs, injectors', icon: Wrench },
  { type: 'Service', title: 'Hydraulic & Pneumatic System Overhauling', href: '/services/hydraulic-pneumatic-overhauling', subtitle: 'Cylinder honing, pump overhaul, seal replacement', icon: Wrench },
  { type: 'Service', title: 'Industrial Erection', href: '/services/industrial-erection', subtitle: 'Heavy machine installation, alignment, & rigging', icon: Factory },
  { type: 'Service', title: 'Industrial Fabrication', href: '/services/industrial-fabrication', subtitle: 'Structural frames, ducting, tanks, skids', icon: Factory },
  { type: 'Service', title: 'Air Compressor Rental', href: '/services/air-compressor-rental', subtitle: 'Electric & diesel rotary screw compressors', icon: Cpu },
  { type: 'Service', title: 'Turbocharger Services', href: '/services/turbocharger-services', subtitle: 'Dynamic rotor balancing & cartridge rebuilds', icon: Wrench },
  { type: 'Service', title: 'AMC — Annual Maintenance Contract', href: '/services/amc', subtitle: 'Preventive schedules, health diagnostics, breakdown SLAs', icon: FileText },

  // Key Industries
  { type: 'Industry', title: 'Industrial Manufacturing', href: '/industries/industrial-manufacturing', subtitle: 'Production line installations, foundations, fabrication', icon: Factory },
  { type: 'Industry', title: 'Power & Energy', href: '/industries/power-energy', subtitle: 'Substations, generation sets, critical backup', icon: Cpu },
  { type: 'Industry', title: 'Industrial Maintenance', href: '/industries/industrial-maintenance', subtitle: 'Hydraulic overhauls, pneumatic troubleshooting, AMC', icon: Wrench },
  { type: 'Industry', title: 'Commercial / Temporary Power', href: '/industries/commercial-power', subtitle: 'Shutdown backup, events, infrastructure power', icon: Cpu },

  // Quick Action
  { type: 'Action', title: 'Request RFQ / Technical Quotation', href: '/contact', subtitle: 'Submit scope and technical specifications to engineering', icon: FileText },
  { type: 'Action', title: 'Company Capabilities Document', href: '/capabilities', subtitle: 'Explore MECELFAB technical capabilities and infrastructure', icon: FileText },
];

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  // Combine static entities with Equipment items
  const allSearchable = useMemo(() => {
    const equipmentMapped = EQUIPMENT_ITEMS.map((item) => ({
      type: 'Equipment',
      title: item.title,
      href: `/equipment/${item.slug}`,
      subtitle: `${item.capacityRange} — ${item.supportedBrands}`,
      icon: Cpu,
    }));
    return [...STATIC_SEARCH_ITEMS, ...equipmentMapped];
  }, []);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSearchable.slice(0, 8); // show initial recommendations

    return allSearchable.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [allSearchable, query]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
      } else if (e.key === 'Enter') {
        if (filteredResults[selectedIndex]) {
          e.preventDefault();
          router.push(filteredResults[selectedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-6 md:p-12"
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-lg bg-[#0a0e17]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden mt-8 md:mt-16 transition-all transform animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <Search size={16} className="text-white/40 shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search equipment, services, industries..."
            className="w-full bg-transparent text-white placeholder:text-white/30 text-sm font-light focus:outline-none"
            aria-label="Search site content"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-white/40 hover:text-white p-1 mr-1.5"
              aria-label="Clear search input"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[10px] font-heading tracking-wider uppercase text-white/40 hover:text-white px-1.5 py-0.5 border border-white/10 rounded"
            aria-label="Close search"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[50vh] overflow-y-auto p-2 divide-y divide-white/[0.03]">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon || Sparkles;

              return (
                <Link
                  key={`${item.type}-${item.title}-${idx}`}
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                      isSelected 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/[0.03] text-white/60 border-white/10'
                    }`}>
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-heading tracking-wider uppercase px-1 py-0.2 rounded ${
                          item.type === 'Equipment'
                            ? 'bg-accent/20 text-accent border border-accent/30'
                            : item.type === 'Service'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {item.type}
                        </span>
                        <h4 className="text-xs font-medium text-white truncate">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-white/40 font-light truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-[11px] font-heading uppercase tracking-wider text-white/30">
                    <ArrowRight size={12} className={isSelected ? 'text-white translate-x-0.5 transition-transform' : ''} />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-6 text-center text-white/40">
              <p className="text-xs">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-3.5 py-2 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[10px] font-heading tracking-wider uppercase text-white/30">
          <div className="hidden sm:flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <Link
            href="/contact"
            onClick={onClose}
            className="text-accent hover:underline flex items-center gap-1 ml-auto"
          >
            RFQ Form <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}
