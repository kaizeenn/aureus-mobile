import React from 'react';
import { Home, BarChart, File, Grid } from 'lucide-react';

export type NavTab = 'home' | 'stats' | 'reports' | 'more';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home' as NavTab, icon: Home, label: 'Home' },
    { id: 'stats' as NavTab, icon: BarChart, label: 'Stats' },
    { id: 'reports' as NavTab, icon: File, label: 'Reports' },
    { id: 'more' as NavTab, icon: Grid, label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border safe-area-bottom">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-2 
                  transition-all duration-300 min-w-[64px]
                  ${isActive 
                    ? 'text-primary scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:scale-105'
                  }
                `}
              >
                <Icon 
                  className={`
                    h-6 w-6 transition-all duration-300
                    ${isActive ? 'scale-110' : ''}
                  `}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span 
                  className={`
                    text-xs font-medium transition-all duration-300
                    ${isActive ? 'font-semibold' : ''}
                  `}
                >
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute bottom-0 w-1 h-1  bg-primary animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
