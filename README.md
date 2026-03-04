# StudyBuddyAI – Tech Summary for Interviews

Use this as a quick reference for what the project uses and how it fits together.

---

## 1. Project in One Sentence

**StudyBuddyAI** is an AI-powered student platform with role-based dashboards (Student / Mentor / Admin), an AI tutor (Ollama or Groq), Doc-Talk (PDF Q&A), resume builder with ATS scoring, study groups, resources, quizzes, tasks, achievements, and wellness content.

---

## 2. Frontend Stack

| Category | Technology | Version / Notes |
|----------|------------|------------------|
| **Framework** | React | 19.x |
| **Build / Dev** | Vite | 7.x |
| **Styling** | Tailwind CSS | 4.x (via `@tailwindcss/vite`) |
| **Routing** | React Router DOM | 7.x |
| **Icons** | Lucide React | — |
| **PDF/Export** | html2canvas, jspdf | Resume download / print |
| **State** | React Context (AuthContext) + local state | No Redux |
| **API calls** | `fetch` + `apiRequest()` helper | Token from `localStorage` |
| **Env** | `VITE_API_URL` | Default: `http://localhost:5000/api` |
| **Deploy** | Vercel | — |

**Key frontend concepts:**  
Single-page app (SPA), context for auth, `apiRequest` centralizes base URL + `Authorization: Bearer <token>`, protected routes by role.

---

## 3. Backend Stack

| Category | Technology | Version / Notes |
|----------|------------|------------------|
| **Runtime** | Node.js | 18+ (for native `fetch`) |
| **Framework** | Express | 4.x |
| **Module system** | ES Modules | `"type": "module"` |
| **Env** | dotenv | `.env` in `Backend/` |
| **Dev** | nodemon | `npm run dev` |

**Entry:** `server.js` — loads env, CORS, JSON body, mounts routes, runs Supabase connection test, starts server on `PORT` (default 5000).

---

## 4. Database & Data Layer

| Category | Technology | Notes |
|----------|------------|--------|
| **Database** | Supabase (PostgreSQL) | Hosted Postgres + REST/API via Supabase client |
| **Client** | `@supabase/supabase-js` | 2.x |
| **Config** | `Backend/config/supabase.js` | Builds URL from `SUPABASE_PROJECT_ID` or `SUPABASE_URL`, uses `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` |
| **Auth in DB** | Custom JWT (our own users table) | Not Supabase Auth; we use Supabase as DB only |
| **RLS** | Row Level Security | Policies use service role or anon where needed; custom JWT verified in our middleware, not `auth.uid()` |

**Main tables (conceptually):** `users`, `user_activity`, `study_groups`, `group_members`, `group_messages`, `tasks`, `quizzes`, `quiz_attempts`, resources, etc.

---

## 5. Authentication & Authorization

| Layer | What we use |
|-------|-------------|
| **Registration / Login** | Custom: store user in Supabase `users`, hash password with **bcryptjs**, issue **JWT** (jsonwebtoken) |
| **Secrets** | `JWT_SECRET` or `SUPABASE_JWT_SECRET`, `JWT_EXPIRE` (e.g. 7d) |
| **Protected routes** | Middleware `protect` in `Backend/middleware/auth.js`: reads `Authorization: Bearer <token>`, verifies JWT, loads user from `users`, sets `req.user` |
| **Role check** | Middleware `authorize(...roles)` — e.g. Admin-only routes |
| **Frontend** | Token in `localStorage`; `AuthContext` exposes user, login, logout; `getCurrentUser()` calls `/api/auth/me` |

**Interview phrasing:** “We use custom auth: bcrypt for passwords, JWT for sessions, and our own middleware to protect routes and enforce roles (Student, Mentor, Admin). Supabase is the database; we don’t use Supabase Auth.”

---

## 6. AI / LLM Stack

| Option | Technology | When it’s used |
|--------|------------|----------------|
| **Primary (optional)** | **Groq API** | If `GROQ_API_KEY` is set; model e.g. `llama-3.1-8b-instant` (`GROQ_MODEL`) |
| **Fallback / primary** | **Ollama** | If no Groq or Groq fails; `ollama` npm package; model e.g. **mistral** (`OLLAMA_MODEL`) |
| **Host** | `OLLAMA_API_URL` | Default `http://localhost:11434`; can point to remote Ollama (e.g. EC2) |

**Where:** `Backend/services/chatbotService.js` — `getChatbotResponse()` tries Groq first, then Ollama; supports modes: general chat, mental-support, resume-builder, resume-review, pdf-qa, student-helper.

**Interview phrasing:** “We support two backends: Groq for cloud and Ollama for self-hosted. The service tries Groq first if the key is set, then falls back to Ollama. We use models like Mistral or Llama depending on config.”

---

## 7. Document & Resume Features

| Feature | Tech | Notes |
|---------|------|--------|
| **PDF text extraction** | **pdf-parse** | Used in chatbot (Doc-Talk) and resume/ATS flow; runs in Node (require in ESM via `createRequire`) |
| **Resume ATS scoring** | **atsService.js** | Heuristic scoring (action verbs, metrics, buzzwords, readability); optional **APILayer** resume parser API (`APILAYER_KEY`) for extra parsing |
| **Resume PDF export** | Backend can use jspdf/html2canvas; frontend uses same for download | Resume builder builds content then exports to PDF |

**Interview phrasing:** “We use pdf-parse for text extraction from uploads, our own ATS heuristic for resume feedback, and optionally APILayer for parsing. PDF export is done with jspdf and html2canvas.”

---

## 8. File Upload & Other Backend Libs

| Need | Library |
|------|---------|
| File uploads | **Multer** |
| Email | **Nodemailer** (e.g. forgot password) |
| CORS | **cors** (Express middleware) |

“What is CORS?”
A browser mechanism that blocks cross-origin requests unless the server sends headers (or responds to the preflight) saying that the request’s origin is allowed.
“Why did you use CORS?”
Our frontend and API are on different origins (e.g. Vite on 5173, API on 5000). Without CORS, the browser would block the API responses.

---

## 9. API Design (Backend)

- **Style:** REST; JSON; base path `/api`.
- **Routes (all under `/api/...`):**
  - `auth` — register, login, me, forgot-password
  - `users` — user profile updates
  - `admin` — admin-only actions
  - `chatbot` — chat, PDF upload + chat, resume/ATS related
  - `resources` — resource CRUD
  - `groups` — study groups, members, messages
  - `activity` — user activity (protected)
  - `quizzes` — quizzes and attempts (protected)
  - `tasks` — tasks (protected)
- **Health:** `GET /api/health` returns status and timestamp.
- **Auth:** Most routes use `protect`; some use `authorize('admin')` or role checks.

---

## 10. Frontend Structure (High Level)

- **Entry:** `main.jsx` → `App.jsx` (wraps with `AuthProvider`) → `Routers.jsx` (React Router).
- **Context:** `AuthContext` — user, login, logout, loading; token in `localStorage`.
- **Config:** `config/api.js` — `API_URL`, `getAuthToken`, `apiRequest(endpoint, options)`.
- **Pages (examples):** Home, Login, UserDashboard, MentorDashboard, AdminDashboard, ChatPage, ResourcesPage, StudyGroupsPage, ResumePage, ATSScorePage, AchievementsPage, WellnessPage, EditProfile.

---

## 11. Environment Variables (Summary)

**Backend (.env):**  
`PORT`, `NODE_ENV`, `SUPABASE_PROJECT_ID` or `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `JWT_SECRET`, `JWT_EXPIRE`, `FRONTEND_URL`, `OLLAMA_API_URL`, `OLLAMA_MODEL`, `GROQ_API_KEY`, `GROQ_MODEL`, `APILAYER_KEY`.

**Frontend:**  
`VITE_API_URL` (optional; default `http://localhost:5000/api`).

---

## 12. Deployment (From Repo)

- **Frontend:** Vercel.
- **Backend:** Docker (see `.github/workflows/deploy.yml`); env passed via secrets (e.g. Supabase, JWT, Groq, Ollama URL/model).
- **Ollama in production:** Can run on host; container uses `OLLAMA_API_URL` to reach it (e.g. host IP or Docker network).

---

## 13. Quick Interview Answers

- **“What’s the stack?”**  
  React 19 + Vite 7 + Tailwind 4 on the frontend; Node + Express on the backend; Supabase (PostgreSQL) for data; custom JWT auth; AI via Groq and/or Ollama (e.g. Mistral).

- **“How is auth done?”**  
  Custom: we store users in Supabase, hash passwords with bcrypt, issue JWTs, and protect routes with middleware that verifies the token and loads the user. We don’t use Supabase Auth.

- **“How does the chatbot work?”**  
  Backend service tries Groq first (if key set), then Ollama. It supports different modes (tutor, resume, PDF Q&A, etc.). PDF content is extracted with pdf-parse and sent as context.

- **“Database?”**  
  Supabase: PostgreSQL with Row Level Security. We use the Supabase JS client (anon and service role) and our own JWT for API auth.

- **“Resume / ATS?”**  
  We have an ATS scoring service (heuristics) and optional APILayer integration; PDF parsing with pdf-parse; export with jspdf/html2canvas.

- **“Why Tailwind?”**  
  Utility-first: we style directly in JSX with classes like `flex`, `gap-4`, `text-lg`, `rounded-lg`. Fast to build and refactor, small production CSS with purging, and we use Tailwind 4 with the Vite plugin (`@tailwindcss/vite`).

---

## 14. Tailwind CSS – Interview Q&A

### What is Tailwind CSS?
A **utility-first** CSS framework. Instead of writing custom CSS or BEM classes, you apply small, single-purpose classes (e.g. `flex`, `p-4`, `text-blue-500`, `rounded-lg`) directly in the markup. Styles live next to the component, and the build step generates only the CSS you use.

### Why use Tailwind instead of plain CSS or Bootstrap?
- **Speed:** No context-switching; you stay in the template and compose layouts quickly.
- **Consistency:** Spacing/sizing come from a design scale (e.g. `4` = 1rem), so the UI stays consistent.
- **Small bundle:** Unused utilities are purged/tree-shaken, so production CSS stays small.
- **No naming:** No need to invent class names or maintain a separate stylesheet per component.

### How is Tailwind used in this project?
We use **Tailwind CSS 4** with the **Vite** plugin (`@tailwindcss/vite`). We add utility classes in JSX (e.g. `className="flex items-center gap-4 p-4 rounded-lg bg-gray-100"`) for layout, spacing, typography, colors, and responsiveness. No separate CSS files for most components.

### Explain utility-first.
You use many small classes, each doing one thing: `flex` (display), `items-center` (align-items), `gap-4` (gap), `text-sm` (font size), `font-medium` (font-weight). You **compose** these in the HTML/JSX instead of writing a custom class in a stylesheet. “Utility” = one job per class.

### What are responsive prefixes in Tailwind?
Breakpoint prefixes apply styles only at that width and up: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.  
Example: `text-sm md:text-base lg:text-lg` — small on mobile, base at `md`, large at `lg`.  
We use these for mobile-first responsive layouts (e.g. dashboards, forms, cards).

### What is the difference between `px-4` and `p-4`?
- **`p-4`** — padding on all sides (top, right, bottom, left).
- **`px-4`** — padding only on the horizontal axis (left and right).  
Similarly: `py-4` (top/bottom), `pt-4`, `pb-4`, `pl-4`, `pr-4` for single sides.

### How do you handle hover/focus states in Tailwind?
State variants: `hover:bg-blue-600`, `focus:ring-2`, `active:scale-95`, `disabled:opacity-50`.  
Example: `className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 rounded px-4 py-2"`.

### What is Tailwind’s “purge” / content configuration?
Tailwind scans your source files (HTML, JSX, etc.) for class names and **only includes** those utilities in the final CSS. Unused classes are removed so the bundle stays small. In Tailwind 4 with Vite, this is handled by the build pipeline and content detection.

### How would you add custom colors or spacing?
- **Tailwind 4:** Use CSS variables in `@theme` or extend in config, or use arbitrary values: `bg-[#1a1a2e]`, `p-[13px]`.
- **Custom theme:** Define in config (or in Tailwind 4 theme layer) so you get classes like `bg-brand-primary` and consistent spacing/shadows.

### What are arbitrary values?
When the default scale isn’t enough: `w-[347px]`, `text-[13px]`, `bg-[#0f172a]`. You use square brackets and any valid CSS value. Useful for one-off designs or matching a design system that isn’t in the default theme.

### Flexbox and Grid in Tailwind?
- **Flex:** `flex`, `flex-col` / `flex-row`, `items-center`, `justify-between`, `gap-4`, `flex-1`, `flex-wrap`.
- **Grid:** `grid`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, `gap-4`, `grid-cols-[1fr_2fr]` (arbitrary).  
We use both for layouts (e.g. cards in a grid, nav bars with flex).

### Dark mode with Tailwind?
Use the `dark:` variant: `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-gray-100`. Tailwind can tie it to a class on a parent (e.g. `<html class="dark">`) or to `prefers-color-scheme` in config.

### How does Tailwind 4 differ from v3 in this project?
Tailwind 4 uses a new engine and can be integrated via **`@tailwindcss/vite`** so we don’t need a separate PostCSS step. Configuration and theming can live in CSS with `@theme` or in a config file. We use v4 for better Vite integration and smaller/faster builds.

You can skim this doc right before the interview and use the tables as a checklist for “what we used and what model (frontend, backend, DB, AI).”
