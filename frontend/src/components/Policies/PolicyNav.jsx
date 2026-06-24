import { ChevronRightIcon } from './Icons';

/**
 * PolicyNav — Sidebar / top navigation for selecting a policy.
 * On desktop: elegant vertical sidebar. On mobile: horizontal scrollable pills.
 */
export default function PolicyNav({ policies, activeId, onSelect }) {
  return (
    <nav aria-label="Policy navigation" className="w-full">
      {/* Desktop: vertical sidebar list */}
      <ul className="hidden lg:flex flex-col gap-1">
        {policies.map((policy) => {
          const Icon = policy.icon;
          const isActive = activeId === policy.id;

          return (
            <li key={policy.id}>
              <button
                onClick={() => onSelect(policy.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  group w-full flex items-center gap-4 px-6 py-4 rounded-2xl
                  transition-all duration-300 ease-out text-left cursor-pointer
                  ${isActive
                    ? 'bg-policy-primary shadow-sm'
                    : 'hover:bg-policy-divider/30'
                  }
                `}
              >
                {/* Icon */}
                <span
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center
                    transition-all duration-300
                    ${isActive
                      ? 'bg-policy-gold/20 text-policy-gold'
                      : 'bg-policy-divider/30 text-policy-body/60 group-hover:bg-policy-divider/50 group-hover:text-policy-primary'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </span>

                {/* Label */}
                <span className="flex-1 min-w-0">
                  <span
                    className={`
                      block text-[0.82rem] font-bold tracking-wide transition-colors duration-300 font-body
                      ${isActive ? 'text-white' : 'text-policy-primary'}
                    `}
                  >
                    {policy.title}
                  </span>
                  <span
                    className={`
                      block text-[0.68rem] mt-0.5 transition-colors duration-300 font-body
                      ${isActive ? 'text-policy-gold' : 'text-policy-body/70 group-hover:text-policy-body'}
                    `}
                  >
                    {policy.tagline}
                  </span>
                </span>

                {/* Arrow */}
                <ChevronRightIcon
                  className={`
                    w-4 h-4 flex-shrink-0 transition-all duration-300
                    ${isActive
                      ? 'text-policy-gold translate-x-0 opacity-100'
                      : 'text-policy-divider -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }
                  `}
                />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Mobile / Tablet: horizontal scrollable pills navigation */}
      <div className="lg:hidden -mx-4 overflow-x-auto scroll-smooth scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
        <div className="inline-flex items-center gap-2 w-max">
          {policies.map((policy) => {
            const Icon = policy.icon;
            const isActive = activeId === policy.id;

            return (
              <button
                key={policy.id}
                onClick={() => onSelect(policy.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  inline-flex items-center justify-center gap-2 whitespace-nowrap
                  min-w-[140px] sm:min-w-[160px] flex-shrink-0 snap-start
                  h-10 px-4 py-2.5 rounded-full transition-all duration-300 ease-out cursor-pointer
                  text-[0.74rem] font-medium tracking-wide font-body
                  ${isActive
                    ? 'bg-policy-primary text-white shadow-sm'
                    : 'bg-policy-divider/30 text-policy-primary hover:bg-policy-divider/50'
                  }
                `}
              >
                <Icon
                  className={`
                    w-4 h-4 flex-shrink-0 transition-colors duration-300
                    ${isActive ? 'text-policy-gold' : 'text-policy-primary/70'}
                  `}
                />
                <span className="flex items-center leading-none mt-[-0.5px]">
                  {policy.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
