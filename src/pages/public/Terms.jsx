import { Link } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import LegalDocument from "../../components/public/LegalDocument";

const SECTIONS = [
  {
    id: "demo-status",
    title: "1. Demo status",
    content: (
      <>
        <p>
          BuildBridge is a demonstration digital services marketplace. Provider profiles, services, portfolio projects,
          reviews, messages, and engagement records included in the seed dataset are fictional and exist to show how the
          product works. They are not real marketplace activity.
        </p>
        <p>
          The platform does not process payments, hold funds, provide escrow, execute contracts, verify identity, or
          guarantee work outcomes. Pricing shown on a service or proposal is recorded information, not a demand for
          payment through BuildBridge.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "2. Accounts and roles",
    content: (
      <>
        <p>
          You must provide accurate account information and keep your credentials private. Accounts may be created as a
          customer or a provider. Administrator access is never available through public signup and is assigned only
          through controlled backend processes.
        </p>
        <p>
          Organization workspaces allow company, agency, and studio accounts to invite provider accounts and assign roles.
          Workspace managers are responsible for the access they grant. You must not attempt to access records, files, or
          workspaces that do not belong to you.
        </p>
        <p>
          We may suspend or deactivate an account that violates these terms, the community guidelines, or the technical
          integrity of the platform.
        </p>
      </>
    ),
  },
  {
    id: "marketplace-conduct",
    title: "3. Marketplace conduct",
    content: (
      <>
        <p>You agree not to use BuildBridge to:</p>
        <ul>
          <li>Post false, misleading, deceptive, or infringing content.</li>
          <li>Harass, threaten, impersonate, or discriminate against another person.</li>
          <li>Send spam, scrape data at scale, or attempt to bypass rate limits and access controls.</li>
          <li>Upload malware, unlawful material, or files you do not have the right to share.</li>
          <li>Circumvent moderation, fake reviews, or manipulate ratings or engagement counts.</li>
        </ul>
        <p>
          Additional conduct expectations are described in the{" "}
          <Link to="/trust#guidelines">community guidelines</Link>.
        </p>
      </>
    ),
  },
  {
    id: "engagements",
    title: "4. Inquiries, proposals, and engagements",
    content: (
      <>
        <p>
          An inquiry opens a private conversation and may lead to a proposal. A proposal records a proposed scope, price,
          and timeline. Accepting a proposal records an agreement in principle between the customer and provider; it is
          not a payment confirmation, escrow arrangement, or legal contract facilitated by BuildBridge.
        </p>
        <p>
          Status changes are constrained by the platform: for example, an engagement can only be marked complete after it
          has been accepted, and only the customer can complete it in this build. Either side may cancel an inquiry while
          it is still cancellable.
        </p>
        <p>
          Any actual delivery, invoicing, payment, refund, or dispute resolution happens outside BuildBridge and is solely
          between the parties involved.
        </p>
      </>
    ),
  },
  {
    id: "reviews",
    title: "5. Reviews and ratings",
    content: (
      <>
        <p>
          Only the customer on a completed engagement may publish one review for that engagement. Reviews should describe
          the work honestly and must not contain personal data, threats, or unlawful content. Providers may not write
          reviews for themselves or trade reviews with others.
        </p>
        <p>
          Administrators may hide or remove a review that violates these terms or the community guidelines. Ratings are
          recalculated from published reviews. Removing content does not erase the underlying moderation record.
        </p>
      </>
    ),
  },
  {
    id: "content-rights",
    title: "6. Content and intellectual property",
    content: (
      <>
        <p>
          You retain ownership of content you submit. By publishing a profile, service, portfolio item, review, or message,
          you grant BuildBridge a non-exclusive licence to store, display, and process that content as needed to operate
          the marketplace, including showing it to authorized users and moderators.
        </p>
        <p>
          You must not upload content that infringes copyright, trademark, or other rights. Report suspected infringement
          through the report flow or the contact form, including enough detail to identify the material.
        </p>
      </>
    ),
  },
  {
    id: "moderation",
    title: "7. Moderation and enforcement",
    content: (
      <>
        <p>
          Users can report profiles, services, portfolio items, reviews, messages, and users. Administrators review
          reports and may take actions including content removal, profile suspension, account suspension, and category
          changes. Sensitive administrative actions are recorded in an audit log.
        </p>
        <p>
          We aim to apply these rules consistently, but we do not guarantee a particular outcome or response time. This
          build does not provide an appeals tribunal, arbitration service, or payment dispute process.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "8. Disclaimers and limitation",
    content: (
      <>
        <p>
          BuildBridge is provided “as is” for demonstration and evaluation. To the fullest extent permitted by applicable
          law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, and
          uninterrupted availability. We do not warrant the accuracy of user content, the availability of providers, or
          the outcome of any engagement.
        </p>
        <p>
          You are responsible for your own due diligence before working with anyone you meet through the demo, including
          verifying identity, rights, and suitability outside the platform. Never send money or sensitive personal
          information through the demo.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "9. Changes and contact",
    content: (
      <>
        <p>
          We may update these terms as the demo evolves. Continued use after a change means you accept the revised
          version. The “last updated” date at the top of the page reflects the current version.
        </p>
        <p>
          Questions about these terms can be sent through the <Link to="/contact">contact form</Link>. For trust and
          safety concerns, see <Link to="/trust">Trust &amp; safety</Link>.
        </p>
      </>
    ),
  },
];

export default function Terms() {
  usePageTitle("Terms of use");

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of use"
      intro="The ground rules for using the BuildBridge demonstration marketplace, written in plain language. This is not legal advice."
      updated="24 October 2026"
      sections={SECTIONS}
    />
  );
}
