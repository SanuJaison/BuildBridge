# BuildBridge Frontend

The responsive web client for BuildBridge: a marketplace where customers discover digital service
providers and manage inquiries, proposals, messaging, reviews, and completed engagements.

This is a real React application backed by the BuildBridge API. Seeded accounts, projects, ratings,
and reviews are fictional demo content.

Backend repository: <https://github.com/SanuJaison/BuildBridge-Backend>
Frontend repository: <https://github.com/SanuJaison/BuildBridge>

## Stack

- React 19 + Vite
- React Router
- Tailwind CSS
- GSAP with reduced-motion handling
- Axios
- Socket.IO client
- Lucide icons

## Quick start

Requirements: Node.js 20+ and npm. The API must be running at `http://localhost:3000` for the
development proxy to work.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

The Vite dev server proxies `/api`, `/static`, and `/socket.io` to the backend, so the browser can use
same-origin requests and the HttpOnly authentication cookie without additional CORS setup.

See the backend README for MongoDB setup, environment variables, seeding, and demo credentials:
<https://github.com/SanuJaison/BuildBridge-Backend#readme>

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 5173 |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

There are no frontend-specific environment variables at the moment. The API base URL is the relative
path `/api`; in production, serve the built frontend and the API behind the same origin (or add a
reverse proxy for `/api`, `/static`, and `/socket.io`).

## Demo access

The login page includes one-click **Customer** and **Provider** demo accounts. Their password is
`Demo@12345`.

Administrator credentials are intentionally documented only in the backend README and are never
displayed in the public interface. Public registration can create customers and providers only.

All seeded marketplace activity is fictional demo data. Do not present its ratings or reviews as real
customer feedback.

## Experience map

### Public marketplace

| Route | Area |
| --- | --- |
| `/` | Homepage with hero, category discovery, featured providers, services, portfolio, and trust content |
| `/providers`, `/providers/:slug` | Provider directory and full provider profile with services, projects, reviews, and inquiry entry points |
| `/services`, `/services/:slug` | Service discovery and service detail |
| `/portfolio`, `/portfolio/:slug` | Portfolio discovery and project detail |
| `/categories`, `/categories/:slug` | Database-driven categories and subcategories |
| `/start-project` | Guided inquiry flow |
| `/how-it-works`, `/about`, `/trust` | Platform information |
| `/contact` | Contact form delivered to the admin inbox |
| `/terms`, `/privacy` | Legal pages |

### Authentication

`/login`, `/register`, `/forgot-password`, and `/reset-password`. Registration supports customer and
provider signup, provider type selection, organization creation, and team-join flows.

### Customer and provider workspace

Protected under `/dashboard`:

- Overview, inquiries, inquiry detail with proposal actions, messaging, notifications, favorites, and
  account settings.
- Customers can start conversations, accept or decline proposals, mark accepted engagements complete,
  and leave one review per completed engagement.
- Providers can edit their public profile, publish it, manage services and portfolio projects, manage
  organization members and invitations, and respond with proposals.
- Messages are persisted by the backend and updated live over authenticated Socket.IO rooms.

Role-specific navigation and routes prevent customers from opening provider tools and prevent
providers from opening customer-only review pages.

### Admin console

Protected under `/admin` for administrators only:

- Dashboard statistics, user search and suspension/reactivation, provider verification/featuring, and
  category management.
- Review moderation with automatic provider-rating recalculation.
- Report triage, contact-message status handling, audit log browsing, and branding settings.

## Design and accessibility

- Dark navy/charcoal surfaces with a purple-blue gradient identity.
- Responsive layouts for mobile, tablet, and desktop.
- GSAP entrance and reveal animations on the homepage; motion is skipped when the visitor has
  `prefers-reduced-motion` enabled.
- Keyboard-accessible controls, labeled forms, visible focus states, and semantic page structure.
- Image fallbacks keep cards and detail pages intact when an asset is missing.
- In-app notices clearly identify demo marketplace data.

## Data and authentication

- Axios attaches the stored Bearer token and sends cookies for credentialed requests.
- The API also sets an HttpOnly cookie, so session restoration works without reading secrets in the
  browser.
- `AuthContext` restores the current account, `BrandingContext` applies administrator-managed
  branding, and `ToastContext` provides user feedback.
- Errors from the API are surfaced as readable form and toast messages.
- Private attachment previews use authenticated API URLs; public images use `/static` or remote URLs.

## Verification status

- `npm run lint` and `npm run build` are expected to pass for the current codebase.
- Backend API integration tests cover authentication, admin safety, inquiry/proposal transitions,
  review eligibility and moderation, ownership, uploads, settings, and suspension. Run them from the
  backend repository with `npm test`.
- The frontend was exercised manually in a browser across public, customer, provider, and admin
  pages, including admin moderation write flows.
- There is no frontend unit test or browser E2E suite yet.

## Known limitations

- No payment, escrow, or checkout experience. Accepting a proposal records an agreement in principle,
  not a payment.
- No transactional email delivery; password-reset UI depends on development reset tokens outside
  production.
- Frontend tests are not automated yet.
- The production JavaScript bundle is currently emitted as one large chunk, which triggers Vite's
  500 kB chunk-size warning. Route-level code splitting is a future optimization.
- The Expo mobile application has not been started. The website is the current priority; mobile will
  use the same backend afterward.

See `PROJECT_CHECKLIST.md` for the full delivery checklist and remaining work.
