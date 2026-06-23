/**
 * PolicyContent — Renders the active policy's sections with editorial typography,
 * animated entrance, and luxury card styling.
 */
import { useState, useEffect } from 'react';

export default function PolicyContent({ policy }) {
  const Icon = policy.icon;

  const [settings, setSettings] = useState({
    supportPhone: '+91 97681 88453',
    supportEmail: 'orders@decantatelier.in'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('http://localhost:5000/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            supportPhone: data.supportPhone || '+91 97681 88453',
            supportEmail: data.supportEmail || 'orders@decantatelier.in'
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings for policy content:', err);
      }
    }
    fetchSettings();
  }, []);

  return (
    <article
      key={policy.id}
      className="animate-fadeIn font-body"
      aria-labelledby={`policy-title-${policy.id}`}
    >
      {/* Header */}
      <header className="mb-12">
        {/* Icon badge with scale effect */}
        <div className="group/icon mb-5 inline-flex items-center justify-center w-14 h-14 rounded-none bg-[#1C1B18] border border-black/5 hover:scale-105 transition-all duration-300">
          <Icon className="w-6 h-6 text-[#B08A50] group-hover/icon:rotate-12 transition-transform duration-300" />
        </div>

        {/* Eyebrow */}
        <p className="text-[0.65rem] font-bold tracking-[4px] uppercase text-[#B08A50] mb-3">
          {policy.tagline}
        </p>

        {/* Title */}
        <h2
          id={`policy-title-${policy.id}`}
          className="font-heading text-[clamp(1.8rem,3.5vw,2.5rem)] font-light text-[#1C1B18] leading-tight tracking-wide"
        >
          {policy.title}
        </h2>

        {/* Premium editorial divider */}
        <div className="mt-5 flex items-center gap-3 select-none">
          <div className="h-px w-10 bg-[#B08A50]" />
          <div className="w-1.5 h-1.5 bg-[#B08A50] rotate-45 shadow-sm" />
          <div className="h-px w-24 bg-gradient-to-r from-[#B08A50] to-transparent" />
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-0">
        {policy.sections.map((section, index) => (
          <section
            key={index}
            className="group/section relative py-8"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Section number with accent */}
            <div className="absolute left-0 top-[2.1rem] flex items-center gap-2.5 select-none font-heading">
              <span className="text-[0.95rem] lg:text-[1.05rem] font-medium tracking-[2px] text-[#B08A50] transition-colors duration-300 group-hover/section:text-[#B08A50]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="w-5 group-hover/section:w-7 h-px bg-gradient-to-r from-[#B08A50]/50 to-transparent transition-all duration-300" />
            </div>

            {/* Content */}
            <div className="pl-14 lg:pl-18">
              <h3 className="font-heading text-[1.2rem] lg:text-[1.3rem] font-light text-[#1C1B18] mb-3 tracking-wide leading-snug transition-colors duration-300 group-hover/section:text-[#B08A50]">
                {section.heading}
              </h3>
              <p className="font-body text-[0.85rem] lg:text-[0.88rem] text-black/70 leading-[1.8] font-normal transition-colors duration-300 group-hover/section:text-black">
                {section.content}
              </p>
            </div>

            {/* Premium fading line divider */}
            {index < policy.sections.length - 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
            )}
          </section>
        ))}
      </div>

      {/* Footer note */}
      <footer className="mt-12 pt-8 border-t border-black/8">
        <div className="flex items-start gap-4 p-6 rounded-none bg-[#F7F3ED] border border-black/6 shadow-sm">
          <div className="w-9 h-9 rounded-none bg-[#1C1B18] flex items-center justify-center flex-shrink-0 shadow-md shadow-black/10">
            <svg className="w-4.5 h-4.5 text-[#B08A50]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </div>
          <div>
            <p className="text-[0.82rem] font-bold text-[#1C1B18] mb-1.5 tracking-wide uppercase">Need Assistance?</p>
            <p className="text-[0.76rem] text-black/65 leading-relaxed font-body">
              Our concierge team is available to assist you. Contact us at{' '}
              <a href={`mailto:${settings.supportEmail}`} className="text-[#B08A50] hover:text-[#1C1B18] font-bold underline underline-offset-4 decoration-[#B08A50]/30 hover:decoration-[#1C1B18] transition-all duration-300">
                {settings.supportEmail}
              </a>{' '}
              or call{' '}
              <a href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`} className="text-[#B08A50] hover:text-[#1C1B18] font-bold underline underline-offset-4 decoration-[#B08A50]/30 hover:decoration-[#1C1B18] transition-all duration-300">
                {settings.supportPhone}
              </a>
            </p>
          </div>
        </div>
      </footer>
    </article>
  );
}
