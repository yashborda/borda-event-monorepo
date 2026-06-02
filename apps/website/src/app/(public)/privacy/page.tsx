import { RichContent } from '@pkg/ui'

import { ManageCookiePreferencesButton } from '@/components/custom/manage-cookie-preferences-button'

import { BlogPageHero } from '@/app/_components/blog-page-hero'

const PrivacyPage = () => {
  return (
    <main>
      <BlogPageHero
        title="Privacy Policy"
        description="Learn how we collect, use, and protect your personal information."
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8">
          <ManageCookiePreferencesButton />
        </div>
        <RichContent>
          <p className="text-muted-foreground">
            <strong>Last updated: January 1, 2026</strong>
          </p>
          <p>
            At Borda Event, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website or use our services. Please
            read this policy carefully. If you disagree with its terms, please
            discontinue use of the site.
          </p>

          <hr />

          <h2>1. Information we collect</h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, update your profile, or contact us for support.
            This may include:
          </p>
          <ul>
            <li>Your full name and email address</li>
            <li>Profile information such as a username and avatar</li>
            <li>Billing information, including payment method details</li>
            <li>
              Communications you send us, such as support requests or feedback
            </li>
            <li>
              Any other information you voluntarily choose to provide to us
            </li>
          </ul>

          <h3>1.1 Automatically collected data</h3>
          <p>
            We also automatically collect certain information when you use our
            services, including:
          </p>
          <ul>
            <li>
              Log data
              <ul>
                <li>IP address and approximate geolocation</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on each page</li>
              </ul>
            </li>
            <li>
              Device information
              <ul>
                <li>Hardware model and operating system version</li>
                <li>Unique device identifiers</li>
              </ul>
            </li>
            <li>Usage data such as features used and actions taken</li>
          </ul>

          <h3>1.2 Data we do not collect</h3>
          <p>We explicitly do not collect:</p>
          <ul>
            <li>Precise GPS location</li>
            <li>Contacts or address book data</li>
            <li>Camera or microphone data</li>
            <li>Biometric data of any kind</li>
          </ul>

          <h2>2. How we use your information</h2>
          <p>
            We use the information we collect to provide, maintain, and improve
            our services. Specifically, we may use it to:
          </p>
          <ol>
            <li>Create and manage your account</li>
            <li>Process transactions and send related information</li>
            <li>
              Send administrative information such as confirmations and updates
            </li>
            <li>Respond to your comments, questions, and support requests</li>
            <li>
              Send promotional communications, if you have opted in to receive
              them
            </li>
            <li>Monitor and analyze usage patterns to improve the service</li>
            <li>Detect, investigate, and prevent fraudulent transactions</li>
            <li>Comply with legal obligations</li>
          </ol>

          <blockquote>
            We will never sell your personal data to third parties. Your
            information is used solely to provide and improve the services you
            signed up for.
          </blockquote>

          <h2>3. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity
            on our service and hold certain information. Cookies are files with
            a small amount of data that may include an anonymous unique
            identifier.
          </p>

          <h3>3.1 Types of cookies we use</h3>
          <ul>
            <li>
              <strong>Essential cookies</strong> — required for the service to
              function, including session authentication via HttpOnly cookies
            </li>
            <li>
              <strong>Preference cookies</strong> — remember your settings such
              as theme and language
            </li>
            <li>
              <strong>Analytics cookies</strong> — help us understand how you
              interact with our service
            </li>
          </ul>

          <h3>3.2 Cookie lifetime summary</h3>
          <table>
            <thead>
              <tr>
                <th>Cookie name</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>session_id</code>
                </td>
                <td>Essential</td>
                <td>Maintains your login session</td>
                <td>Session</td>
              </tr>
              <tr>
                <td>
                  <code>refresh_token</code>
                </td>
                <td>Essential</td>
                <td>Renews your access token securely</td>
                <td>30 days</td>
              </tr>
              <tr>
                <td>
                  <code>theme_pref</code>
                </td>
                <td>Preference</td>
                <td>Stores your light/dark mode preference</td>
                <td>1 year</td>
              </tr>
              <tr>
                <td>
                  <code>_analytics</code>
                </td>
                <td>Analytics</td>
                <td>Tracks anonymised usage patterns</td>
                <td>90 days</td>
              </tr>
            </tbody>
          </table>

          <p>
            You can instruct your browser to refuse all cookies or to indicate
            when a cookie is being sent. However, if you do not accept cookies,
            some parts of the service may not function correctly.
          </p>

          <h2>4. Data sharing and disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal information. We may
            share your information only in the following limited circumstances:
          </p>
          <ul>
            <li>
              <strong>Service providers</strong> — trusted third parties who
              assist in operating our website, processing payments, or
              delivering services, bound by confidentiality agreements
            </li>
            <li>
              <strong>Legal requirements</strong> — when required by law or to
              protect our rights, property, or safety
            </li>
            <li>
              <strong>Business transfers</strong> — in connection with a merger,
              acquisition, or sale of assets, with prior notice to you
            </li>
            <li>
              <strong>With your consent</strong> — for any other purpose with
              your explicit consent
            </li>
          </ul>

          <h2>5. Data retention</h2>
          <p>
            We retain your personal data for as long as your account is active
            or as needed to provide you with our services. The table below
            summarises our retention periods by data category:
          </p>
          <table>
            <thead>
              <tr>
                <th>Data category</th>
                <th>Retention period</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account information</td>
                <td>Until account deletion</td>
                <td>Service delivery</td>
              </tr>
              <tr>
                <td>Billing records</td>
                <td>7 years after last transaction</td>
                <td>Tax and legal compliance</td>
              </tr>
              <tr>
                <td>Support conversations</td>
                <td>3 years</td>
                <td>Quality assurance</td>
              </tr>
              <tr>
                <td>Log data</td>
                <td>90 days</td>
                <td>Security monitoring</td>
              </tr>
              <tr>
                <td>Analytics data</td>
                <td>24 months (anonymised)</td>
                <td>Product improvement</td>
              </tr>
            </tbody>
          </table>
          <p>
            You may request deletion of your account and associated data at any
            time by contacting us. Note that some information may be retained
            beyond that period to comply with legal obligations.
          </p>

          <h2>6. Data security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information. These measures include:
          </p>
          <ul>
            <li>
              Encryption
              <ul>
                <li>All data in transit is encrypted using TLS 1.2+</li>
                <li>Data at rest is encrypted using AES-256</li>
              </ul>
            </li>
            <li>
              Authentication
              <ul>
                <li>Passwords are hashed with bcrypt (cost factor 12)</li>
                <li>
                  Refresh tokens are stored in secure, HttpOnly, SameSite
                  cookies
                </li>
                <li>MFA is available for all accounts</li>
              </ul>
            </li>
            <li>Regular security audits and penetration testing</li>
            <li>Strict role-based access controls for internal systems</li>
          </ul>

          <blockquote>
            No method of transmission over the internet or electronic storage is
            100% secure. While we strive to use commercially acceptable means to
            protect your data, we cannot guarantee absolute security.
          </blockquote>

          <h2>7. Third-party services</h2>

          <h3>7.1 Services we use</h3>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Data shared</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google OAuth</td>
                <td>Social sign-in</td>
                <td>Email, name, profile picture</td>
              </tr>
              <tr>
                <td>Stripe</td>
                <td>Payment processing</td>
                <td>Billing details, transaction history</td>
              </tr>
              <tr>
                <td>Postmark</td>
                <td>Transactional email</td>
                <td>Email address, name</td>
              </tr>
              <tr>
                <td>Sentry</td>
                <td>Error monitoring</td>
                <td>Anonymised error traces</td>
              </tr>
            </tbody>
          </table>
          <p>
            Each provider has their own privacy policy governing their use of
            your information. We encourage you to review those policies
            directly.
          </p>

          <h2>8. Your rights</h2>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <ul>
            <li>
              <strong>Access</strong> — request a copy of the data we hold about
              you
            </li>
            <li>
              <strong>Correction</strong> — request that we correct inaccurate
              data
            </li>
            <li>
              <strong>Deletion</strong> — request that we delete your personal
              data
            </li>
            <li>
              <strong>Portability</strong> — request your data in a
              machine-readable format
            </li>
            <li>
              <strong>Objection</strong> — object to certain types of processing
            </li>
          </ul>

          <h3>8.1 How to submit a request</h3>
          <ol>
            <li>
              Log in to your account and visit{' '}
              <strong>Settings &rarr; Privacy</strong>
            </li>
            <li>
              Select the type of request — <em>Access</em>, <em>Correction</em>,{' '}
              <em>Deletion</em>, or <em>Export</em>
            </li>
            <li>Submit the form; you will receive a confirmation email</li>
            <li>
              We will respond within <strong>30 days</strong> in accordance with
              applicable law
            </li>
          </ol>

          <h2>9. Children&apos;s privacy</h2>
          <p>
            Our service is not directed to individuals under the age of 13. We
            do not knowingly collect personally identifiable information from
            children under 13. If we discover that a child under 13 has provided
            us with personal information, we will delete such information from
            our servers immediately.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by:
          </p>
          <ul>
            <li>Posting the updated policy on this page</li>
            <li>
              Updating the <strong>Last updated</strong> date at the top
            </li>
            <li>
              Sending an in-app notification or email for material changes
            </li>
          </ul>

          <h2>11. Contact</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at:
          </p>
          <ul>
            <li>
              Email:{' '}
              <a href="mailto:privacy@bordaevent.com">privacy@bordaevent.com</a>
            </li>
            <li>Website: bordaevent.com/contact</li>
          </ul>
        </RichContent>
      </div>
    </main>
  )
}

export default PrivacyPage
