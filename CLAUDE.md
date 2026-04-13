# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Typecheck and build for production (output to dist/)
npm run build

# Preview production build locally
npm run preview

# Deploy Supabase Edge Functions (requires Supabase CLI)
supabase functions deploy
```

## Project Overview

**KirinGo (麒麟智聘)** - AI-powered intelligent recruitment platform built with Vue 3 + Supabase. Full-stack web application connecting job seekers with recruiters, featuring AI resume optimization, AI mock interviews, resume-job matching, and real-time chat.

## Architecture

### Frontend
- **Framework**: Vue 3.5 with Composition API (`<script setup>` syntax)
- **Build Tool**: Vite 8
- **Language**: TypeScript 6
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS 4 with custom warm minimalist design system
- **Backend/Auth**: Supabase JS client

**Directory Structure**:
- `src/components/` - Reusable Vue components (PascalCase)
- `src/pages/` - Page components organized by route
- `src/composables/` - Composition API utilities
- `src/stores/` - Pinia state stores
- `src/lib/` - Database and API abstractions
- `src/router/` - Route configuration
- `src/types/` - Shared TypeScript type definitions
- `src/style.css` - Global styles and design system

### Backend (Supabase)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **AI Functions**: Supabase Edge Functions (Deno) with OpenAI integration
- **Vector Search**: pgvector extension for semantic search
- **Storage**: Supabase Storage for resumes and avatars

**Edge Functions** (`supabase/functions/`):
- `optimizeResume` - AI resume optimization with scoring
- `matchResumeJob` - AI resume-job match scoring
- `interviewAI` - AI-powered mock interview
- `parseResume` - Resume parsing from PDF/text
- `parseJob` - Job description parsing
- `generateChatMessage` - AI chat assistance

## Design System

The project follows the **Cursor-inspired warm minimalist design system** fully documented in `DESIGN.md`.

**Key Design Principles**:
- **Colors**: Warm cream `#f2f1ed` background, warm near-black `#26251e` text, accent orange `#f54e00`, error crimson `#cf2d56`
- **Borders**: Use `oklab()` color space for perceptually uniform warm borders
- **Shadows**: Large blur values (28px, 70px) for diffused atmospheric depth
- **Spacing**: 8px base unit with sub-8px increments (1.5px, 2px, 2.5px, etc.) for micro-adjustments
- **Hover**: Buttons/interactive elements shift text to `#cf2d56` on hover (signature pattern)
- **Radius**: 8px for buttons/cards, 9999px (full pill) for tags/filters

**Reference**: Always consult `DESIGN.md` when creating new components.

## Code Conventions

- Components: `PascalCase.vue` (e.g., `JobCard.vue`)
- Utilities: `camelCase.ts` (e.g., `useToast.ts`)
- All types exported from `src/types/index.ts`
- Comments and UI labels primarily in Chinese
- Pinia stores use setup (function-based) style
- Route-based code splitting with dynamic imports
- Database operations go through `src/lib/database.ts` abstraction

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
- Placeholder/empty values run the app in demo mode with mock data

## Database Schema

Complete schema in `supabase/schema.sql`. Core tables:
- `profiles` - User profiles (linked to `auth.users`)
- `companies` - Company information
- `jobs` - Job postings with vector embeddings
- `resumes` - Structured resume data
- `applications` - Job applications tracking
- `conversations` - Chat threads
- `messages` - Individual chat messages
- `interviews` - Saved AI mock interview sessions

All tables have RLS enabled with proper security policies.
