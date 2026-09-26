# Frontend-Backend Integration Plan

## Overview

This document outlines how to integrate the React Admin Frontend with the FastAPI Backend Portfolio API.

**Backend:** FastAPI + MongoDB (60 API endpoints, JWT auth, GridFS media)
**Frontend:** React 19 + Vite 8 + Tailwind CSS v4 + shadcn (currently blank canvas)

---

## 1. Project Structure

```
Frontend/Admin/src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root with router
├── index.css                         # Tailwind + shadcn theme
│
├── lib/
│   └── utils.ts                      # cn() utility
│
├── services/
│   └── api.ts                        # Axios instance with JWT interceptor
│
├── hooks/
│   ├── use-auth.ts                   # Auth context hook
│   └── use-api.ts                    # Generic fetch/CRUD hook
│
├── contexts/
│   └── auth-context.tsx              # Auth state + token management
│
├── types/
│   ├── index.ts                      # Re-exports all types
│   ├── profile.ts                    # ProfileModel types
│   ├── experience.ts                 # ExperienceModel types
│   ├── education.ts                  # EducationModel types
│   ├── project.ts                    # ProjectModel types
│   ├── skill.ts                      # SkillModel types
│   ├── certification.ts              # CertificationModel types
│   ├── achievement.ts                # AchievementModel types
│   ├── social.ts                     # SocialLinkModel types
│   ├── settings.ts                   # SiteSettingsModel types
│   ├── message.ts                    # ContactMessageModel types
│   └── api.ts                        # API response types
│
├── components/
│   ├── ui/                           # shadcn components (install as needed)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── badge.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── toast.tsx / toaster.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── admin-layout.tsx          # Sidebar + topbar + main content area
│   │   ├── sidebar.tsx               # Navigation sidebar
│   │   └── topbar.tsx                # Header with user info + logout
│   │
│   ├── shared/
│   │   ├── data-table.tsx            # Reusable table with sorting/pagination
│   │   ├── image-upload.tsx          # File upload with preview (GridFS)
│   │   ├── confirm-dialog.tsx        # Delete confirmation modal
│   │   ├── loading-spinner.tsx       # Loading state
│   │   ├── empty-state.tsx           # No data placeholder
│   │   ├── search-input.tsx          # Search/filter input
│   │   └── page-header.tsx           # Page title + description + actions
│   │
│   └── features/
│       ├── auth/
│       │   └── login-form.tsx        # Login form component
│       ├── profile/
│       │   ├── profile-form.tsx      # Edit profile form
│       │   └── profile-preview.tsx   # Profile card preview
│       ├── experience/
│       │   ├── experience-form.tsx   # Create/edit experience form
│       │   └── experience-card.tsx   # Experience list item
│       ├── education/
│       │   ├── education-form.tsx    # Create/edit education form
│       │   └── education-card.tsx    # Education list item
│       ├── projects/
│       │   ├── project-form.tsx      # Create/edit project form
│       │   ├── project-card.tsx      # Project list item
│       │   └── project-gallery.tsx   # Image gallery manager
│       ├── skills/
│       │   ├── skill-form.tsx        # Create/edit skill form
│       │   └── skill-badge.tsx       # Skill display badge
│       ├── certifications/
│       │   ├── cert-form.tsx         # Create/edit certification form
│       │   └── cert-card.tsx         # Certification list item
│       ├── achievements/
│       │   ├── achievement-form.tsx  # Create/edit achievement form
│       │   └── achievement-card.tsx  # Achievement list item
│       ├── socials/
│       │   ├── social-form.tsx       # Create/edit social link form
│       │   └── social-card.tsx       # Social link list item
│       ├── settings/
│       │   ├── settings-form.tsx     # Site settings form
│       │   └── seo-form.tsx          # SEO settings form
│       └── messages/
│           ├── message-list.tsx      # Contact messages list
│           └── message-detail.tsx    # Single message view
│
└── pages/
    ├── login-page.tsx                # Login page
    ├── dashboard-page.tsx            # Dashboard overview
    ├── profile-page.tsx              # Profile management
    ├── experience-page.tsx           # Experience CRUD
    ├── education-page.tsx            # Education CRUD
    ├── projects-page.tsx             # Projects CRUD
    ├── skills-page.tsx               # Skills CRUD
    ├── certifications-page.tsx       # Certifications CRUD
    ├── achievements-page.tsx         # Achievements CRUD
    ├── socials-page.tsx              # Social links CRUD
    ├── messages-page.tsx             # Contact messages
    └── settings-page.tsx             # Site settings
```

---

## 2. Routing Setup

### Install Package
```bash
npm install react-router-dom
```

### Route Definitions

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/login` | LoginPage | No | Admin login |
| `/` | DashboardPage | Yes | Overview/stats |
| `/profile` | ProfilePage | Yes | Edit profile |
| `/experience` | ExperiencePage | Yes | Manage experience |
| `/education` | EducationPage | Yes | Manage education |
| `/projects` | ProjectsPage | Yes | Manage projects |
| `/skills` | SkillsPage | Yes | Manage skills |
| `/certifications` | CertificationsPage | Yes | Manage certifications |
| `/achievements` | AchievementsPage | Yes | Manage achievements |
| `/socials` | SocialsPage | Yes | Manage social links |
| `/messages` | MessagesPage | Yes | Contact messages |
| `/settings` | SettingsPage | Yes | Site settings |

### App.tsx Router Setup
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import AdminLayout from '@/components/layout/admin-layout'
import LoginPage from '@/pages/login-page'
import ProtectedRoute from '@/components/shared/protected-route'

// All page imports...

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/socials" element={<SocialsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

---

## 3. API Service Layer

### Base Configuration (`services/api.ts`)

```typescript
// Base URL from env: VITE_API_URL (default: http://localhost:8000)
// Axios instance with:
// - baseURL: VITE_API_URL + /api/v1
// - Authorization header interceptor (reads token from localStorage)
// - Response error interceptor (401 -> redirect to /login)
```

### API Methods by Resource

| Resource | Methods | Backend Endpoint |
|----------|---------|------------------|
| Auth | `login(email, password)`, `getMe()` | `POST /auth/login`, `GET /auth/me` |
| Profile | `getProfile()`, `updateProfile(data)` | `GET/PUT /admin/profile` |
| Experience | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/experiences/*` |
| Education | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/education/*` |
| Projects | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/projects/*` |
| Skills | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/skills/*` |
| Certifications | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/certifications/*` |
| Achievements | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/achievements/*` |
| Social Links | `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)` | `/admin/social-links/*` |
| Settings | `getSettings()`, `updateSettings(data)` | `GET/PUT /admin/settings` |
| Messages | `getAll()`, `getById(id)`, `markRead(id)`, `delete(id)`, `getUnreadCount()` | `/admin/messages/*` |
| Media | `upload(file, folder, alt)`, `delete(fileId)` | `POST/DELETE /media/*` |

---

## 4. Authentication Flow

### Token Storage
- Store `access_token` in `localStorage` under key `admin_token`
- On app load, check if token exists and call `GET /auth/me` to validate
- If invalid/expired, redirect to `/login`

### Auth Context Shape
```typescript
interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
```

### Login Flow
1. User submits email + password on `/login`
2. `POST /api/v1/auth/login` with `{ email, password }`
3. Receive `{ access_token, token_type }`
4. Store token in localStorage
5. Redirect to `/` (dashboard)

### Protected Routes
- Wrap admin layout in `<ProtectedRoute>` component
- Check token exists in localStorage
- Call `GET /api/v1/auth/me` to verify token is valid
- If 401 response, clear token and redirect to `/login`

---

## 5. State Management

### Approach: React Context + Local State

For this admin panel (single user, CRUD operations), we don't need heavy state management. Use:

1. **Auth Context** - Token + auth state (single context)
2. **Local component state** - Form data, UI state
3. **React Query (optional)** - Server state caching, refetching

### Optional: Install React Query
```bash
npm install @tanstack/react-query
```

Benefits for admin CRUD:
- Auto-refetch after mutations
- Loading/error states
- Optimistic updates
- Cache invalidation

---

## 6. Pages Implementation Plan

### Login Page
- Simple form: email input, password input, submit button
- Call `POST /auth/login`
- Store token, redirect to dashboard

### Dashboard Page
- Welcome message with admin name
- Quick stats cards (total projects, skills, messages, etc.)
- Recent messages preview
- Quick actions (add project, view messages)

### Profile Page
- Single form to edit profile fields
- Image upload for profile picture (uses GridFS via `/media/upload`)
- Fields: name, headline, short_bio, about, location, email, phone, resume_url, availability

### Experience Page
- List of experiences in a table/cards
- Add new experience button
- Edit/Delete actions per item
- Form: company, position, employment_type, location, start_date, end_date, is_current, description, technologies (tag input), company_url, logo upload

### Education Page
- Same pattern as Experience
- Form: institution, degree, field, start_date, end_date, description, grade, location, logo upload

### Projects Page
- List with thumbnails
- Add new project
- Form: title, slug (auto-generate from title), short_description, description (rich text), technologies (tag input), github_url, live_url, featured toggle, status dropdown, thumbnail upload, images gallery upload

### Skills Page
- Grid/list of skill badges
- Add new skill
- Form: name, category, level (dropdown), icon, display_order

### Certifications Page
- List with issuer info
- Add new certification
- Form: title, issuer, issue_date, credential_id, credential_url, certificate_image upload

### Achievements Page
- List of achievements
- Add new achievement
- Form: title, description, date, url, icon, display_order

### Social Links Page
- List of social links with platform icons
- Add new link
- Form: platform, url, icon, display_order, enabled toggle

### Messages Page
- List of contact messages (newest first)
- Unread count badge
- Click to view full message
- Mark as read / Delete actions

### Settings Page
- Site name, tagline, footer text
- Maintenance mode toggle
- SEO settings (meta_title, meta_description, og_image, site_url, google_analytics_id)

---

## 7. Media Upload Integration

### How It Works
1. User selects image in `<input type="file">`
2. Frontend sends `POST /api/v1/media/upload` with `multipart/form-data`
   - Body: `file` (binary), `folder` (string), `alt` (string)
3. Backend stores in MongoDB GridFS
4. Returns `{ file_id, url, alt, filename, content_type, size }`
5. Frontend stores this `MediaObject` in the entity's image field
6. Image displayed via `<img src={apiBase + mediaObject.url} />`

### Upload Component
Create a reusable `<ImageUpload>` component that:
- Shows current image (if editing)
- Allows file selection
- Uploads to `/media/upload`
- Returns `MediaObject` to parent form
- Handles delete of old image via `/media/{file_id}`

---

## 8. Installation Checklist

### Packages to Install
```bash
# Routing
npm install react-router-dom

# HTTP client (choose one)
npm install axios

# Optional: Server state management
npm install @tanstack/react-query

# Optional: Form handling
npm install react-hook-form @hookform/resolvers zod

# shadcn components (install as needed)
npx shadcn@latest add input card dialog table form badge
npx shadcn@latest add dropdown-menu alert-dialog toast
npx shadcn@latest add avatar separator tabs select
npx shadcn@latest add textarea label switch sheet
npx shadcn@latest add command popover calendar
```

### Environment Variables (`.env`)
```
VITE_API_URL=http://localhost:8000
```

---

## 9. Implementation Order

### Phase 1: Foundation
1. Install packages (react-router-dom, axios)
2. Set up routing in App.tsx
3. Create API service layer (`services/api.ts`)
4. Create auth context + hook
5. Create login page + login form
6. Create protected route component
7. Create admin layout (sidebar + topbar)

### Phase 2: Core Pages
8. Dashboard page (overview)
9. Profile page (GET/PUT)
10. Skills page (CRUD)
11. Experience page (CRUD)
12. Education page (CRUD)

### Phase 3: Content Pages
13. Projects page (CRUD + image upload)
14. Certifications page (CRUD + image upload)
15. Achievements page (CRUD)
16. Social links page (CRUD)

### Phase 4: Management Pages
17. Messages page (list + read + delete)
18. Settings page (GET/PUT)
19. Media upload component (reusable)
20. Image upload integration in all forms

### Phase 5: Polish
21. Loading states + error handling
22. Form validation (Zod schemas)
23. Toast notifications for success/error
24. Responsive design
25. Dark mode toggle

---

## 10. Backend API Quick Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Auth Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### All Endpoints

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/auth/login` | `{ email, password }` | No |
| GET | `/auth/me` | - | Yes |
| GET | `/admin/profile` | - | Yes |
| PUT | `/admin/profile` | `ProfileUpdate` | Yes |
| GET | `/admin/experiences` | - | Yes |
| POST | `/admin/experiences` | `ExperienceCreate` | Yes |
| PUT | `/admin/experiences/:id` | `ExperienceUpdate` | Yes |
| DELETE | `/admin/experiences/:id` | - | Yes |
| GET | `/admin/education` | - | Yes |
| POST | `/admin/education` | `EducationCreate` | Yes |
| PUT | `/admin/education/:id` | `EducationUpdate` | Yes |
| DELETE | `/admin/education/:id` | - | Yes |
| GET | `/admin/projects` | - | Yes |
| POST | `/admin/projects` | `ProjectCreate` | Yes |
| PUT | `/admin/projects/:id` | `ProjectUpdate` | Yes |
| DELETE | `/admin/projects/:id` | - | Yes |
| GET | `/admin/skills` | - | Yes |
| POST | `/admin/skills` | `SkillCreate` | Yes |
| PUT | `/admin/skills/:id` | `SkillUpdate` | Yes |
| DELETE | `/admin/skills/:id` | - | Yes |
| GET | `/admin/certifications` | - | Yes |
| POST | `/admin/certifications` | `CertificationCreate` | Yes |
| PUT | `/admin/certifications/:id` | `CertificationUpdate` | Yes |
| DELETE | `/admin/certifications/:id` | - | Yes |
| GET | `/admin/achievements` | - | Yes |
| POST | `/admin/achievements` | `AchievementCreate` | Yes |
| PUT | `/admin/achievements/:id` | `AchievementUpdate` | Yes |
| DELETE | `/admin/achievements/:id` | - | Yes |
| GET | `/admin/social-links` | - | Yes |
| POST | `/admin/social-links` | `SocialLinkCreate` | Yes |
| PUT | `/admin/social-links/:id` | `SocialLinkUpdate` | Yes |
| DELETE | `/admin/social-links/:id` | - | Yes |
| GET | `/admin/settings` | - | Yes |
| PUT | `/admin/settings` | `SiteSettingsUpdate` | Yes |
| GET | `/admin/messages` | - | Yes |
| GET | `/admin/messages/unread-count` | - | Yes |
| PUT | `/admin/messages/:id/read` | - | Yes |
| DELETE | `/admin/messages/:id` | - | Yes |
| POST | `/media/upload` | `multipart/form-data` | Yes |
| DELETE | `/media/:file_id` | - | Yes |
| GET | `/media/:file_id` | - | No |
| GET | `/public/portfolio` | - | No |

---

## 11. Key Decisions to Discuss

1. **State Management**: React Context only, or add React Query?
2. **Form Handling**: Plain state, or react-hook-form + Zod validation?
3. **Rich Text**: Project descriptions - plain textarea or rich editor?
4. **Image Upload**: Direct upload, or drag-and-drop with preview?
5. **Notifications**: Toast library choice (sonner, react-hot-toast, shadcn toast)?
6. **Layout**: Sidebar always visible, or collapsible?
7. **Dark Mode**: Toggle in topbar, or system preference?
