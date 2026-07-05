import { useNav } from '../context/NavigationContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Privacy() {
  const { goto } = useNav()
  useScrollReveal()

  return (
    <div className="container" style={{ maxWidth: 820, paddingTop: 48, paddingBottom: 96 }}>
      <nav className="nav" style={{ marginBottom: 32 }}>
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => goto('landing')}>
          <img src="/LOGO.svg" alt="VOID SHARDS" style={{ height: 36 }} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => goto('landing')}>← Back to home</button>
      </nav>

      <div className="panel panel-glow" style={{ padding: '40px 36px' }}>
        <header style={{ marginBottom: 28 }}>
          <span className="eyebrow">LEGAL · DATA &amp; PRIVACY</span>
          <h1 className="gradient-text" style={{ fontSize: 36, margin: '12px 0 6px', lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--ink-2)', fontFamily: 'var(--f-mono)', fontSize: 13 }}>
            Void Shards &amp; Void Academy
          </p>
          <p style={{ color: 'var(--amber)', fontStyle: 'italic', fontSize: 14, marginTop: 10 }}>
            *Draft — pending legal review*
          </p>
          <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
            Last updated: June 2026 · Phase-1 launch
          </p>
        </header>

        <div style={{ color: 'var(--ink-1)', fontSize: 15, lineHeight: 1.7 }}>
          <p style={{ marginBottom: 20 }}>
            This Privacy Policy explains what information Void Shards and Void Academy (the "Service") collect, how we use and store it, and the choices and rights you
            have. We aim to collect only what we need to run the academy and to keep your data safe.
          </p>

          <Section n="1" title="Information We Collect">
            <p>We collect the following information directly from you and as you use the Service:</p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 22 }}>
              <li><strong>Account details:</strong> your email address and display name (and, for Academy accounts, the parent/guardian's account details and the learner's display name).</li>
              <li><strong>Learning progress &amp; analytics:</strong> your quest/gate completions, XP, levels, badges, and in-app $SHARD balance, plus gameplay analytics such as time spent on challenges and paste counts (used for progress tracking and anti-cheat).</li>
              <li><strong>Technical data:</strong> basic information your browser provides (for example, general device/browser type) needed to deliver and secure the Service.</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              We do not intentionally collect more personal data than necessary. Please do not submit
              sensitive personal information in free-text fields such as code submissions.
            </p>
          </Section>

          <Section n="2" title="How We Use Your Information">
            <ul style={{ margin: '0 0 0', paddingLeft: 22 }}>
              <li>To create and manage your account and authenticate you.</li>
              <li>To track learning progress, award XP/badges/$SHARD, and power leaderboards.</li>
              <li>To detect cheating and protect the integrity of the academy (anti-cheat).</li>
              <li>To operate, maintain, debug, and improve the Service.</li>
              <li>To communicate with you about your account, security, or important changes.</li>
            </ul>
          </Section>

          <Section n="3" title="How Your Data Is Stored">
            <p>
              Account data, learning progress, and analytics are stored using{' '}
              <strong>Supabase</strong>, our hosted backend and database provider, which processes and
              stores this data on our behalf. We rely on access controls and standard security
              practices to protect your information. No system is perfectly secure, but we take
              reasonable measures to safeguard your data.
            </p>
          </Section>

          <Section n="4" title="We Do Not Sell Your Data">
            <p>
              <strong>We do not sell your personal information.</strong> We do not rent or trade it for
              marketing purposes. We share data only with service providers that help us run the
              Service (such as Supabase for storage and a payment processor for subscriptions), or
              where required by law.
            </p>
          </Section>

          <Section n="5" title="Children's Data &amp; Parental Rights (Academy)">
            <p>
              Void Academy serves learners aged 8–16. For these accounts, the parent or legal
              guardian is the account holder and must provide verified consent before a child
              participates. We collect only the limited data needed to run the learning experience
              (display name and learning progress/analytics) and do not knowingly collect unnecessary
              personal information from children.
            </p>
            <p style={{ marginTop: 12 }}>
              As the parent/guardian, you may review your child's information, request corrections,
              withdraw consent, and request deletion of the child's data at any time by contacting us.
              If we learn we have collected a child's data without the required parental consent, we
              will delete it.
            </p>
          </Section>

          <Section n="6" title="Cookies &amp; Local Storage">
            <p>
              We use cookies and browser local storage for essential functions — for example, keeping
              you signed in, remembering your theme preference, and storing session state needed to run
              the academy. We do not use these for third-party advertising. You can clear or block
              cookies/local storage in your browser settings, but some features may not work correctly
              if you do.
            </p>
          </Section>

          <Section n="7" title="Data Retention &amp; Deletion">
            <p>
              We keep your information for as long as your account is active or as needed to provide the
              Service, comply with legal obligations, resolve disputes, and enforce our agreements. You
              (or, for Academy accounts, the parent/guardian) may request access to, correction of, or
              deletion of your personal data by emailing us. On a valid deletion request, we will
              remove your personal data, except where we are required to retain certain records by law.
            </p>
          </Section>

          <Section n="8" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy as the Service evolves. We will update the "Last
              updated" date above and, for material changes, notify you in-app or by email where
              appropriate.
            </p>
          </Section>

          <Section n="9" title="Contact">
            <p>
              Questions, requests, or concerns about your privacy? Contact us at{' '}
              <a href="mailto:technjmd@gmail.com" style={{ color: 'var(--teal)' }}>technjmd@gmail.com</a>.
            </p>
          </Section>
        </div>

        <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => goto('landing')}>← Back to home</button>
          <button className="btn btn-ghost" onClick={() => goto('terms')}>Terms of Service →</button>
        </div>
      </div>
    </div>
  )
}

function Section({ n, title, children }) {
  return (
    <section className="reveal" style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 19, marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--teal)' }}>{n}.</span>
        <span dangerouslySetInnerHTML={{ __html: title }} />
      </h2>
      <div style={{ color: 'var(--ink-1)' }}>{children}</div>
    </section>
  )
}
