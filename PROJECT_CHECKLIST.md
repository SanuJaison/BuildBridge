# BuildBridge Delivery Checklist

Last updated: 2026-10-25

This checklist tracks the website milestone. The Expo mobile application is intentionally last and
has not been started.

## Platform and foundation

- [x] Real Express + MongoDB + Mongoose backend (no static mock API)
- [x] React 19 + Vite + Tailwind CSS frontend
- [x] React Router, Axios, GSAP, and Socket.IO client integrated
- [x] Environment-only secrets with `.env` excluded from git
- [x] Backend `.env.example` and documented setup
- [x] MongoDB category data: 11 parent categories and 115 subcategories
- [x] Categories are database-driven and fully editable by administrators
- [x] Customer, provider, organization, and admin account models
- [x] Provider types: freelancer, developer, company, agency, studio
- [x] 16 professional roles with primary-role selection and discovery filtering
- [x] JWT authentication with HttpOnly cookie and Bearer token support
- [x] bcrypt password hashing
- [x] Helmet, CORS allowlisting, JSON limits, and route-specific rate limiting
- [x] Zod validation on API write endpoints
- [x] Admin role cannot be self-assigned or created through public registration
- [x] Suspended users and providers are blocked from protected actions
- [x] Append-only admin audit log

## Public website

- [x] Premium dark navy/charcoal and purple-blue visual system with layered photography
- [x] Responsive homepage with hero, categories, featured providers, services, portfolio, and trust sections
- [x] GSAP page reveals, scroll parallax, pointer tilt, magnet controls, custom cursor, and route motion
- [x] Reduced-motion behavior keeps all content visible without animation
- [x] Live command-palette search across providers, services, projects, categories, and roles
- [x] Provider directory with search, role filters, sorting, and pagination
- [x] Provider profiles with services, portfolio, reviews, rating breakdown, and inquiry entry
- [x] Service directory and service detail pages
- [x] Portfolio directory and project detail pages
- [x] Category and subcategory discovery pages
- [x] Start-project inquiry flow
- [x] How it works, about, trust, contact, terms, privacy, and 404 pages
- [x] Safe image fallbacks for missing assets
- [x] Curated demo photography across profiles, services, projects, categories, and auth pages
- [x] Clear demo-data notices, fictional seeded content, and documented Unsplash licensing

## Authentication and accounts

- [x] Customer and provider registration
- [x] Provider onboarding type selection, up to three role choices, and organization creation
- [x] Team invitation acceptance flow for provider accounts
- [x] Login, logout, session restoration, and protected routes
- [x] Forgot-password and reset-password flows
- [x] Profile settings and password change
- [x] Role-based redirects and route guards

## Customer workspace

- [x] Dashboard overview
- [x] Inquiry list and inquiry detail
- [x] Proposal view, accept, and decline actions
- [x] Mark accepted engagement complete
- [x] Submit one review after completion
- [x] Persisted conversations with live Socket.IO updates
- [x] Notifications with read and read-all actions
- [x] Favorites
- [x] Account settings

## Provider workspace

- [x] Provider overview and onboarding guidance
- [x] Primary-role lens with tailored focus areas, badges, and discovery links
- [x] Public profile editor with role selection and primary-role control
- [x] Publish guard requiring display name, a professional role, headline, bio, category, skills, and location
- [x] Service create, edit, publish/pause, and delete
- [x] Portfolio create, edit, publish/draft, and delete
- [x] Organization and team member management
- [x] Invitations and role handling
- [x] Inquiry inbox, discussion status, proposals, and proposal withdrawal/resend
- [x] Persisted messaging and notifications

## Admin console

- [x] Admin-only layout and protected routes
- [x] Platform overview statistics
- [x] User search, suspension, and reactivation
- [x] Admin accounts protected from suspension and editing
- [x] Provider verification, featuring, status, and suspension controls
- [x] Publishing blocked while a provider owner is suspended
- [x] Category create, edit, deactivate, and delete
- [x] Review moderation with provider rating recalculation
- [x] Report triage
- [x] Contact message inbox
- [x] Audit log
- [x] Branding settings used by the public website

## Data integrity and security verification

- [x] Inquiry lifecycle enforced: `new → in_discussion → proposal_sent → accepted → completed`
      plus declined and cancelled outcomes
- [x] Only the receiving provider can send proposals
- [x] Only customer accounts can create buying-side inquiries
- [x] Only the customer can accept, decline, or complete
- [x] Reviews require a completed engagement and are limited to one per inquiry
- [x] Ownership checks block access to other customers' and providers' records
- [x] Private attachments restricted to the owner, admins, and linked inquiry participants
- [x] Upload MIME type, size, and purpose validation
- [x] Multer memory uploads, Cloudinary delivery, and local fallback configuration
- [x] Public signup cannot create an administrator
- [x] Admin user-management guards verified
- [x] Admin review moderation recalculates ratings
- [x] No payment, analytics, rating, or review data is fabricated by the application
- [x] Seeded reviews and engagement history are clearly fictional demo data

## Automated verification

- [x] Backend integration suite added with Node's test runner and Supertest
- [x] 16 integration tests passing against a dedicated `_test` database
- [x] Test database safety check (`_test` suffix) and drop before/after runs
- [x] Tests cover auth, admin safety, customer-only inquiry creation, inquiry/proposal transitions,
      reviews, ownership, partial-update regressions, uploads, contact messages, settings, and
      provider suspension
- [x] Frontend ESLint passes
- [x] Frontend production build passes
- [x] All public pages and dynamic provider, service, project, and category detail pages browser-audited
- [x] Customer, provider, and all nine admin routes browser-audited without application crashes
- [x] Global search and role-filtered discovery exercised in the browser
- [x] Admin write flows exercised in the browser and demo state restored after moderation tests

## Documentation

- [x] Backend README with setup, environment, Cloudinary uploads, API overview, security, tests, and limitations
- [x] Frontend README with setup, routes, role/motion/search behavior, verification status, and limitations
- [x] Backend `.env.example` with placeholder values only and Cloudinary driver options
- [x] Demo credentials documented in READMEs only, never in the public UI
- [x] Demo photography provenance and fictional-content disclaimer documented
- [x] Known limitations and deliberately excluded features documented

## Deliberately out of scope for the website milestone

- [ ] Payment processing, escrow, invoicing, and checkout (no fake payments are shown)
- [ ] Transactional email or SMS delivery (development reset token only)
- [x] Cloud object storage adapter for uploads (Cloudinary with local fallback)
- [ ] Frontend unit tests and browser E2E automation
- [ ] Route-level code splitting to remove the Vite large-chunk warning
- [ ] Distributed rate limiting and Socket.IO adapter for horizontal scaling
- [ ] Expo mobile application

## Next milestone: Expo mobile application

- [ ] Choose and initialize Expo project structure
- [ ] Shared authentication and token storage
- [ ] Public discovery, provider profiles, and service pages
- [ ] Customer inquiries, proposals, and messaging
- [ ] Provider inbox and proposal actions
- [ ] Notifications and settings
- [ ] Push notification strategy
- [ ] Mobile build configuration and documentation

## Release checklist

- [x] Backend integration tests pass
- [x] Frontend lint passes
- [x] Frontend build passes
- [x] Demo credentials are absent from public UI
- [x] No `.env`, secrets, or upload test artifacts are committed
- [x] README setup instructions match the current scripts and environment variables
- [ ] Replace the local development Cloudinary secret with the matching console value before production
- [ ] Mobile milestone started only after the website is accepted
