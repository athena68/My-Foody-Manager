# My Foody Manager - Development Guidelines

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm test -- -t "test name"` - Run specific test

## Code Style Guidelines
- **TypeScript**: Use strict typing. Define interfaces in `lib/types.ts`
- **Imports**: Group imports by: 1) React/Next, 2) Third-party, 3) Components, 4) Utils/Libs
- **Components**: Follow shadcn/ui conventions, use named exports
- **Naming**: PascalCase for components, camelCase for variables/functions, kebab-case for files
- **CSS**: Use Tailwind utility classes, group related classes
- **Error Handling**: Use try/catch for async operations with meaningful error messages
- **Forms**: Validate inputs, provide clear error states and feedback
- **State Management**: Use React hooks (useState, useContext) for state

## Tech Stack
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Google Maps API
- shadcn/ui