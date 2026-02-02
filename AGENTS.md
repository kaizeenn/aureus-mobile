# AGENTS.md - Aureus Money Tracking App

## Project Overview
React + TypeScript + Vite + Tailwind CSS + shadcn/ui money tracking application with Capacitor for Android mobile app.

## Build Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Capacitor commands (Android)
npx cap sync android        # Sync web assets to Android
npx cap open android        # Open Android Studio
npx cap run android         # Run on Android device
```

## Testing
**Note:** No test framework currently configured. To add tests, install vitest or jest and add test scripts to package.json.

## Code Style Guidelines

### Imports Order
1. React imports
2. Third-party libraries
3. shadcn/ui components (`@/components/ui/`)
4. Custom components (`@/components/`)
5. Hooks and utilities (`@/hooks/`, `@/lib/`)
6. Types and interfaces
7. Relative imports (when needed)

Example:
```tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Mic } from 'lucide-react';
import { Transaction } from '@/pages/Index';
import { format } from 'date-fns';
```

### Component Structure
- Use functional components with React.FC<Props> type annotation
- Props interfaces in PascalCase with Props suffix
- Export components as default at end of file
- Use forwardRef for components that need ref forwarding

```tsx
interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onClose }) => {
  // component logic
};

export default TransactionForm;
```

### Naming Conventions
- Components: PascalCase (e.g., `TransactionForm.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `use-mobile.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- UI components: kebab-case in `@/components/ui/` (e.g., `button.tsx`)
- Interfaces: PascalCase (e.g., `Transaction`, `TransactionFormProps`)
- Type aliases: PascalCase with `Type` suffix when ambiguous

### TypeScript Guidelines
- Always use explicit types for function parameters and return types
- Use `Omit<>` and `Pick<>` for derived types
- Prefer interface over type for object shapes
- Use `as const` for constant arrays/objects
- Disable strict null checks in project (configured in tsconfig.json)

### Styling with Tailwind
- Use shadcn/ui components as base
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use Tailwind's arbitrary values sparingly
- Follow mobile-first responsive design
- Use CSS variables from theme (e.g., `bg-primary`, `text-foreground`)

### State Management
- Use React hooks (useState, useEffect) for local state
- Use React Query for server state (configured in App.tsx)
- Use localStorage for persistent data (see Index.tsx pattern)
- Lift state up when multiple components need access

### Error Handling
- Use try-catch for async operations
- Set error state and display UI feedback
- Log errors to console with descriptive messages
- Use toast notifications for user feedback (Sonner)

Example:
```tsx
const [error, setError] = useState<string>('');

try {
  await someAsyncOperation();
} catch (err) {
  console.error('Operation failed:', err);
  setError('Failed to complete operation');
}
```

### Form Handling
- Use react-hook-form with zod resolver for validation
- Use shadcn/ui form components with Controller
- Validate on submit, show inline errors

### Icons
- Use Lucide React icons exclusively
- Standard size: 16-20px (lucide default)
- Import only needed icons to reduce bundle size

### File Organization
```
src/
  components/
    ui/          # shadcn/ui components
    *.tsx        # Custom components
  pages/         # Route components
  hooks/         # Custom React hooks
  lib/           # Utilities (utils.ts)
  *.tsx          # Entry points
```

### Environment Detection
- Use `@capacitor/core` Capacitor API for native detection
- Check `Capacitor.isNativePlatform()` for Android/iOS
- Use web APIs as fallback for browser

### ESLint Configuration
- TypeScript ESLint with React Hooks and Refresh plugins
- Unused vars warnings disabled (`@typescript-eslint/no-unused-vars: off`)
- React Refresh component export warnings enabled

## Mobile Considerations
- Always test responsive design (mobile-first)
- Use haptics for native feel (`@capacitor/haptics`)
- Handle Android permissions (RECORD_AUDIO in AndroidManifest.xml)
- Test voice recognition on both web and native

## Adding New Features
1. Create component in `src/components/`
2. Add route in `App.tsx` if needed
3. Update navigation in `BottomNav.tsx` if needed
4. Test on both web and mobile
5. Run `npm run lint` before committing
