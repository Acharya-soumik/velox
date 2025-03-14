# Velox - Next.js Application

A modern web application built with Next.js, TypeScript, Supabase, and Shadcn UI. This application includes authentication, resume building, and DSA (Data Structures & Algorithms) problem-solving features.

## Project Structure

The project is organized into the following main directories:

```
/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth-pages)/     # Authentication pages (sign-in, sign-up, etc.)
│   ├── api/              # API routes
│   ├── auth/             # Auth-related routes (callbacks, etc.)
│   ├── dashboard/        # Dashboard pages
│   ├── problems/         # DSA problem pages
│   ├── profile/          # User profile pages
│   └── resume/           # Resume-related pages
├── components/           # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Common/shared components
│   ├── dsa/              # DSA-related components
│   ├── profile/          # Profile components
│   ├── resume/           # Resume components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utility functions and libraries
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
    └── supabase/         # Supabase client utilities
```

## Features

- **Authentication**: Sign up, sign in, password reset, and OAuth authentication
- **Resume Builder**: Create, edit, and manage resumes with different templates
- **DSA Problems**: Solve and practice data structures and algorithms problems
- **Profile Management**: Manage user profiles and settings

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Authentication & Database**: Supabase
- **State Management**: React Context and Hooks
- **Styling**: Tailwind CSS
- **Code Execution**: Pyodide (Python in the browser)

## Component Organization

Components are organized by module and functionality:

- **Auth Components**: Authentication-related components
- **Common Components**: Shared components used across modules
- **DSA Components**: Components for the DSA module
- **Resume Components**: Components for the resume builder
- **Profile Components**: User profile components
- **UI Components**: Base UI components from Shadcn UI

## Route Protection

Routes are protected using middleware authentication checks:

- Public routes: `/sign-in`, `/sign-up`, `/forgot-password`, `/auth/callback`, `/api/auth`
- All other routes require authentication
- Special routes like `/resume/new` have additional checks (e.g., user must have a profile)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Documentation

Each major directory contains a README.md file with more detailed documentation:

- [App Directory Structure](./app/README.md)
- [Components Organization](./components/README.md)
- [DSA Components](./components/dsa/README.md)
- [Common Components](./components/common/README.md)
- [Resume Components](./components/resume/README.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
