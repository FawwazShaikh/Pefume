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
                  group w-full flex items-center gap-4 px-5 py-4 rounded-none
                  transition-all duration-300 ease-out text-left cursor-pointer
                  ${isActive
                    ? 'bg-[#1C1B18] shadow-sm'
                    : 'hover:bg-[#EFE8DD]/60'
                  }
                `}
              >
                {/* Icon */}
                <span
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center
                    transition-all duration-300
                    ${isActive
                      ? 'bg-[#B08A50]/20 text-[#B08A50]'
                      : 'bg-black/5 text-black/50 group-hover:bg-black/8 group-hover:text-[#1C1B18]'
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
                      ${isActive ? 'text-white' : 'text-[#1C1B18]'}
                    `}
                  >
                    {policy.title}
                  </span>
                  <span
                    className={`
                      block text-[0.68rem] mt-0.5 transition-colors duration-300 font-body
                      ${isActive ? 'text-[#B08A50]' : 'text-black/40 group-hover:text-black/60'}
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
                      ? 'text-[#B08A50] translate-x-0 opacity-100'
                      : 'text-black/20 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'
                    }
                  `}
                />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Mobile / Tablet: horizontal scrollable pills */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide -mx-1 px-1">
        <ul className="flex gap-2.5 pb-2 min-w-max">
          {policies.map((policy) => {
            const Icon = policy.icon;
            const isActive = activeId === policy.id;

            return (
              <li key={policy.id}>
                <button
                  onClick={() => onSelect(policy.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    flex items-center gap-2.5 px-4 py-2.5 rounded-none
                    transition-all duration-300 whitespace-nowrap cursor-pointer
                    text-[0.78rem] font-medium tracking-wide
                    ${isActive
                      ? 'bg-[#1C1B18] text-white shadow-md shadow-black/15'
                      : 'bg-[#EFE8DD]/70 text-[#1C1B18] hover:bg-[#EFE8DD] hover:text-[#1C1B18]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {policy.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
