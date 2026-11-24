import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Lock, X } from 'lucide-react';
import {
  NavMenuItem,
  NavSectionGroup,
  NavSubItem,
  NavSubSubItem,
} from '../../data/navigationHierarchy';

export interface ThreeLevelSidebarProps {
  groups: NavSectionGroup[];
  activePath?: string;
  activeTabKey?: string;
  activeSubModeKey?: string;
  accentColor?: string;
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  onSelectItem?: (item: {
    id: string;
    to?: string;
    tabKey?: string;
    subModeKey?: string;
  }) => void;
  onCloseMobile?: () => void;
}

function itemMatchesActive(
  item: { id: string; to?: string; tabKey?: string; subModeKey?: string },
  activePath?: string,
  activeTabKey?: string,
  activeSubModeKey?: string
): boolean {
  if (item.tabKey && activeTabKey) {
    if (item.subModeKey) {
      return (
        item.tabKey.toUpperCase() === activeTabKey.toUpperCase() &&
        item.subModeKey.toUpperCase() === (activeSubModeKey || '').toUpperCase()
      );
    }
    return item.tabKey.toUpperCase() === activeTabKey.toUpperCase() && !activeSubModeKey;
  }
  if (item.to && activePath) {
    const [pathOnly, queryOnly] = item.to.split('?');
    if (queryOnly) {
      return `${activePath}` === item.to;
    }
    return (
      activePath === pathOnly ||
      (pathOnly !== '/dashboard' &&
        pathOnly !== '/' &&
        activePath.startsWith(`${pathOnly}/`))
    );
  }
  return false;
}

function subBranchHasActive(
  sub: NavSubItem,
  activePath?: string,
  activeTabKey?: string,
  activeSubModeKey?: string
): boolean {
  if (itemMatchesActive(sub, activePath, activeTabKey, activeSubModeKey)) return true;
  if (sub.tabKey && activeTabKey && sub.tabKey.toUpperCase() === activeTabKey.toUpperCase()) {
    return true;
  }
  return Boolean(
    sub.children?.some((c) => itemMatchesActive(c, activePath, activeTabKey, activeSubModeKey))
  );
}

function menuBranchHasActive(
  menu: NavMenuItem,
  activePath?: string,
  activeTabKey?: string,
  activeSubModeKey?: string
): boolean {
  if (itemMatchesActive(menu, activePath, activeTabKey, activeSubModeKey)) return true;
  if (menu.tabKey && activeTabKey && menu.tabKey.toUpperCase() === activeTabKey.toUpperCase()) {
    return true;
  }
  return Boolean(
    menu.children?.some((sub) =>
      subBranchHasActive(sub, activePath, activeTabKey, activeSubModeKey)
    )
  );
}

export default function ThreeLevelSidebar({
  groups,
  activePath,
  activeTabKey,
  activeSubModeKey,
  accentColor = '#2563EB',
  headerSlot,
  footerSlot,
  onSelectItem,
  onCloseMobile,
}: ThreeLevelSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    groups.forEach((g) => {
      init[g.id] = g.defaultExpanded ?? true;
    });
    return init;
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Auto-expand category + menu + sub-menu branches containing the active item
  useEffect(() => {
    setExpandedCategories((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        if (next[g.id] === undefined) {
          next[g.id] = g.defaultExpanded ?? true;
        }
        const hasActive = g.menus.some((m) =>
          menuBranchHasActive(m, activePath, activeTabKey, activeSubModeKey)
        );
        if (hasActive) next[g.id] = true;
      });
      return next;
    });

    setExpandedNodes((prev) => {
      const next = { ...prev };
      groups.forEach((g) => {
        g.menus.forEach((m) => {
          if (m.children?.length && menuBranchHasActive(m, activePath, activeTabKey, activeSubModeKey)) {
            next[m.id] = true;
          }
          m.children?.forEach((sub) => {
            if (
              sub.children?.length &&
              subBranchHasActive(sub, activePath, activeTabKey, activeSubModeKey)
            ) {
              next[sub.id] = true;
            }
          });
        });
      });
      return next;
    });
  }, [groups, activePath, activeTabKey, activeSubModeKey]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCount = (count?: number | string, active?: boolean) => {
    if (count === undefined || count === '') return null;
    return (
      <span
        className={`text-[11px] font-mono tabular-nums shrink-0 ${
          active ? 'text-white/90' : 'text-slate-400'
        }`}
      >
        {count}
      </span>
    );
  };

  const renderSubSubItem = (subSub: NavSubSubItem) => {
    const active = itemMatchesActive(subSub, activePath, activeTabKey, activeSubModeKey);
    const Icon = subSub.icon;

    const inner = (
      <>
        <span className="flex items-center gap-2 min-w-0">
          {Icon && (
            <Icon
              size={13}
              className={`shrink-0 ${active ? 'text-white' : 'text-slate-500'}`}
            />
          )}
          <span className="truncate">{subSub.label}</span>
        </span>
        {subSub.locked ? (
          <Lock size={11} className="text-amber-400 shrink-0" />
        ) : (
          renderCount(subSub.count, active)
        )}
      </>
    );

    const cls = `w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors duration-150 whitespace-nowrap ${
      active
        ? 'text-white font-semibold'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
    }`;

    if (subSub.to && !onSelectItem) {
      return (
        <Link
          key={subSub.id}
          to={subSub.to}
          onClick={() => onCloseMobile?.()}
          className={cls}
          style={active ? { backgroundColor: accentColor } : undefined}
        >
          {inner}
        </Link>
      );
    }

    return (
      <button
        key={subSub.id}
        type="button"
        onClick={() => {
          onSelectItem?.(subSub);
          onCloseMobile?.();
        }}
        className={`${cls} text-left cursor-pointer`}
        style={active ? { backgroundColor: accentColor } : undefined}
      >
        {inner}
      </button>
    );
  };

  const renderSubItem = (sub: NavSubItem) => {
    const hasGrand = Boolean(sub.children && sub.children.length > 0);
    const isExpanded = Boolean(expandedNodes[sub.id]);
    const active =
      itemMatchesActive(sub, activePath, activeTabKey, activeSubModeKey) ||
      (hasGrand && Boolean(sub.tabKey && activeTabKey === sub.tabKey && !activeSubModeKey));
    const Icon = sub.icon;

    const rowContent = (
      <>
        <span className="flex items-center gap-2 min-w-0">
          {Icon && (
            <Icon
              size={14}
              className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
            />
          )}
          <span className="truncate">{sub.label}</span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          {sub.locked ? <Lock size={11} className="text-amber-400" /> : renderCount(sub.count, active)}
          {hasGrand && (
            <span className="text-slate-400">
              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </span>
          )}
        </span>
      </>
    );

    const rowCls = `w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
      active
        ? 'bg-slate-800 text-white font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
    }`;

    return (
      <div key={sub.id} className="space-y-0.5">
        {sub.to && !onSelectItem && !hasGrand ? (
          <Link to={sub.to} onClick={() => onCloseMobile?.()} className={rowCls}>
            {rowContent}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (hasGrand) toggleNode(sub.id);
              if (sub.to || sub.tabKey) {
                onSelectItem?.(sub);
                if (!hasGrand) onCloseMobile?.();
              }
            }}
            aria-expanded={hasGrand ? isExpanded : undefined}
            className={`${rowCls} text-left cursor-pointer`}
          >
            {rowContent}
          </button>
        )}

        {hasGrand && isExpanded && (
          <div className="ml-3 pl-2.5 border-l border-slate-800 space-y-0.5 py-0.5">
            {sub.children!.map(renderSubSubItem)}
          </div>
        )}
      </div>
    );
  };

  const renderMenu = (menu: NavMenuItem) => {
    const hasChildren = Boolean(menu.children && menu.children.length > 0);
    const isExpanded = Boolean(expandedNodes[menu.id]);
    const isDirectActive =
      itemMatchesActive(menu, activePath, activeTabKey, activeSubModeKey) ||
      (hasChildren && Boolean(menu.tabKey && activeTabKey === menu.tabKey && !activeSubModeKey));
    const Icon = menu.icon;

    const inner = (
      <>
        <span className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <Icon
              size={15}
              className={`shrink-0 ${isDirectActive ? 'text-white' : 'text-slate-400'}`}
            />
          )}
          <span className="truncate">{menu.label}</span>
        </span>
        <span className="flex items-center gap-1.5 shrink-0">
          {menu.locked ? (
            <Lock size={11} className="text-amber-400" />
          ) : (
            renderCount(menu.count, isDirectActive)
          )}
          {hasChildren && (
            <span className={isDirectActive ? 'text-white/80' : 'text-slate-400'}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </span>
      </>
    );

    const cls = `w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 whitespace-nowrap ${
      isDirectActive
        ? 'text-white font-semibold'
        : 'text-slate-200 hover:bg-slate-800 hover:text-white'
    }`;

    return (
      <div key={menu.id} className="space-y-0.5">
        {menu.to && !onSelectItem && !hasChildren ? (
          <Link
            to={menu.to}
            onClick={() => onCloseMobile?.()}
            className={cls}
            style={isDirectActive ? { backgroundColor: accentColor } : undefined}
          >
            {inner}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (hasChildren) toggleNode(menu.id);
              if (menu.to || menu.tabKey) {
                onSelectItem?.(menu);
                if (!hasChildren) onCloseMobile?.();
              }
            }}
            aria-expanded={hasChildren ? isExpanded : undefined}
            className={`${cls} text-left cursor-pointer`}
            style={isDirectActive ? { backgroundColor: accentColor } : undefined}
          >
            {inner}
          </button>
        )}

        {hasChildren && isExpanded && (
          <div className="ml-3 pl-2.5 border-l border-slate-800 space-y-0.5 py-1">
            {menu.children!.map(renderSubItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {headerSlot && (
        <div className="border-b border-slate-800 shrink-0 relative">
          {headerSlot}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4" aria-label="Workspace Navigation">
        {groups.map((group) => {
          const isCatOpen = expandedCategories[group.id] ?? true;
          return (
            <div key={group.id} className="space-y-1.5">
              <button
                type="button"
                onClick={() => toggleCategory(group.id)}
                aria-expanded={isCatOpen}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 text-left rounded hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold tracking-wide text-slate-300 truncate">
                    {group.categoryLabel}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{group.sectionLabel}</div>
                </div>
                <span className="text-slate-400 shrink-0">
                  {isCatOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>

              {isCatOpen && <div className="space-y-1">{group.menus.map(renderMenu)}</div>}
            </div>
          );
        })}
      </nav>

      {footerSlot && (
        <div className="border-t border-slate-800 bg-slate-950/70 shrink-0">{footerSlot}</div>
      )}
    </div>
  );
}
