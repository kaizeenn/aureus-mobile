import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-effect safe-area-top transition-smooth">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Just "Aureus" (no emoji) */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight gradient-text">
              Aureus
            </h1>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
