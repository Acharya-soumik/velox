# Common Components

This directory contains common components that are used across multiple modules of the application.

## Directory Structure

- `/buttons`: Reusable button components
  - `submit-button.tsx`: Form submission button with loading state

- `/layout`: Layout-related components
  - `header-auth.tsx`: Authentication header with sign-in/sign-out functionality

- `/ui`: General UI components
  - `theme-switcher.tsx`: Theme switching component (light/dark/system)

## Usage

### Submit Button

```tsx
import { SubmitButton } from "@/components/common/buttons/submit-button";

// In your form
<form action={yourFormAction}>
  <SubmitButton pendingText="Processing...">
    Submit
  </SubmitButton>
</form>
```

### Header Auth

```tsx
import HeaderAuth from "@/components/common/layout/header-auth";

// In your layout
<nav>
  <HeaderAuth />
</nav>
```

### Theme Switcher

```tsx
import { ThemeSwitcher } from "@/components/common/ui/theme-switcher";

// In your component
<div>
  <ThemeSwitcher />
</div>
``` 