# BuildBridge Frontend

The responsive web client for BuildBridge: a marketplace where customers discover digital service
providers, compare their work, and manage inquiries, proposals, messaging, reviews, and completed
engagements. Providers choose from 16 professional roles and work from a dashboard shaped around
their primary discipline.

This is a real React application backed by the BuildBridge API. Seeded accounts, projects, ratings,
reviews, and photography are fictional demo content.

Backend repository: <https://github.com/SanuJaison/BuildBridge-Backend>
Frontend repository: <https://github.com/SanuJaison/BuildBridge>

## Stack

- React 19 + Vite
- React Router
- Tailwind CSS
- GSAP + ScrollTrigger with reduced-motion handling
- Axios
- Socket.IO client
- Lucide icons

Motion includes page reveals, scroll parallax, pointer tilt and magnetism, a custom cursor, route
transitions, and animated dashboard/page entrances. A site-wide command palette searches providers,
services, portfolio work, categories, and the role catalog through the live API.

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

The seed also creates 1,150 bulk demo provider accounts (ten per subcategory, across freelancers,
developers, companies, agencies, and studios) for exercising discovery and pagination at scale. They
all use `Demo@12345` and the numbered pattern `provider0001@demo.buildbridge.dev` through
`provider1150@demo.buildbridge.dev`. See the backend README for the full demo account list.

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

The navigation and homepage expose a live marketplace search palette (`Ctrl/Cmd+K` or the search
button). Provider discovery can be filtered with `/providers?role=game-developer` and other role
slugs.

### Authentication

`/login`, `/register`, `/forgot-password`, and `/reset-password`. Registration supports customer and
provider signup, provider type selection, organization creation, and team-join flows.

Provider signup includes a 16-role picker covering software engineers, web, app and game developers,
AI and data specialists, DevOps, security, product and brand designers, motion designers, digital
marketers, SEO, content, e-commerce, and technical consulting. A primary role can be starred, and up
to three roles can be selected. Customer accounts hold the buying side; provider and admin accounts
are directed to their own workspaces instead of the brief form.

### Customer and provider workspace

Protected under `/dashboard`:

- Overview, inquiries, inquiry detail with proposal actions, messaging, notifications, favorites, and
  account settings.
- Customers can start conversations, accept or decline proposals, mark accepted engagements complete,
  and leave one review per completed engagement.
- Providers can edit their public profile, choose and rank their roles, publish it, manage services
  and portfolio projects, manage organization members and invitations, and respond with proposals.
- The provider overview adapts its headline, focus areas, role badges, and discovery links to the
  starred primary role while retaining one shared workspace for account management.
- Messages are persisted by the backend and updated live over authenticated Socket.IO rooms. Public
  images are delivered from Cloudinary when configured; private inquiry attachments use
  access-controlled API URLs.

Role-specific navigation and routes prevent customers from opening provider tools and prevent
providers from opening customer-only review pages.

### Admin console

Protected under `/admin` for administrators only:

- Dashboard statistics, user search and suspension/reactivation, provider verification/featuring, and
  category management.
- Review moderation with automatic provider-rating recalculation.
- Report triage, contact-message status handling, audit log browsing, and branding settings.

## Design and accessibility

- Dark navy/charcoal surfaces with a purple-blue gradient identity, layered artwork, grain, and
  scroll-reactive depth.
- Responsive layouts for mobile, tablet, and desktop.
- GSAP page/reveal motion, ScrollTrigger parallax, cursor states, pointer tilt, and magnetic controls
  throughout the public experience and dashboard shell. The custom cursor is limited to fine pointers.
- All GSAP motion is skipped when the visitor has `prefers-reduced-motion` enabled; content remains
  visible without JavaScript animation.
- Command-palette search is keyboard operable with arrow-key navigation, Enter to open, and Escape to
  close.
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
- Search results come from the live marketplace API; the UI never invents provider or review data.
- Private attachment previews use authenticated API URLs; public images use Cloudinary delivery URLs
  when configured, or the seeded local `/static/demo/photos/` assets.

## Verification status

Verified on 2026-10-25:

- `npm run lint` passes.
- `npm run build` passes. Vite still reports the known single-chunk size warning.
- The backend suite passes 16 integration tests covering authentication, admin safety, customer-only
  inquiry creation, inquiry/proposal transitions, review eligibility and moderation, ownership,
  uploads, settings, and suspension. Run it from the backend repository with `npm test`.
- A browser audit loaded all public routes, all 14 provider profiles, all 28 services, all 19
  portfolio projects, all 11 categories, the customer workspace and inquiry/conversation detail, the
  provider workspace, and all nine admin routes without an application crash.
- Global search, role-filtered talent discovery, provider role gates, customer ownership checks, and
  the customer/provider/admin dashboard redirects were exercised in the browser.
- There is still no frontend unit test or automated browser E2E suite.

## Demo imagery and content

Seeded provider portraits, user avatars, covers, service images, and project images live in the
backend at `public/static/demo/photos/`. The source photographs are from Unsplash and are used under
the [Unsplash License](https://unsplash.com/license). Names, biographies, organizations, projects,
ratings, reviews, and engagement records are fictional; photos do not depict or endorse the named
demo accounts. Organization logos are generated monograms.

## Known limitations

- No payment, escrow, or checkout experience. Accepting a proposal records an agreement in principle,
  not a payment.
- No transactional email delivery; password-reset UI depends on development reset tokens outside
  production.
- Frontend tests are not automated yet.
- Cloudinary delivery requires three matching credentials in the backend environment. Without them,
  auto mode falls back to local upload storage; see the backend README for setup and verification.
- The production JavaScript bundle is currently emitted as one large chunk, which triggers Vite's
  500 kB chunk-size warning. Route-level code splitting is a future optimization.
- The Expo mobile application has not been started. The website is the current priority; mobile will
  use the same backend afterward.

See `PROJECT_CHECKLIST.md` for the full delivery checklist and remaining work.
