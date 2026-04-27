# Product Tour Customization Guide

## Overview
The product tour uses **Shepherd.js** library to create interactive step-by-step guides. The tour is defined in `app/components/tour/ProductTour.tsx`.

## How It Works

### 1. **Tour Triggers**
The tour can be triggered in three ways:
- **Auto-start**: Automatically starts when a user visits `/tasks` for the first time
- **Manual trigger**: User clicks "Start Product Tour" button in the sidebar
- **Event-based**: Dispatches `doit:start-tour` custom event

### 2. **Tour Storage**
- Uses `localStorage` key `doit-product-tour-v1` to track if tour is completed
- Uses `sessionStorage` key `doit-product-tour-pending` for deferred starts

### 3. **Data Attributes**
Elements that need to be highlighted in the tour use `data-tour` attributes:
```tsx
<button data-tour="create-task-page">Create Page</button>
<input data-tour="new-task-input" />
<button data-tour="ai-open-planner">AI Planner</button>
```

## Customizing the Tour

### Adding a New Step

```typescript
tour.addStep({
  id: "unique-step-id",                    // Unique identifier
  title: "Step Title",                     // Header text
  text: "Step description goes here",      // Body text
  attachTo: { 
    element: '[data-tour="element-id"]',   // Target element selector
    on: "bottom"                           // Position: top, bottom, left, right
  },
  buttons: [
    {
      text: "Back",
      action: () => tour.back(),
      classes: "shepherd-button-secondary"
    },
    {
      text: "Next",
      action: () => tour.next(),
      classes: "shepherd-button-primary"
    }
  ]
});
```

### Step with Async Actions

If you need to open a modal or wait for an element before showing the step:

```typescript
tour.addStep({
  id: "my-step",
  title: "My Step",
  text: "Description",
  beforeShowPromise: async () => {
    // Click a button to open modal
    const button = document.querySelector('[data-tour="open-modal"]');
    if (button) {
      (button as HTMLButtonElement).click();
      await delay(300); // Wait for animation
    }
    
    // Wait for element to appear
    await waitForSelector('[data-tour="modal-content"]', 5000);
  },
  attachTo: { element: '[data-tour="modal-content"]', on: "left" },
  buttons: baseButtons,
});
```

### Modifying Existing Steps

Find the step by its `id` in `ProductTour.tsx` and modify:

```typescript
// Example: Change the "Create Task Pages" step
tour.addStep({
  id: "create-page",
  title: "Your New Title",                    // ← Change this
  text: "Your new description",               // ← Change this
  attachTo: { 
    element: '[data-tour="create-task-page"]',
    on: "right"                               // ← Change position
  },
  buttons: [baseButtons[1]],
});
```

### Removing a Step

Simply delete or comment out the `tour.addStep()` block for that step.

### Changing Step Order

Reorder the `tour.addStep()` calls. Steps execute in the order they're added.

## Styling the Tour

### CSS Customization

The tour uses class `doit-tour-step`. Add custom styles in your global CSS:

```css
/* In app/globals.css */
.doit-tour-step {
  /* Customize the tour popup */
  background: var(--color-surface) !important;
  border: 2px solid var(--color-primary) !important;
  border-radius: 12px !important;
}

.doit-tour-step .shepherd-title {
  /* Customize title */
  color: var(--color-primary) !important;
  font-size: 18px !important;
}

.doit-tour-step .shepherd-text {
  /* Customize description */
  color: var(--color-foreground) !important;
}

.shepherd-button-primary {
  /* Customize primary button */
  background: var(--color-primary) !important;
  color: white !important;
}

.shepherd-button-secondary {
  /* Customize secondary button */
  background: var(--color-muted) !important;
}
```

### Overlay Customization

```css
.shepherd-modal-overlay-container {
  /* Customize the dark overlay */
  background: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(4px) !important;
}
```

## Adding Tour Targets to New Components

When creating new features you want to include in the tour:

1. **Add data-tour attribute to the element:**
```tsx
<button data-tour="my-new-feature">
  My Feature
</button>
```

2. **Add a step in ProductTour.tsx:**
```typescript
tour.addStep({
  id: "my-new-feature",
  title: "New Feature",
  text: "This is how you use the new feature",
  attachTo: { element: '[data-tour="my-new-feature"]', on: "bottom" },
  buttons: baseButtons,
});
```

## Tour Configuration Options

### Default Step Options

```typescript
const tour = new Shepherd.Tour({
  useModalOverlay: true,              // Dark overlay behind tour
  defaultStepOptions: {
    classes: "doit-tour-step",        // CSS class
    cancelIcon: { enabled: true },    // Show X button
    scrollTo: { 
      behavior: "smooth",             // Smooth scroll
      block: "center"                 // Center element
    },
  },
});
```

### Button Configurations

```typescript
// Skip button
{
  text: "Skip Tour",
  action: () => tour.cancel(),
  classes: "shepherd-button-secondary"
}

// Complete button
{
  text: "Finish",
  action: () => tour.complete(),
  classes: "shepherd-button-primary"
}

// Custom action button
{
  text: "Learn More",
  action: () => window.open('/docs', '_blank'),
  classes: "shepherd-button-secondary"
}
```

## Resetting the Tour

Users can restart the tour by:
1. Clicking "Start Product Tour" in the sidebar
2. Or programmatically: `localStorage.removeItem('doit-product-tour-v1')`

## Testing the Tour

1. Clear localStorage: `localStorage.removeItem('doit-product-tour-v1')`
2. Navigate to `/tasks` page
3. Tour should auto-start after 420ms

Or click "Start Product Tour" button in sidebar to force start.

## Common Issues

### Element Not Found
- Ensure `data-tour` attribute exists on the target element
- Use `beforeShowPromise` to wait for dynamic elements
- Check if element is hidden by CSS

### Tour Not Starting
- Check if `TOUR_STORAGE_KEY` is set to "done" in localStorage
- Ensure you're on a `/tasks` route
- Check browser console for errors

### Step Positioning Issues
- Try different `on` values: "top", "bottom", "left", "right"
- Ensure target element has proper dimensions
- Check if element is inside a scrollable container

## Advanced: Multi-Page Tours

To create tours across different pages:

```typescript
tour.addStep({
  id: "navigate-to-dashboard",
  title: "Let's Go to Dashboard",
  text: "Click next to navigate to the dashboard",
  buttons: [
    {
      text: "Next",
      action: () => {
        router.push('/dashboard');
        tour.next();
      }
    }
  ]
});
```

## Resources

- [Shepherd.js Documentation](https://shepherdjs.dev/)
- [Shepherd.js Examples](https://shepherdjs.dev/docs/examples.html)
- [Shepherd.js API Reference](https://shepherdjs.dev/docs/Tour.html)
