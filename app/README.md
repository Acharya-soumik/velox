# App Directory Structure

This directory contains all the Next.js app router pages and API routes, organized by module and functionality.

## Directory Structure

- `/auth`: Authentication-related routes
  - `/callback`: OAuth callback handling

- `/(auth-pages)`: Authentication pages
  - `/sign-in`: Sign-in page
  - `/sign-up`: Sign-up page
  - `/forgot-password`: Password recovery page

- `/dashboard`: Dashboard pages
  - `/reset-password`: Password reset page

- `/profile`: User profile pages

- `/problems`: DSA problem pages
  - `/new`: Create new problem page
  - `/[id]`: Problem detail page

- `/resume`: Resume-related pages
  - `/new`: Create new resume page
  - `/[id]`: Resume detail page
  - `/profile`: Resume profile page

- `/api`: API routes
  - Various API endpoints for the application

## Route Protection

Routes are protected using middleware authentication checks:

- Public routes: `/sign-in`, `/sign-up`, `/forgot-password`, `/auth/callback`, `/api/auth`
- All other routes require authentication
- Special routes like `/resume/new` have additional checks (e.g., user must have a profile)

## File Structure

Each route typically includes:

- `page.tsx`: The main page component
- `layout.tsx` (optional): Layout wrapper for the route
- `loading.tsx` (optional): Loading state component
- `error.tsx` (optional): Error handling component
- `actions.ts` (optional): Server actions for the route

## Server vs. Client Components

- Use Server Components by default for better performance
- Use Client Components when you need interactivity or client-side state
- Mark client components with the `"use client"` directive at the top of the file 