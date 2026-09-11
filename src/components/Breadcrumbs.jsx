import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-heading tracking-wider uppercase text-white/40">
        <li>
          <Link href="/" className="hover:text-white transition-colors duration-200">Home</Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight size={10} className="text-white/20" />
            {item.href ? (
              <Link href={item.href} className="hover:text-white transition-colors duration-200">{item.label}</Link>
            ) : (
              <span className="text-white/70">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
