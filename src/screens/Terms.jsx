import { useNav } from '../context/NavigationContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

export default function Terms() {
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
          <span className="eyebrow">LEGAL · FLIGHT RULES</span>
          <h1 className="gradient-text" style={{ fontSize: 36, margin: '12px 0 6px', lineHeight: 1.1 }}>
            Terms of Service
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
            These Terms of Service ("Terms") govern your use of Void Shards and the Void Academy (together, the "Service"), a gamified coding education platform operated
            by the Void Shards team ("we", "us"). By creating an account or using the Service
            you agree to these Terms. If you do not agree, do not use the Service.
          </p>

          <Section n="1" title="Acceptance of Terms">
            <p>
              By accessing or using the Service, registering an account, or clearing any gate or quest,
              you confirm that you have read, understood, and agree to be bound by these Terms and by
              our Privacy Policy. These Terms may be updated from time to time (see "Changes to These
              Terms" below); continued use after an update constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section n="2" title="Eligibility &amp; Age Requirements">
            <p>
              Void Shards (the main academy) is intended for users aged 16 and older. If you
              are under the age of majority in your jurisdiction, you may only use the Service with the
              involvement and consent of a parent or legal guardian.
            </p>
            <p style={{ marginTop: 12 }}>
              <strong>Void Academy (ages 8–16):</strong> The Academy is designed for minors.
              For any learner under the age of majority, an account may only be created and held by a
              parent or legal guardian. The <strong>account holder must be the parent or legal
              guardian</strong>, who must provide verified consent before a child may participate. The
              parent/guardian is responsible for supervising the minor's use of the Service, for the
              accuracy of registration information, and for all activity under the account. We may
              require reasonable verification of parental consent and may suspend an Academy account if
              valid consent cannot be confirmed.
            </p>
          </Section>

          <Section n="3" title="Description of the Service">
            <p>
              The Service is a gamified coding academy. Void Shards teaches modern frontend
              development (HTML, CSS, JavaScript, TypeScript, React and related topics) through quests,
              "gates", XP, levels, leaderboards, and in-app rewards. Void Academy teaches
              ages 8–16 across visual block coding, Python, and JavaScript/React tracks through short,
              graded coding challenges and quizzes.
            </p>
            <p style={{ marginTop: 12 }}>
              The Service is provided on an evolving basis. Curriculum, gates, features, rewards,
              pricing, and gameplay mechanics may change, be added, or be removed at any time. We do
              not guarantee that any particular quest, feature, or reward will remain available.
            </p>
          </Section>

          <Section n="4" title="Account Responsibilities">
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for
              all activity that occurs under your account. You agree to provide accurate information,
              keep it current, and notify us promptly of any unauthorized use. You may not share,
              sell, or transfer your account. For Academy accounts, the parent/guardian account holder
              bears these responsibilities on behalf of the minor.
            </p>
          </Section>

          <Section n="5" title="Acceptable Use &amp; Anti-Cheat">
            <p>You agree not to:</p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 22 }}>
              <li>Submit work that is not your own, automate quest completion, or otherwise cheat to earn XP, ranks, badges, or rewards.</li>
              <li>Use bots, scrapers, exploits, or scripts to manipulate gameplay, leaderboards, or reward systems.</li>
              <li>Attempt to bypass gating, access controls, anti-cheat measures, or other users' accounts.</li>
              <li>Upload malicious code, harass other users, or post unlawful, abusive, or infringing content.</li>
              <li>Reverse-engineer, disrupt, or overload the Service or its infrastructure.</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              To protect the integrity of the academy, we use automated and manual anti-cheat measures
              that may analyze gameplay signals (for example, time spent, submission patterns, and
              paste activity). Violations may result in score resets, loss of rewards, suspension, or
              a permanent ban at our discretion.
            </p>
          </Section>

          <Section n="6" title="Shards — In-App Reward Only">
            <p>
              <strong>Shards is an in-app reward used within the Service.</strong> It represents
              progress and engagement and is intended for use inside the academy (for example, to
              unlock or replay content or to apply XP multipliers, where such features exist).
            </p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 22 }}>
              <li><strong>Shards has no guaranteed monetary value.</strong> We make no promise that it can be redeemed, exchanged, sold, or converted into fiat currency or any other asset.</li>
              <li>Shards is <strong>not</strong> a security, investment, share, or financial instrument, and is <strong>not</strong> intended to be one.</li>
              <li>Nothing in the Service constitutes financial, investment, legal, or tax advice. Any market figures, prices, or tokenomics shown in marketing or demo materials are illustrative and not an offer, guarantee, or promise of value.</li>
              <li>We may adjust, cap, expire, or discontinue Shards balances, earn rates, and mechanics at any time, including for Phase-1 launch.</li>
            </ul>
          </Section>

          <Section n="7" title="Season Pass &amp; Billing">
            <p>
              The Service offers free tiers and optional paid subscriptions ("Season Pass" / premium
              tiers). Pricing displayed at sign-up reflects <strong>Phase-1 launch pricing and is
              subject to change.</strong> Paid plans renew on a recurring basis (for example, monthly)
              until cancelled, and you authorize us or our payment processor to charge the applicable
              fee each billing period.
            </p>
            <ul style={{ margin: '10px 0 0', paddingLeft: 22 }}>
              <li>You may cancel a recurring subscription at any time; cancellation takes effect at the end of the current billing period.</li>
              <li>Except where required by law, fees already paid are non-refundable.</li>
              <li>We may change prices, plans, and benefits with reasonable notice; changes apply to future billing periods.</li>
              <li>For Academy accounts, only the parent/guardian account holder may purchase or manage a subscription.</li>
            </ul>
          </Section>

          <Section n="8" title="Termination &amp; Bans">
            <p>
              You may stop using the Service and request account deletion at any time. We may suspend,
              restrict, or permanently terminate your access — with or without notice — if you violate
              these Terms, engage in cheating or abuse, or where required to protect the Service or
              other users. On termination, your right to use the Service ends and any in-app balances,
              including Shards, may be forfeited.
            </p>
          </Section>

          <Section n="9" title="Disclaimers &amp; Limitation of Liability">
            <p>
              The Service is provided "as is" and "as available", without warranties of any kind,
              whether express or implied, including fitness for a particular purpose, accuracy of
              educational content, or uninterrupted availability. To the maximum extent permitted by
              law, we are not liable for any indirect, incidental, or consequential damages, or for any
              loss of data, rewards, or in-app value arising from your use of the Service.
            </p>
          </Section>

          <Section n="10" title="Changes to These Terms">
            <p>
              We may update these Terms as the Service evolves. When we make material changes, we will
              update the "Last updated" date and, where appropriate, notify you in-app or by email.
              Your continued use of the Service after changes take effect means you accept the revised
              Terms.
            </p>
          </Section>

          <Section n="11" title="Contact">
            <p>
              Questions about these Terms? Reach us at{' '}
              <a href="mailto:technjmd@gmail.com" style={{ color: 'var(--teal)' }}>technjmd@gmail.com</a>.
            </p>
          </Section>
        </div>

        <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => goto('landing')}>← Back to home</button>
          <button className="btn btn-ghost" onClick={() => goto('privacy')}>Privacy Policy →</button>
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
