# Components Organization

This directory contains all the React components used in the application, organized by module and functionality.

## Directory Structure

- `/auth`: Authentication related components
  - `/forms`: Auth forms (sign-in, sign-up, etc.)
  - `/ui`: Auth-specific UI elements

- `/common`: Common/shared components used across modules
  - `/buttons`: Button components
  - `/layout`: Layout components (header, footer, etc.)
  - `/ui`: General UI components

- `/dsa`: Data Structures & Algorithms components
  - `/problems`: Problem-related components
  - `/editor`: Code editor components

- `/resume`: Resume-related components
  - Resume generation, templates, and related functionality

- `/profile`: User profile components
  - Profile management and display

- `/ui`: Shadcn UI components
  - Base UI components from Shadcn UI library

## Component Naming Conventions

- Use PascalCase for component names (e.g., `SubmitButton.tsx`)
- Use kebab-case for directory names (e.g., `/common/buttons`)
- Group related components in subdirectories
- Keep component files focused on a single responsibility

## Best Practices

1. **Imports**:
   - Use absolute imports with `@/` prefix
   - Group imports by type (React, external libraries, internal components)

2. **Props**:
   - Define prop types with TypeScript interfaces
   - Use destructuring for props
   - Provide default values when appropriate

3. **State Management**:
   - Use React hooks for local state
   - Use context for shared state when needed
   - Keep state as close to where it's used as possible

4. **Styling**:
   - Use Tailwind CSS for styling
   - Use the `cn` utility for conditional class names
   - Follow the project's design system

5. **Accessibility**:
   - Ensure components are accessible
   - Use semantic HTML elements
   - Include proper ARIA attributes when needed 