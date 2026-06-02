import { RichContent } from '@pkg/ui'

import { BlogPageHero } from '@/app/_components/blog-page-hero'

const TermsPage = () => {
  return (
    <main>
      <BlogPageHero
        title="Terms of Service"
        description="Please read these terms carefully before using our services."
      />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <RichContent>
          <p className="text-muted-foreground">
            <strong>Last updated: January 1, 2026</strong>
          </p>
          <p>
            Welcome to Borda Event. By accessing or using our platform, you agree
            to be bound by these Terms of Service. If you do not agree to all of
            the terms and conditions of this agreement, you may not access or
            use our services.
          </p>

          <hr />

          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing and using Borda Event (&quot;Service&quot;), you accept
            and agree to be bound by the terms and provisions of this agreement.
            These Terms apply to all visitors, users, and others who access or
            use the Service.
          </p>

          <blockquote>
            These Terms constitute a legally binding agreement between you and
            Borda Event. Please read them carefully.
          </blockquote>

          <h2>2. Eligibility</h2>
          <p>To use our Service, you must meet the following requirements:</p>
          <ul>
            <li>Be at least 13 years of age</li>
            <li>
              Have the legal capacity to enter into a binding agreement in your
              jurisdiction
            </li>
            <li>Not be barred from receiving services under applicable law</li>
            <li>
              Not have previously had your account terminated by Borda Event for
              violations of these Terms
            </li>
          </ul>

          <h2>3. Use of service</h2>
          <p>
            You agree to use the Service only for lawful purposes and in a way
            that does not infringe the rights of others or restrict their use of
            the Service.
          </p>

          <h3>3.1 Permitted uses</h3>
          <ul>
            <li>Creating and managing your personal or business account</li>
            <li>Accessing content and features made available to your plan</li>
            <li>Interacting with other users in a respectful manner</li>
            <li>
              Integrating with our API within the rate limits of your plan
            </li>
          </ul>

          <h3>3.2 Prohibited uses</h3>
          <p>You may not use the Service to:</p>
          <ul>
            <li>
              Violate any applicable local, national, or international law or
              regulation
            </li>
            <li>
              Transmit unsolicited or unauthorised advertising or promotional
              material (spam)
            </li>
            <li>
              Impersonate any person or entity, or falsely state your
              affiliation with a person or entity
            </li>
            <li>
              Attempt to gain unauthorised access to any portion of the Service
              or its related systems
            </li>
            <li>
              Scrape, crawl, or otherwise extract data from the Service in an
              automated manner without prior written consent
            </li>
            <li>
              Upload or transmit viruses, malware, or any other malicious code
            </li>
          </ul>

          <h2>4. Accounts</h2>

          <h3>4.1 Registration</h3>
          <p>
            When you create an account, you must provide accurate and complete
            information. You are responsible for maintaining the confidentiality
            of your credentials and for all activity that occurs under your
            account.
          </p>

          <h3>4.2 Account security</h3>
          <ul>
            <li>
              You must notify us immediately of any unauthorised use of your
              account
            </li>
            <li>
              We recommend enabling multi-factor authentication (MFA) for
              additional security
            </li>
            <li>
              You are responsible for any actions taken using your credentials
            </li>
          </ul>

          <h3>4.3 Account types and limits</h3>
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Users</th>
                <th>Storage</th>
                <th>API requests / month</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Free</td>
                <td>1</td>
                <td>1 GB</td>
                <td>10,000</td>
              </tr>
              <tr>
                <td>Starter</td>
                <td>5</td>
                <td>20 GB</td>
                <td>100,000</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>25</td>
                <td>100 GB</td>
                <td>1,000,000</td>
              </tr>
              <tr>
                <td>Enterprise</td>
                <td>Unlimited</td>
                <td>Custom</td>
                <td>Unlimited</td>
              </tr>
            </tbody>
          </table>

          <h2>5. Intellectual property</h2>
          <p>
            The Service and its original content, features, and functionality
            are owned by Borda Event and are protected by international copyright,
            trademark, patent, trade secret, and other intellectual property
            laws.
          </p>

          <h3>5.1 Your content</h3>
          <p>
            You retain ownership of any content you submit, post, or display
            through the Service (&quot;Your Content&quot;). By submitting Your
            Content, you grant Borda Event a worldwide, non-exclusive,
            royalty-free licence to use, reproduce, and distribute it solely for
            the purpose of operating the Service.
          </p>

          <h3>5.2 Restrictions</h3>
          <p>You may not:</p>
          <ol>
            <li>
              Copy, modify, or distribute our proprietary software or content
            </li>
            <li>
              Reverse engineer or attempt to extract the source code of the
              Service
            </li>
            <li>
              Remove any copyright, trademark, or other proprietary notices
            </li>
            <li>
              Use our trademarks without prior written permission from Borda Event
            </li>
          </ol>

          <h2>6. Payments and subscriptions</h2>

          <h3>6.1 Billing</h3>
          <p>
            Paid plans are billed in advance on a monthly or annual basis. All
            fees are non-refundable except as required by law or as specifically
            stated in these Terms.
          </p>

          <h3>6.2 Price changes</h3>
          <p>
            We reserve the right to modify our pricing at any time. We will
            provide at least <strong>30 days&apos; notice</strong> before any
            price change takes effect for existing subscribers.
          </p>

          <h3>6.3 Refund policy</h3>
          <table>
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Eligible for refund</th>
                <th>Timeframe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Annual plan — change of mind</td>
                <td>Yes</td>
                <td>Within 14 days of purchase</td>
              </tr>
              <tr>
                <td>Monthly plan — change of mind</td>
                <td>No</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Service outage exceeding SLA</td>
                <td>Yes</td>
                <td>Applied as account credit</td>
              </tr>
              <tr>
                <td>Duplicate charge</td>
                <td>Yes</td>
                <td>Within 30 days of charge</td>
              </tr>
            </tbody>
          </table>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your account at any time without prior
            notice or liability for any reason, including if you breach these
            Terms. Upon termination:
          </p>
          <ul>
            <li>Your right to use the Service will immediately cease</li>
            <li>
              You may export your data within 30 days of termination notice
            </li>
            <li>
              All provisions that by their nature should survive termination
              shall survive, including:
              <ul>
                <li>Intellectual property provisions</li>
                <li>Warranty disclaimers</li>
                <li>Limitation of liability</li>
                <li>Indemnification obligations</li>
              </ul>
            </li>
          </ul>

          <h2>8. Disclaimer of warranties</h2>
          <p>
            The Service is provided on an <strong>&quot;as is&quot;</strong> and{' '}
            <strong>&quot;as available&quot;</strong> basis without any
            warranties of any kind, either express or implied, including but not
            limited to:
          </p>
          <ul>
            <li>Implied warranties of merchantability</li>
            <li>Fitness for a particular purpose</li>
            <li>Non-infringement</li>
            <li>Uninterrupted or error-free operation</li>
          </ul>

          <h2>9. Limitation of liability</h2>
          <p>
            In no event shall Borda Event, its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, punitive, or consequential damages, including
            but not limited to:
          </p>
          <ul>
            <li>Loss of profits or revenue</li>
            <li>Loss of data or business interruption</li>
            <li>Personal injury or property damage</li>
            <li>
              Any other damages arising out of your use of, or inability to use,
              the Service
            </li>
          </ul>

          <blockquote>
            Our total liability to you for any claims arising under these Terms
            shall not exceed the amount you paid to Borda Event in the twelve
            months preceding the claim.
          </blockquote>

          <h2>10. Governing law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the jurisdiction in which Borda Event is incorporated,
            without regard to its conflict of law provisions. Any disputes shall
            be resolved in the courts of that jurisdiction.
          </p>

          <h2>11. Changes to these terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will
            notify you of material changes by:
          </p>
          <ul>
            <li>Posting the updated Terms on this page</li>
            <li>
              Updating the <strong>Last updated</strong> date at the top
            </li>
            <li>Sending an email or in-app notification for major changes</li>
          </ul>
          <p>
            Continued use of the Service after changes become effective
            constitutes acceptance of the revised Terms.
          </p>

          <h2>12. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul>
            <li>
              Email:{' '}
              <a href="mailto:legal@bordaevent.com">legal@bordaevent.com</a>
            </li>
            <li>Website: bordaevent.com/contact</li>
          </ul>
        </RichContent>
      </div>
    </main>
  )
}

export default TermsPage
