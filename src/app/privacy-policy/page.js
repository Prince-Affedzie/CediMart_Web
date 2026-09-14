// src/app/privacy-policy/page.js
import Link from 'next/link';
import {
  Mail,
  Globe,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import './privacy-policy.css';

export const metadata = {
  title: 'Privacy Policy · CediMart',
  description:
    'Learn how CediMart collects, uses, and protects your personal information.',
};

// Recompute at build; refreshes on each deploy.
function getLastUpdated() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PrivacyPolicyPage() {
  const currentDate = getLastUpdated();

  return (
    <div className="pp-page">
      {/* Nav */}
      <div className="pp-nav">
        <Link href="/" className="pp-back" aria-label="Go home">
          <ChevronLeft size={18} strokeWidth={2.4} />
          Back
        </Link>
        <span className="pp-nav-title">Privacy Policy</span>
        <span className="pp-nav-spacer" aria-hidden="true" />
      </div>

      <div className="pp-shell">
        {/* Header */}
        <header className="pp-header">
          <div className="pp-logo-wrap">
            <span className="pp-logo-dot" />
            <span className="pp-logo-text">
              Cedi<span>Mart</span>
            </span>
          </div>
          <p className="pp-last-updated">Last updated: {currentDate}</p>
        </header>

        {/* Intro */}
        <section className="pp-section">
          <h2 className="pp-h2">1. Introduction</h2>
          <p className="pp-p">
            Welcome to CediMart (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;). We are committed to protecting your personal
            information and your right to privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our mobile application and services.
          </p>
          <p className="pp-p">
            Please read this Privacy Policy carefully. By accessing or using our
            application, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </section>

        {/* 2 */}
        <section className="pp-section">
          <h2 className="pp-h2">2. Information We Collect</h2>

          <h3 className="pp-h3">2.1 Personal Information</h3>
          <p className="pp-p">
            When you create an account or use our services, we may collect:
          </p>
          <ul className="pp-ul">
            <li>
              Name and contact details (first name, last name, email address,
              phone number)
            </li>
            <li>Delivery address and location information</li>
            <li>
              Payment information (processed securely through our payment
              partners)
            </li>
            <li>Account credentials</li>
          </ul>

          <h3 className="pp-h3">2.2 Usage Information</h3>
          <p className="pp-p">
            We automatically collect information about your interaction with our
            application:
          </p>
          <ul className="pp-ul">
            <li>
              Device information (type, operating system, unique device
              identifiers)
            </li>
            <li>
              Log data (IP address, browser type, pages visited, access times)
            </li>
            <li>App usage patterns and preferences</li>
          </ul>

          <h3 className="pp-h3">2.3 Order Information</h3>
          <p className="pp-p">When you place orders, we collect:</p>
          <ul className="pp-ul">
            <li>Order history and preferences</li>
            <li>Product preferences and favorites</li>
            <li>Shopping cart information</li>
          </ul>
        </section>

        {/* 3 */}
        <section className="pp-section">
          <h2 className="pp-h2">3. How We Use Your Information</h2>
          <p className="pp-p">
            We use the information we collect for various purposes:
          </p>
          <ul className="pp-ul">
            <li>
              <strong>To provide our services:</strong> Process orders, manage
              your account, and deliver products
            </li>
            <li>
              <strong>To communicate with you:</strong> Send order
              confirmations, delivery updates, and customer support
            </li>
            <li>
              <strong>To improve our services:</strong> Analyze usage patterns
              and enhance user experience
            </li>
            <li>
              <strong>For security:</strong> Protect against fraud and
              unauthorized access
            </li>
            <li>
              <strong>For personalization:</strong> Recommend products based on
              your preferences
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section className="pp-section">
          <h2 className="pp-h2">4. Data Sharing and Disclosure</h2>
          <p className="pp-p">
            We may share your information in the following circumstances:
          </p>

          <h3 className="pp-h3">4.1 Service Providers</h3>
          <p className="pp-p">
            We share information with third-party vendors who perform services
            on our behalf:
          </p>
          <ul className="pp-ul">
            <li>Payment processors</li>
            <li>Delivery and logistics partners</li>
            <li>Cloud hosting services</li>
            <li>Analytics providers</li>
          </ul>

          <h3 className="pp-h3">4.2 Legal Requirements</h3>
          <p className="pp-p">
            We may disclose your information if required by law or in response
            to valid requests by public authorities.
          </p>

          <h3 className="pp-h3">4.3 Business Transfers</h3>
          <p className="pp-p">
            In the event of a merger, acquisition, or asset sale, your personal
            information may be transferred.
          </p>
        </section>

        {/* 5 */}
        <section className="pp-section">
          <h2 className="pp-h2">5. Data Security</h2>
          <p className="pp-p">
            We implement appropriate technical and organizational security
            measures to protect your personal information. These include:
          </p>
          <ul className="pp-ul">
            <li>Encryption of sensitive data</li>
            <li>Secure server infrastructure</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
          </ul>
          <p className="pp-p">
            While we strive to protect your personal information, no method of
            transmission over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        {/* 6 */}
        <section className="pp-section">
          <h2 className="pp-h2">6. Your Rights</h2>
          <p className="pp-p">
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>
          <ul className="pp-ul">
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update or correct inaccurate
              information
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data
            </li>
            <li>
              <strong>Objection:</strong> Object to certain data processing
              activities
            </li>
            <li>
              <strong>Portability:</strong> Request transfer of your data to
              another service
            </li>
          </ul>
          <p className="pp-p">
            To exercise these rights, please contact us using the information
            provided below.
          </p>
        </section>

        {/* 7 */}
        <section className="pp-section">
          <h2 className="pp-h2">7. Data Retention</h2>
          <p className="pp-p">
            We retain your personal information only for as long as necessary to
            fulfill the purposes outlined in this Privacy Policy, unless a
            longer retention period is required or permitted by law.
          </p>
          <p className="pp-p">
            Account information is retained while your account is active.
            Transaction records are kept for legal and accounting purposes as
            required by applicable laws.
          </p>
        </section>

        {/* 8 */}
        <section className="pp-section">
          <h2 className="pp-h2">8. Children&apos;s Privacy</h2>
          <p className="pp-p">
            Our services are not directed to individuals under the age of 16. We
            do not knowingly collect personal information from children. If you
            become aware that a child has provided us with personal information,
            please contact us immediately.
          </p>
        </section>

        {/* 9 */}
        <section className="pp-section">
          <h2 className="pp-h2">9. International Transfers</h2>
          <p className="pp-p">
            Your information may be transferred to and processed in countries
            other than your country of residence. These countries may have data
            protection laws that are different from those in your country.
          </p>
          <p className="pp-p">
            We take appropriate safeguards to ensure that your personal
            information remains protected in accordance with this Privacy
            Policy.
          </p>
        </section>

        {/* 10 */}
        <section className="pp-section">
          <h2 className="pp-h2">10. Changes to This Policy</h2>
          <p className="pp-p">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last Updated&quot; date.
          </p>
          <p className="pp-p">
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </section>

        {/* 11 */}
        <section className="pp-section">
          <h2 className="pp-h2">11. Contact Us</h2>
          <p className="pp-p">
            If you have any questions or concerns about this Privacy Policy or
            our data practices, please contact us:
          </p>

          <div className="pp-contact-info">
            <a
              href="mailto:privacy@cedimartgh.com"
              className="pp-contact-item pp-contact-link"
            >
              <Mail size={18} strokeWidth={2.2} />
              <span>privacy@cedimartgh.com</span>
            </a>
            <a
              href="https://cedimartgh.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pp-contact-item pp-contact-link"
            >
              <Globe size={18} strokeWidth={2.2} />
              <span>www.cedimartgh.com</span>
            </a>
            <div className="pp-contact-item">
              <MapPin size={18} strokeWidth={2.2} />
              <span>
                CediMart Headquarters
                <br />
                Accra, Ghana
              </span>
            </div>
          </div>
        </section>

        {/* Acceptance */}
        <div className="pp-acceptance">
          <p>
            By using CediMart, you acknowledge that you have read and understood
            this Privacy Policy.
          </p>
        </div>

        <div className="pp-bottom-spacer" />
      </div>
    </div>
  );
}