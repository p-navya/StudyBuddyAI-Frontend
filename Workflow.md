Overall Workflow Overview
StudyBuddyAI is a full-stack web application where the React + Vite frontend talks to a Node/Express API, which in turn uses Supabase (PostgreSQL) for data and Groq/Ollama + pdf-parse + ATS services for AI-heavy features. Everything is glued together with JWT authentication and a role-based permission model (Student, Mentor, Admin).

1. User Access & Authentication Flow
Users land on the frontend (locally http://localhost:5173, in production your Vercel URL). The React app uses React Router for navigation and an AuthContext to track whether a user is logged in.

Registration / Login
On the frontend, forms on the Login/Register pages call the backend via apiRequest('/auth/register') or apiRequest('/auth/login').
The backend receives these at /api/auth/...:

For registration, it:
Validates input.
Hashes the password with bcryptjs.
Stores the user in the users table in Supabase using @supabase/supabase-js.
Generates a JWT with jsonwebtoken that encodes the user ID and role.
For login, it:
Verifies email/password using bcrypt.
Issues a new JWT if valid.
The JWT is returned to the frontend and stored in localStorage. The AuthContext stores the user object plus token and exposes login/logout.

Auth persistence & current user
On app load, AuthContext checks localStorage for a token and calls /api/auth/me.
The backend uses the protect middleware:

Reads Authorization: Bearer <token>.
Verifies JWT using JWT_SECRET/SUPABASE_JWT_SECRET.
Fetches id, name, email, role from the users table in Supabase.
Attaches req.user and lets the route handler run.
If this succeeds, the frontend marks the user as authenticated and redirects to the appropriate dashboard (Student, Mentor, Admin).

2. Frontend–Backend Communication Pattern
All frontend API calls go through a shared helper in config/api.js:

It composes the base URL from VITE_API_URL (default http://localhost:5000/api).
Automatically attaches the JWT from localStorage as an Authorization header when present.
Throws if the response is not ok.
This means every page (dashboards, groups, tasks, quizzes, chatbot, resume, ATS page) uses the same pattern: React component → apiRequest(endpoint, options) → Express route → Supabase / services.

On the backend, Express routes are namespaced under /api:

/api/auth – auth logic.
/api/users – profile edits.
/api/admin – admin-only actions (guarded by authorize('admin')).
/api/chatbot – AI + resume + Doc-Talk endpoints.
/api/resources, /api/groups, /api/activity, /api/quizzes, /api/tasks – core product features.
3. CORS and Security
Because the frontend and backend are on different origins, the backend configures CORS with the cors middleware:

It allows specific origins: local Vite (http://localhost:5173), the production frontend, and anything set in FRONTEND_URL.
It enables credentials: true so JWTs in Authorization are permitted.
It explicitly lists allowed methods and headers.
This ensures the browser lets the React app call the API while blocking random third-party websites.

4. Data & Business Logic with Supabase
The data layer is handled via Supabase:

Supabase acts as a managed PostgreSQL plus a typed JS client.
The backend connects using an anon key for regular queries and a service role key for admin or system operations.
The application uses custom JWTs and a users table instead of Supabase Auth, so all authentication logic lives in the Node backend.
Typical flows:

Dashboards aggregate data from tables like user_activity, tasks, quizzes, and groups-related tables.
Group features (/api/groups) read/write study_groups, group_members, group_messages, applying RBAC via middleware (protect + authorize) and, when needed, Row Level Security in Supabase.
Quizzes and tasks similarly use Supabase tables and track progress/attempts per user.
5. AI and Chatbot Workflow
For AI features, the frontend sends messages or files to the /api/chatbot endpoints:

Message-based chat / tutoring / mental support

The frontend sends a message plus context (mode: mental-support, resume-builder, student-helper, etc.).
The backend’s chatbotService:
Tries Groq first if GROQ_API_KEY is configured, using a model like llama-3.1-8b-instant.
If Groq is unavailable or errors, it falls back to Ollama using the ollama npm client and a local or remote model such as mistral.
It formats the conversation history and mode, calls the selected model, and returns the AI’s response back to the React component.
Doc-Talk (PDF Q&A)

The frontend uploads a PDF (usually via a form with file input).
The backend uses Multer to handle the file upload and passes the buffer to pdf-parse.
pdf-parse extracts text, which is then:
Stored temporarily or passed directly as contextData to the chatbot.
Combined with the user’s question, and sent to Groq/Ollama.
The model responds based on the extracted text, enabling document Q&A.
Resume and ATS evaluation

The resume builder on the frontend structures data, and optionally sends a PDF or text to the backend.
atsService runs a heuristic analysis:
Counts metrics/numbers.
Checks for action verbs and buzzwords.
Computes a simple readability score.
Optionally, the backend can call APILayer’s public resume parser API if APILAYER_KEY is set.
The frontend displays ATS-style feedback plus suggestions generated by the AI (via the chatbot service).
6. UI, Styling, and User Experience
All user-facing screens are built with React + Tailwind CSS:

Tailwind CSS provides utility classes (e.g. flex, gap-4, rounded-lg, bg-gray-100) directly in JSX.
Responsive behavior is implemented via prefixes like sm:, md:, lg: to adapt dashboards and forms for mobile and desktop.
This means features like dashboards, resume builder, ATS score page, study groups, and wellness content share a consistent visual language driven by Tailwind’s design scale.
The result is a cohesive workflow: a user logs in, navigates via React Router to various feature pages, interacts with Supabase-backed data through the API, and leverages AI (Groq/Ollama + pdf-parse + ATS) for intelligent tutoring and resume-related tasks—all coordinated through a token-based, CORS-secured frontend–backend architecture.
