# Nord Color Scheme Documentation

This document provides an overview of the Nord color scheme implemented in this project.

## About Nord

Nord is an arctic, north-bluish color palette that brings a calm and harmonious aesthetic to user interfaces. Created with a focus on clean, minimal design and eye comfort, the Nord palette consists of four main color sub-groups:

1. **Polar Night**: Dark shades used for backgrounds and UI elements in dark mode
2. **Snow Storm**: Light shades used for backgrounds and UI elements in light mode
3. **Frost**: Vibrant blue accent colors
4. **Aurora**: Colorful accent shades for notifications, errors, and highlighting

## Color System

The color system uses CSS variables defined in `src/styles/globals.css` and is accessible through Tailwind CSS classes via the configuration in `tailwind.config.ts`.

### Light Theme

The light theme uses Nord's Snow Storm colors for the background and Polar Night colors for text:

- **Background**: Snow Storm (`#ECEFF4`) - Clean, light background
- **Foreground**: Polar Night (`#2E3440`) - Dark, easy-to-read text
- **Primary**: Frost Blue (`#5E81AC`) - Main accent color
- **Secondary**: Snow Storm Medium (`#E5E9F0`) - Secondary UI elements
- **Accent**: Frost Light Blue (`#88C0D0`) - Highlighting or accenting elements
- **Destructive**: Aurora Red (`#BF616A`) - Error states and warnings
- **Border**: Snow Storm Dark (`#D8DEE9`) - Subtle borders
- **Chart Colors**: A combination of Frost and Aurora colors for data visualization

### Dark Theme

The dark theme uses Nord's Polar Night colors for the background and Snow Storm colors for text:

- **Background**: Polar Night Darkest (`#2E3440`) - Deep, eye-friendly background
- **Foreground**: Snow Storm Light (`#ECEFF4`) - Crisp text on dark backgrounds
- **Primary**: Frost Light Blue (`#88C0D0`) - Main accent color
- **Secondary**: Polar Night Medium (`#434C5E`) - Secondary UI elements
- **Accent**: Frost Medium Blue (`#81A1C1`) - Highlighting or accenting elements
- **Destructive**: Aurora Red (`#BF616A`) - Error states and warnings
- **Border**: Polar Night Light (`#4C566A`) - Subtle borders
- **Chart Colors**: A blend of Frost and Aurora colors optimized for dark backgrounds

## Usage

### With Tailwind CSS

```jsx
// Example of using Nord theme colors with Tailwind CSS
<button className="bg-primary text-primary-foreground">
  Primary Button
</button>

<div className="bg-background text-foreground p-4 border border-border rounded-lg">
  Content area with Nord-themed colors
</div>

<span className="text-muted-foreground">
  This is muted text
</span>
```

### With CSS Variables

```css
/* Example of using Nord theme colors with CSS variables */
.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--border));
}
```

### Theme Switching

The theme can be switched using the `ThemeToggle` component, which leverages the `next-themes` library:

```jsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

// In your component
<ThemeToggle />
```

## Color Accessibility

The Nord color scheme has been carefully designed with accessibility in mind:
- All text colors maintain proper contrast against their backgrounds (meeting WCAG standards)
- The palette uses a focused set of hues to create a cohesive, calm visual experience
- The color combinations avoid issues for users with color vision deficiencies

## Sidebar Theme

The sidebar has its own Nord-themed variables:
- `--sidebar-background`: Slightly different from main background for visual separation
- `--sidebar-foreground`: Text color for the sidebar
- `--sidebar-primary`: Primary accent color for the sidebar
- `--sidebar-border`: Border color for sidebar elements

## Chart Colors

The chart colors use a combination of Frost and Aurora colors from the Nord palette:
- **Light Mode**: Frost blues transitioning to Aurora green and orange
- **Dark Mode**: Frost blues and teals transitioning to Aurora green, yellow, and orange

These colors are accessible through Tailwind using the `chart-1` through `chart-5` classes. 