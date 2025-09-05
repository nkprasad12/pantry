# Pantry Tracker - GitHub Copilot Instructions

Pantry Tracker is an offline-first React + TypeScript web application built with Vite for tracking pantry items. It uses IndexedDB for local storage with no backend required.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Setup

- **Node.js Version**: This project requires Node.js 22.x (specified in package.json engines). Current runtime may show warnings about unsupported engine versions.
- **Architecture**: React 18 + TypeScript + Vite build tool + IndexedDB (via `idb` package)
- **Development Server**: Runs on port 5173, Preview server on port 4173

### Essential Commands (All Validated)

**Bootstrap and Install Dependencies:**

```bash
npm install
```

- **Time**: ~4 seconds on typical setup
- **Issues**: May show "EBADENGINE" warnings if not using Node.js 22.x, but still works

**Type Checking:**

```bash
npm run typecheck
```

- **Time**: ~2 seconds
- **Purpose**: Runs TypeScript compiler in check mode without emitting files

**Production Build:**

```bash
npm run build
```

- **Time**: ~3 seconds (very fast build)
- **Output**: Creates `dist/` directory with optimized assets
- **Process**: Runs `tsc -b && vite build`

**Development Server:**

```bash
npm run dev
```

- **Starts**: Vite development server on http://localhost:5173/
- **Features**: Hot module reloading, fast refresh
- **Time to Start**: ~0.2 seconds

**Preview Production Build:**

```bash
npm run preview
```

- **Starts**: Preview server on http://localhost:4173/
- **Purpose**: Test production build locally

**Code Formatting:**

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

- **Tool**: Prettier with configuration in `.prettierrc.json`
- **Time**: ~1 second

## Validation Requirements

### Manual Testing Scenarios

Always test these scenarios after making changes to ensure functionality:

1. **Core Pantry Operations:**

   - Click "Demo" button to load sample data (4 items with categories, quantities, expiry dates)
   - Click "+ Item" to open add form, fill in item name and unit, click "Add"
   - Verify item appears in pantry list and item count updates
   - Test increment/decrement quantity buttons (+ and - buttons)

2. **User Interface Features:**

   - Test theme switching using moon/sun icons in header
   - Test search functionality using the search textbox
   - Test filtering by "Low" and "Expired" status buttons
   - Verify responsive layout works properly

3. **Data Persistence:**
   - Add items, refresh page, confirm data persists (IndexedDB storage)
   - Test edit functionality by clicking edit icons on items
   - Test remove functionality by clicking remove icons

### Build and CI Validation

- **Always run** `npm run format:check` before committing (CI will fail if formatting is incorrect)
- **Always run** `npm run typecheck` to catch TypeScript errors
- **Always run** `npm run build` to ensure production build succeeds
- **CI Pipeline**: Located in `.github/workflows/ci.yml` - runs install, typecheck, build, and deploys to GitHub Pages

## Repository Structure and Navigation

### Key Directories and Files

```
/src/                          # Source code
  App.tsx                     # Main application component
  main.tsx                    # React entry point
  db.ts                       # IndexedDB database setup
  theme.css                   # CSS custom properties for theming
  components/                 # React components
    use_pantry_db.ts         # Database operations hook
    item_card.tsx            # Individual pantry item display
    new_item_form.tsx        # Add new item form
    use_item_filter.tsx      # Search and filtering logic
    use_theme_selector.tsx   # Theme switching logic
  utils/
    misc.ts                  # Utility functions

/public/                      # Static assets
  manifest.webmanifest       # PWA manifest
  sw.js                      # Service worker
  icons/                     # Application icons

/.github/
  workflows/ci.yml           # GitHub Actions CI/CD pipeline

package.json                 # Dependencies and scripts
vite.config.ts              # Vite build configuration
tsconfig.json               # TypeScript configuration
tsconfig.app.json           # App-specific TypeScript config
.prettierrc.json           # Code formatting rules
```

### Important Implementation Details

- **Database**: Uses IndexedDB via `idb` package for offline-first storage
- **State Management**: React hooks pattern, no external state library
- **Styling**: CSS custom properties for theming, no CSS-in-JS
- **Build Tool**: Vite with React plugin for fast development and production builds
- **Deployment**: Automatically deploys to GitHub Pages on main branch pushes

## Common Development Tasks

### Adding New Features

1. **Always start with** `npm install && npm run typecheck && npm run build` to ensure current state is clean
2. **Create tests first** by adding items via the UI and testing functionality manually
3. **Edit source files** in `/src` directory, following existing patterns
4. **Validate changes** by running `npm run dev` and testing core scenarios
5. **Format code** with `npm run format` before finalizing
6. **Final validation** with `npm run build && npm run typecheck`

### Database Changes

- **Location**: Modify `/src/db.ts` for schema changes
- **Hook**: Update `/src/components/use_pantry_db.ts` for operations
- **Testing**: Use browser DevTools → Application → IndexedDB to inspect data

### UI Component Changes

- **Pattern**: Functional components with hooks
- **Styling**: Use CSS custom properties defined in `/src/theme.css`
- **Icons**: Simple emoji-based icons, no icon library dependency
- **Forms**: See `/src/components/new_item_form.tsx` for patterns

### Performance Considerations

- **Build time**: Very fast (~3 seconds), no optimization needed
- **Bundle size**: ~160KB main JS bundle (optimized)
- **Runtime**: Offline-first design, all data stored locally

## Troubleshooting

### Common Issues

- **Node.js Version Warnings**: Can be ignored if using Node.js 20.x, but prefer 22.x
- **Build Failures**: Usually TypeScript errors, run `npm run typecheck` for details
- **Development Server Issues**: Port 5173 may be in use, Vite will suggest alternative
- **Data Not Persisting**: Check browser DevTools console for IndexedDB errors

### Dependencies

- **No Backend Required**: Application is fully client-side
- **No External APIs**: All functionality works offline
- **Minimal Dependencies**: Only React, TypeScript, Vite, and `idb` package

This is a lightweight, fast-building project perfect for rapid development and testing of pantry management features.
