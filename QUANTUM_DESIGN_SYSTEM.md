# Quantum Design System

A comprehensive design system for the Quantum Risk Coach application, implementing a futuristic, glassmorphic interface with precise spacing, animations, and color harmony.

## 🌌 Visual Essence & Color System

### Core Colors

| Element | Hex Code | Usage Context |
|---------|----------|---------------|
| Primary Background | `#0B0F1A` | Deep matte navy base |
| Secondary Background | `#1A2233` | Dimmed steel blue overlays |
| Accent Glow | `#2DF4FF` | Electric cyan for active states |
| Button Idle | `#1C1C2C` | Graphite black with faint glow |
| Button Active Gradient | `#2DF4FF → #A34EFF` | Tap animation & feedback |
| Primary Text | `#F4F4F4` | Clean white for headings |
| Secondary Text | `#B2B2B2` | Mist gray for subtext |
| Chart Line (Profit) | `#B6F080` | Soft lime green |
| Chart Line (Loss) | `#FF6F61` | Coral red |
| Divider / Border | `#CCCCCC40` | Transparent silver |

### CSS Variables

The design system uses CSS custom properties for consistent theming:

```css
:root {
  --background: 220 23% 6%; /* #0B0F1A */
  --foreground: 210 40% 98%; /* #F4F4F4 */
  --primary: 187 100% 58%; /* #2DF4FF */
  --quantum-glow: 0 0 12px rgba(45, 244, 255, 0.5);
  --quantum-glow-active: 0 0 20px rgba(45, 244, 255, 0.8);
  --quantum-pulse: 0 0 30px rgba(45, 244, 255, 0.3);
}
```

## 📐 Interface Layout & Dimensions

### Component Specifications

| Component | Size / Spacing | Behavior / Notes |
|-----------|----------------|------------------|
| Button (Primary) | Height: 48dp, Width: 160dp | Rounded corners 12dp, glow on tap |
| Button (Icon-only) | Height: 44dp, Width: 44dp | Circular, used for quick actions |
| Card Modules | Padding: 16dp, Corner Radius: 16dp | Glassy blur with backdrop-filter blur(10px) |
| Panel Margin | Horizontal: 24dp, Vertical: 16dp | Breathing room between stacked elements |
| Text Field Height | 56dp | Includes label, input, and underline |
| Icon Size | 24dp standard, 32dp for key actions | Scales with button size |
| Chart Container | Min Height: 240dp, Max Width: 100% | Responsive to screen size |

## 🪄 Component Library

### Button Component

```tsx
import { Button } from '@/components/ui/button'

// Quantum primary button with gradient
<Button variant="quantum" size="default">
  Quantum Primary
</Button>

// Status variants
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">⚡</Button>

// Loading state
<Button loading>Loading...</Button>
```

**Variants:**
- `default` - Standard button with quantum styling
- `quantum` - Primary gradient button with glow
- `outline` - Transparent with border
- `secondary` - Secondary styling
- `ghost` - Minimal styling
- `link` - Link appearance
- `success` - Green gradient
- `warning` - Yellow gradient
- `destructive` - Red gradient

### Input Component

```tsx
import { Input } from '@/components/ui/input'

// Quantum input with glow effect
<Input variant="quantum" placeholder="Enter text..." />

// Variants
<Input variant="default" placeholder="Default..." />
<Input variant="glass" placeholder="Glass effect..." />
```

**Features:**
- 56dp height for optimal touch interaction
- Backdrop blur effects
- Quantum glow on focus
- Proper contrast ratios

### Card Component

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card variant="quantum">
  <CardHeader>
    <CardTitle>Quantum Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content with glassmorphism effects
  </CardContent>
</Card>
```

**Variants:**
- `default` - Standard card styling
- `quantum` - Glassmorphism with glow effects
- `glass` - Transparent with blur

### Quantum Panel

```tsx
import { QuantumPanel } from '@/components/ui/quantum-panel'

<QuantumPanel variant="glass" padding="lg" glow>
  <h2>Panel Content</h2>
  <p>With glassmorphism effects and proper spacing</p>
</QuantumPanel>
```

**Props:**
- `variant`: "default" | "glass" | "elevated"
- `padding`: "none" | "sm" | "md" | "lg"
- `margin`: "none" | "sm" | "md" | "lg"
- `blur`: boolean (default: true)
- `glow`: boolean (default: false)

### Quantum Loader

```tsx
import { QuantumLoader } from '@/components/ui/quantum-loader'

// Pulse animation
<QuantumLoader variant="pulse" size="lg" color="cyan" />

// Spinner
<QuantumLoader variant="spinner" size="md" color="violet" />

// Bouncing dots
<QuantumLoader variant="dots" size="sm" color="green" />
```

**Variants:**
- `pulse` - Radial pulse animation
- `spinner` - Classic spinning loader
- `dots` - Bouncing dots sequence

**Colors:**
- `default` / `cyan` - #2DF4FF
- `violet` - #A34EFF
- `green` - #B6F080

### Quantum Chart Container

```tsx
import { QuantumChart } from '@/components/ui/quantum-chart'

<QuantumChart variant="glass" minHeight="lg" loading>
  {/* Chart content */}
</QuantumChart>
```

**Props:**
- `variant`: "default" | "glass" | "elevated"
- `minHeight`: "sm" | "md" | "lg" | "xl"
- `responsive`: boolean (default: true)
- `loading`: boolean (default: false)

## 📱 Touch Feedback & Motion Dynamics

### Animation Specifications

- **Tap**: Buttons scale to 0.95x with ripple glow
- **Hover**: Elements translate -2px with glow effect
- **Focus**: Quantum glow with 12px blur radius
- **Loading**: Radial pulse or animated data points
- **Transitions**: 300ms cubic-bezier(0.4, 0, 0.2, 1)

### Ripple Effect

Buttons include a ripple effect that expands from the tap point:

```tsx
<Button ripple>Button with Ripple</Button>
```

### Micro-interactions

- Hover shimmer on desktop
- Animated tooltips from edges
- Inactive panels dim to 80% opacity
- Smooth transitions between states

## 🎨 Usage Guidelines

### Typography

```css
/* Primary headings */
.text-4xl.font-bold.text-[#F4F4F4]

/* Secondary headings */
.text-2xl.font-semibold.text-[#F4F4F4]

/* Body text */
.text-[#B2B2B2]

/* Status colors */
.text-[#B6F080] /* Profit/Positive */
.text-[#FF6F61] /* Loss/Negative */
.text-[#2DF4FF] /* Accent/Active */
```

### Spacing System

```css
/* Panel margins */
.m-6 /* 24dp horizontal, 16dp vertical */

/* Card padding */
.p-6 /* 16dp padding */

/* Component spacing */
.space-y-6 /* 24dp between elements */
```

### Background Gradients

```css
/* Primary gradient */
background: linear-gradient(135deg, #0B0F1A, #1A2233)

/* Button active gradient */
background: linear-gradient(135deg, #2DF4FF, #A34EFF)

/* Glass effect */
background: rgba(26, 34, 51, 0.8)
backdrop-filter: blur(10px)
```

## 🚀 Implementation Examples

### Basic Form

```tsx
<QuantumPanel variant="glass" padding="lg">
  <h2 className="text-2xl font-semibold text-[#F4F4F4] mb-6">Form Title</h2>
  
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-[#B2B2B2] mb-2">
        Label
      </label>
      <Input variant="quantum" placeholder="Enter value..." />
    </div>
    
    <Button variant="quantum" className="w-full">
      Submit
    </Button>
  </div>
</QuantumPanel>
```

### Data Display

```tsx
<QuantumPanel variant="default" padding="lg">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card variant="quantum">
      <CardHeader>
        <CardTitle>Metric</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-[#F4F4F4]">$1,234</p>
        <p className="text-[#B6F080] text-sm">+12.5%</p>
      </CardContent>
    </Card>
  </div>
</QuantumPanel>
```

### Loading State

```tsx
<QuantumPanel variant="glass" padding="lg">
  <div className="flex items-center justify-center space-x-4">
    <QuantumLoader variant="pulse" size="lg" color="cyan" />
    <p className="text-[#B2B2B2]">Loading data...</p>
  </div>
</QuantumPanel>
```

## 📱 Mobile Optimizations

### Touch Targets

- Minimum 44dp for touch targets
- 48dp for primary buttons
- 56dp for input fields
- Proper spacing between interactive elements

### Responsive Design

```css
@media (max-width: 768px) {
  .container {
    padding-left: 24px;
    padding-right: 24px;
  }
  
  .quantum-card {
    padding: 20px;
    border-radius: 20px;
  }
}
```

### Performance

- Hardware-accelerated animations
- Efficient backdrop-filter usage
- Optimized transition timing
- Reduced motion support

## 🎯 Accessibility

### Focus Management

- Visible focus indicators with quantum glow
- Proper tab order
- Keyboard navigation support
- Screen reader compatibility

### Color Contrast

- WCAG AA compliant contrast ratios
- High contrast mode support
- Color-blind friendly palette
- Semantic color usage

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🔧 Customization

### Theme Extension

```css
/* Custom quantum theme */
:root {
  --quantum-custom-glow: 0 0 15px rgba(255, 100, 200, 0.6);
  --quantum-custom-bg: linear-gradient(135deg, #1a1a2e, #16213e);
}
```

### Component Variants

```tsx
// Custom button variant
const customButtonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        custom: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      }
    }
  }
)
```

## 📚 Resources

- [Demo Page](/quantum-demo) - Interactive component showcase
- [Color Palette](/colors) - Complete color reference
- [Component API](/api) - Detailed component documentation
- [Design Tokens](/tokens) - CSS custom properties reference

---

This design system provides a cohesive, futuristic interface that balances aesthetics with functionality, ensuring excellent user experience across all devices and accessibility needs. 