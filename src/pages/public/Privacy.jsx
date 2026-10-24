import { Link } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import LegalDocument from "../../components/public/LegalDocument";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Overview",
    content: (
      <>
        <p>
          This page explains what data the BuildBridge demo collects, why it is stored, who can access it, and the choices
          available to you. It describes the actual behaviour of this codebase, not a hypothetical production policy.
        </p>
        <p>
          BuildBridge is a demonstration marketplace. Profiles, reviews, and engagement records in the seed dataset are
          fictional. If you create an account and use the workflow, your account data and content are stored in the
          configured MongoDB database for this environment.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "2. Data we collect",
    content: (
      <>
        <p>When you use the platform, the backend may store:</p>
        <ul>
          <li><strong>Account data:</strong> name, email address, password hash, role, account status, and avatar.</li>
          <li><strong>Provider data:</strong> profile details, skills, categories, pricing, availability, links, organization membership, and uploaded images.</li>
          <li><strong>Marketplace records:</strong> inquiries, proposals, messages, notifications, favorites, reviews, reports, and contact messages you create.</li>
          <li><strong>Files:</strong> images and documents you upload, including private inquiry attachments.</li>
          <li><strong>Technical data:</strong> session tokens, request metadata needed for rate limiting and security, and timestamps on records.</li>
        </ul>
        <p>
          Do not submit passwords, financial account numbers, government identifiers, or other sensitive personal data in
          messages, briefs, reviews, or contact forms. The platform is not designed to hold them.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-data",
    title: "3. How data is used",
    content: (
      <>
        <p>Data is used to operate the marketplace workflow, including to:</p>
        <ul>
          <li>Authenticate sessions and enforce role and ownership permissions.</li>
          <li>Display profiles, services, portfolio work, and published reviews.</li>
          <li>Deliver inquiries, proposals, messages, notifications, and status updates to the right accounts.</li>
          <li>Provide organization team access to shared workspaces.</li>
          <li>Review reports, moderate content, and maintain an audit trail of administrative actions.</li>
          <li>Protect the service through validation, rate limiting, and abuse prevention.</li>
        </ul>
        <p>
          There is no advertising network, behavioural tracking, or sale of personal data in this build. The platform does
          not use payment data because it does not process payments.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "4. Who can see your data",
    content: (
      <>
        <p>
          Public visitor pages show published provider profiles and published work. Private records are scoped:
        </p>
        <ul>
          <li>An inquiry is visible to the customer, the provider account, authorized members of the provider organization, and administrators when needed for moderation.</li>
          <li>Conversation messages are limited to conversation participants and authorized team members.</li>
          <li>Private attachments are served only after an access check against the related inquiry.</li>
          <li>Contact messages and reports are routed to platform administrators.</li>
        </ul>
        <p>
          A provider's public profile intentionally shows the professional information they choose to publish, such as
          display name, skills, portfolio, and public links. Do not include private contact details in public fields.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "5. Cookies and local storage",
    content: (
      <>
        <p>
          The API may set an httpOnly session cookie to keep you signed in. The web client also uses browser local storage
          for a session token used by API and real-time socket requests, and for small interface preferences. Clearing site
          data will sign you out.
        </p>
        <p>
          No third-party advertising cookies are used. Public pages request web fonts from Google Fonts, which is a
          third-party request made by your browser.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "6. Retention",
    content: (
      <>
        <p>
          Records are retained for as long as needed to operate the demo environment. Removing a service or portfolio item
          from public view does not necessarily delete the underlying record immediately. Administrative moderation
          records and audit logs may be retained to maintain accountability, even after the related content changes state.
        </p>
        <p>
          A demonstration environment may be reset or reseeded, in which case accounts and content not part of the seed
          dataset can be removed. Do not treat this build as durable storage for important information.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "7. Security",
    content: (
      <>
        <p>
          Passwords are hashed with bcrypt and are never stored in plain text. API writes and uploads use validation,
          authentication, authorization checks, and rate limits. Secrets such as signing keys and database credentials are
          read from server-side environment variables and are not exposed to the browser.
        </p>
        <p>
          No service is perfectly secure. Do not assume the demo has undergone a production security audit. If you see a
          vulnerability or suspicious behaviour, report it through the <Link to="/contact">contact form</Link> without
          including exploit details in public content.
        </p>
      </>
    ),
  },
  {
    id: "choices",
    title: "8. Your choices",
    content: (
      <>
        <p>
          You can update your account name, avatar, and password from account settings. Providers can unpublish profile,
          service, or portfolio content from their dashboard. You can remove favorites and sign out at any time.
        </p>
        <p>
          For deletion or access questions, contact the platform team with the email address on your account. Because this
          is a demo environment, deletion may be handled through a database reset rather than a self-service workflow.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "9. Children",
    content: (
      <p>
        The marketplace is intended for working professionals and is not directed at children. Do not create an account if
        you are below the minimum age required to enter a contract in your jurisdiction.
      </p>
    ),
  },
  {
    id: "changes",
    title: "10. Changes and contact",
    content: (
      <>
        <p>
          This overview may be updated as the demo changes. The “last updated” date reflects the current version. Material
          changes to data handling should be evaluated against this page before deployment to a real environment.
        </p>
        <p>
          Privacy questions can be sent through the <Link to="/contact">contact form</Link>, or by email to the support
          address listed in the footer.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  usePageTitle("Privacy overview");

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy overview"
      intro="What this BuildBridge demo stores, who can access it, and the controls available to you. This is a plain-language overview, not legal advice."
      updated="24 October 2026"
      sections={SECTIONS}
    />
  );
}
