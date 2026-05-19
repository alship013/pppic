# Front-End UI Skills & Reference Manual

Use the blueprints and design standards in this file to construct, edit, and refactor all React and Next.js UI elements.

## 1. Core Component Blueprints

### Accessible Icon Button

Always include explicit accessible labels (`aria-label`) and visible focus states on interactive icon-only buttons.

```tsx
import { LucideIcon } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
}

export function IconButton({ icon: Icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors ${className}`}
      {...props}
    )
  }
}
```

### Next.js Image Component

Never use standard HTML `<img>` tags. Always use `next/image` with proper layouts, aspect ratios, and loading priorities.

```tsx
import Image from 'next/image';

export function VisualHero() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
      <Image
        src="/hero-dashboard.png"
        alt="Analytics dashboard showing monthly recurring revenue charts"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        className="object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}
```

## 2. Flexbox & Grid Layout Patterns

### Dashboard Metric Grid

Use a responsive grid layout that adapts cleanly from mobile to high-resolution desktop viewports.

```tsx
export function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {children}
    </div>
  );
}
```

### Sticky Shell Layout

Use this structure for primary application routing screens containing top navbars and side navigation components.

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Top Nav Content */}
      </header>
      <div className="flex-1 items-start md:grid md:grid-cols-[240px_1fr]">
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto border-r">
          {/* Sidebar Content */}
        </aside>
        <main className="relative py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 3. Tailwind CSS & Utility Rules

### Component State Management Clashing

When combining state flags with classes, always prioritize clarity over messy ternary operators. Use conditional arrays or simple string templates.

* **Good:** ``className={`px-4 py-2 rounded ${isActive ? 'bg-primary' : 'bg-secondary'}`}``
* **Bad:** ``className={isActive ? "px-4 py-2 rounded bg-primary text-white shadow-sm flex items-center" : "px-4 py-2 rounded bg-secondary text-black opacity-50 flex items-center"}``

### Transition and Motion Presets

All interactions (hovers, focus states, slide-outs) must use these standard durations and curves.

* **Standard Hover:** `transition-colors duration-200 ease-in-out`
* **Layout/Scale Morphing:** `transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)`
