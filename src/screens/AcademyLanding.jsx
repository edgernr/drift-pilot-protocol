import { useAuth } from '../context/AuthContext'
import { useAcademy } from '../context/AcademyContext'
import { useNav } from '../context/NavigationContext'
import './AcademyLanding.css'

const TRACKS = [
  {
    n: '01', name: 'BLOCK LAYER', theme: 'Visual block coding. No typing. Pure logic. Build the Construct one block at a time.',
    color: 'var(--amber)',   glow: 'oklch(0.82 0.18 75 / 0.18)',
    skills: ['Sequences', 'Loops', 'Conditionals', 'Variables', 'Events'],
    boss: 'THE GLITCH BLOCK', lang: 'Scratch · Ages 8–11', gates: 15,
  },
  {
    n: '02', name: 'CODE LAYER', theme: 'First real language. Readable and forgiving. The Construct gains rules and written laws.',
    color: 'var(--lime)',    glow: 'oklch(0.9 0.22 135 / 0.15)',
    skills: ['Variables', 'Functions', 'Lists', 'Loops', 'Files'],
    boss: 'THE RECURSION VAULT', lang: 'Python · Ages 11–14', gates: 15,
  },
  {
    n: '03', name: 'WEB LAYER', theme: 'First web language. Things appear in browsers. The Construct connects to the outside world.',
    color: 'var(--teal)',    glow: 'oklch(0.86 0.18 185 / 0.18)',
    skills: ['DOM', 'Events', 'Fetch', 'Components', 'State'],
    boss: 'THE WHITE SCREEN', lang: 'JavaScript · Ages 14–16', gates: 10,
  },
]

export default function AcademyLanding() {
  const { user } = useAuth()
  const { childProfiles, loading } = useAcademy()
  const { goto } = useNav()

  function handleEnter() {
    if (!user) { goto('academy/signup'); return }
    if (!loading && childProfiles.length > 0) goto('academy/dashboard')
    else goto('academy/onboarding')
  }

  return (
    <>
      <nav className="nav">
        <div className="logo">
          <img src="/LOGO.svg" alt="DRIFT PILOT PROTOCOL" style={{ height: 40 }} />
          <span className="chip chip-amber" style={{ fontSize: 9, padding: '2px 8px' }}>ACADEMY</span>
        </div>
        <ul>
          <li><a href="#tracks">Tracks</a></li>
          <li><a href="#howto">How It Works</a></li>
        </ul>
        {user
          ? <button className="btn btn-ghost btn-sm" onClick={handleEnter}>Enter Academy →</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => goto('academy/signup')}>Sign Up →</button>
        }
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="reveal">
              <span className="chip chip-amber">
                <span className="dot dot-pulse" /> DRIFT BUILDERS ACADEMY
              </span>
              <h1>
                <span className="line">Build the</span>
                <span className="line gradient-text">digital world.</span>
                <span className="line">From nothing.</span>
              </h1>
              <p className="lede">
                A coding academy for ages 8–16. Three tracks. Fifty gates.
                One world that grows with every Builder who enters it.
              </p>
              <div className="hero-ctas">
                <button className="btn btn-primary" onClick={handleEnter}>
                  {user ? 'Enter The Construct →' : 'Start Building →'}
                </button>
                <button className="btn btn-ghost" onClick={() => goto('landing')}>
                  Main Platform
                </button>
              </div>
              <div className="hero-meta">
                <div>
                  <div className="num">3</div>
                  <div className="lbl">Tracks</div>
                </div>
                <div>
                  <div className="num">50</div>
                  <div className="lbl">Gates total</div>
                </div>
                <div>
                  <div className="num">8–16</div>
                  <div className="lbl">Age range</div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="panel panel-glow hero-card">
                <div className="hero-card-header">
                  <div className="hc-dots"><span /><span /><span /></div>
                  <div className="hc-title">gate_S-01 / the-first-block</div>
                  <div className="hc-title teal-text">● ACTIVE</div>
                </div>
                <div className="hero-card-body">
                  <div className="quest-header">
                    <div>
                      <div className="quest-title">The First Block</div>
                      <div className="quest-sub">TRACK 01 · Gate S-01 · Sequences</div>
                    </div>
                    <div className="reward-pill" style={{ background: 'oklch(0.82 0.18 75 / 0.12)', borderColor: 'oklch(0.82 0.18 75 / 0.35)', color: 'var(--amber)' }}>
                      <div className="coin" style={{ background: 'radial-gradient(circle at 30% 30%, oklch(0.95 0.22 80), oklch(0.65 0.22 60))' }}>B</div>
                      +80 XP
                    </div>
                  </div>
                  <div className="code-block">
                    <div><span className="ln">1</span><span className="tk-com">{'// Put the blocks in the right order:'}</span></div>
                    <div><span className="ln">2</span><span className="tk-kw">when</span> <span className="tk-fn">flag clicked</span></div>
                    <div><span className="ln">3</span>&nbsp;&nbsp;<span className="tk-str">move 10 steps</span></div>
                    <div><span className="ln">4</span>&nbsp;&nbsp;<span className="tk-fn">wait</span> <span className="tk-num">1</span> <span className="tk-fn">second</span></div>
                    <div><span className="ln">5</span>&nbsp;&nbsp;<span className="tk-str">say "Hello!"</span></div>
                  </div>
                  <div>
                    <div className="test-row pass"><div className="check">✓</div><span>sprite moves forward</span></div>
                    <div className="test-row pass"><div className="check">✓</div><span>waits before speaking</span></div>
                    <div className="test-row pending"><div className="check">○</div><span>correct sequence order</span></div>
                  </div>
                </div>
                <div className="hero-card-footer">
                  <span className="chip chip-amber">XP 80 / 1,450</span>
                  <div className="xp-bar"><div className="fill" style={{ width: '5%', background: 'linear-gradient(90deg, var(--amber), var(--lime))' }} /></div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>Gate 1 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACKS ────────────────────────────────────────── */}
      <section id="tracks">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">THREE TRACKS</span>
            <h2>Block coding. Python. JavaScript.</h2>
            <p>Answer three questions and we place your builder in the right track at the right gate. No guessing.</p>
          </div>
          <div className="world-row reveal">
            {TRACKS.map(t => (
              <div key={t.n} className="world-card wc-on" style={{ '--wc': t.color, '--wg': t.glow }}>
                <div className="wc-meta">
                  <span className="wc-num">TRACK {t.n}</span>
                  <span className="wc-tag wc-tag-on">{t.gates} GATES</span>
                </div>
                <div className="wc-name">{t.name}</div>
                <p className="wc-theme">{t.theme}</p>
                <div className="wc-skills">
                  {t.skills.map(s => <span key={s} className="wc-skill">{s}</span>)}
                </div>
                <div className="wc-boss-block">
                  <div className="wc-boss-lbl">{t.lang}</div>
                  <div className="wc-boss-name">{t.boss}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="howto">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>Three questions. Your track. Fifty gates.</h2>
            <p>No placement test. No trial and error. Three questions place your builder exactly where they need to start.</p>
          </div>
          <div className="pricing reveal">
            <div className="panel price-card">
              <div>
                <div className="tier">STEP 01</div>
                <div className="amount" style={{ marginTop: 12, fontSize: 40 }}>Age</div>
              </div>
              <h3>Pick your builder's age.</h3>
              <ul>
                <li>8–10 → Block Layer track</li>
                <li>11–13 → Python or JS track</li>
                <li>14–16 → Python or JS track</li>
                <li>Ages under 8: come back soon</li>
              </ul>
            </div>
            <div className="panel price-card featured">
              <div>
                <div className="tier">STEP 02</div>
                <div className="amount" style={{ marginTop: 12, fontSize: 40 }}>Exp</div>
              </div>
              <h3>How much coding experience?</h3>
              <ul>
                <li>Never touched it → Gate 01</li>
                <li>Tried a little → Gate 03</li>
                <li>Know some basics → Gate 06</li>
                <li>Knows Python/JS → Main platform</li>
              </ul>
            </div>
            <div className="panel price-card">
              <div>
                <div className="tier">STEP 03</div>
                <div className="amount" style={{ marginTop: 12, fontSize: 40 }}>Build</div>
              </div>
              <h3>What do they want to make?</h3>
              <ul>
                <li>Games → Block / Python</li>
                <li>Websites → JavaScript</li>
                <li>Apps &amp; tools → Python</li>
                <li>Just curious → Start anywhere</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="final-cta">
        <div className="container reveal">
          <span className="eyebrow">READY TO BUILD</span>
          <h2 style={{ marginTop: 16 }}>
            Press start.<br />
            <span className="gradient-text">The Construct awaits.</span>
          </h2>
          <p>No token economy. No financial mechanics. Just building.<br />Parent account required for ages 8–13.</p>
          <button className="btn btn-primary" onClick={handleEnter}>
            {user ? 'Enter The Construct →' : 'Start Building →'}
          </button>
        </div>
      </section>

      <footer>
        <div className="container inner">
          <div>© 2026 Drift Builders Academy · No token economy · Ages 8–16</div>
          <div className="right">
            <a onClick={() => goto('landing')} style={{ cursor: 'pointer' }}>Main Platform</a>
            <a href="#">Discord</a>
            <a href="#">Parents FAQ</a>
          </div>
        </div>
      </footer>
    </>
  )
}
