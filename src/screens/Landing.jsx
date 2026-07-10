import { useState, useEffect, useRef } from 'react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './Landing.css'

const STEPS = [
  { rank: 'e', n: '01', title: 'Awaken',             desc: 'Take the Awakening test. The System reads your level and assigns your first E-rank Gate. No setup, no wallet.' },
  { rank: 'd', n: '02', title: 'Enter a Gate',        desc: 'Each Gate is a contained coding mission with a clear objective, a live editor, and a System that checks your work.' },
  { rank: 'c', n: '03', title: 'Clear it',            desc: 'Pass every objective to clear the Gate. You earn XP and Void Shards the moment it closes.' },
  { rank: 'b', n: '04', title: 'Rank up',             desc: 'XP raises your Seeker rank E→D→C→B→A→S. Higher ranks unlock harder Gates and rarer rewards.' },
  { rank: 's', n: '05', title: 'Build real projects', desc: 'S-rank Gates are full builds — ship a real app, add it to your portfolio, prove the skill is yours.' },
]

const RANKS = [
  { r: 's', name: 'Sovereign',   desc: 'Ship production-grade builds', xp: '120,000 XP', gold: true },
  { r: 'a', name: 'Ascendant',   desc: 'Architect full features',      xp: '60,000 XP' },
  { r: 'b', name: 'Breaker',     desc: 'Compose real components',      xp: '28,000 XP' },
  { r: 'c', name: 'Clearer',     desc: 'Solve multi-step Gates',       xp: '12,000 XP' },
  { r: 'd', name: 'Delver',      desc: 'Handle the fundamentals',      xp: '4,000 XP'  },
  { r: 'e', name: 'Unawakened',  desc: 'Where every Seeker begins',    xp: '0 XP',  dim: true },
]

const FAQS = [
  { q: 'Do I need to know how to code already?',
    a: 'No. Gate 01 is E-rank — designed for complete beginners. The System checks your code against clear objectives and you progress at your own pace.' },
  { q: 'How do Void Shards actually work?',
    a: "Shards are points you earn by clearing Gates and holding streaks. Spend them in-game on hints, retries, and cosmetics. They're stored in your Seeker profile — no purchase required, ever." },
  { q: 'Is there any crypto in this?',
    a: "No. Void Shards are in-game points, earned only by playing — like XP in any game. There's no wallet, no purchase, and nothing on-chain. You learn, you earn, you spend them in-game. That's it." },
  { q: 'Is the code real, or just quizzes?',
    a: "Real. You write actual code in a live editor and the System grades it against the Gate's objectives. Each gate has an anti-cheat quiz to confirm you understood what you built." },
  { q: 'Is there a track for kids?',
    a: 'Yes — Void Academy is built for ages 8–16 with Scratch, Python, and JavaScript tracks, gentler threats, and parent account controls.' },
]

const fmt = n => {
  if (n === null || n === undefined) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return Math.round(n / 1e3) + 'k'
  return String(n)
}

export default function Landing() {
  const { goto } = useNav()
  const { user, profile } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [stats, setStats] = useState({ pilots: null, gates: null })
  const [openFaq, setOpenFaq] = useState(0)
  const particleRef = useRef(null)

  // New hunters (prologue not done, zero clears) enter through "Zero Hour".
  const needsPrologue = profile?.prologue_done === false && (profile?.questsCompleted ?? 0) === 0
  const enter = () => goto(user ? (needsPrologue ? 'prologue' : 'quest') : 'signup')

  // Nav scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Platform stats
  useEffect(() => {
    supabase.from('platform_stats').select('pilots, total_xp, gates_cleared').single()
      .then(({ data }) => {
        setStats(data
          ? { pilots: Number(data.pilots) || 0, gates: Number(data.gates_cleared) || 0 }
          : { pilots: 0, gates: 0 })
      }, () => setStats({ pilots: 0, gates: 0 }))
  }, [])

  // Gate particles (26 rising embers, ~18% chance gold)
  useEffect(() => {
    const layer = particleRef.current
    if (!layer) return
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('span')
      p.className = 'p'
      p.style.left = (18 + Math.random() * 64) + '%'
      const size = 2 + Math.random() * 2.5
      p.style.width = size + 'px'
      p.style.height = size + 'px'
      p.style.animationDuration = (4 + Math.random() * 5) + 's'
      p.style.animationDelay   = '-' + (Math.random() * 6) + 's'
      if (Math.random() > 0.82) {
        p.style.background  = 'var(--lp-gold-bright)'
        p.style.boxShadow   = '0 0 8px rgba(245,196,83,0.9)'
      }
      layer.appendChild(p)
    }
    return () => { if (layer) layer.innerHTML = '' }
  }, [])

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.landing-page .lp-reveal')
    if (!els.length) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Journey track fill
  useEffect(() => {
    const track = document.getElementById('lp-journey-track')
    if (!track) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const i = track.querySelector('i')
          if (i) i.style.width = '100%'
          io.unobserve(track)
        }
      })
    }, { threshold: 0.4 })
    io.observe(track)
    return () => io.disconnect()
  }, [])

  // Bar fills
  useEffect(() => {
    const bars = document.querySelectorAll('.landing-page [data-lp-fill]')
    if (!bars.length) return
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const i = e.target.querySelector('i')
          if (i) i.style.width = e.target.dataset.lpFill + '%'
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })
    bars.forEach(b => io.observe(b))
    return () => io.disconnect()
  }, [])

  return (
    <div className="landing-page">
      <div className="lp-scanlines" />
      <div className="lp-grain" />

      {/* ── NAV ── */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-brand">
          <span className="lp-mark" />
          Void Shards
        </div>
        <div className="lp-links">
          <a href="#journey">Journey</a>
          <a href="#worlds">Worlds</a>
          <a href="#gate">Gates</a>
          <a href="#ranks">Ranks</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="lp-nav-right">
          {user
            ? <button className="lp-btn lp-ghost lp-sm" onClick={() => goto('dashboard')}>Dashboard →</button>
            : <button className="lp-btn lp-gold" onClick={() => goto('signup')}>Awaken <span className="arr">⟶</span></button>
          }
        </div>
      </nav>

      <main className="lp-wrap">

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="hero-copy">
            <span className="lp-eyebrow">System online // Void Shards</span>
            <h1 className="h-xl">
              <span className="l1">Awaken</span>
              <span className="l1">as a <span className="tint-cyan">Seeker.</span></span>
              <span className="l2">Clear <b>Gates.</b> Level up as a <b>developer.</b></span>
            </h1>
            <p className="lp-lead">
              Void Shards turns learning to code into a Solo-Leveling-style ascent.
              Step through a Gate, clear a real coding mission, earn XP and $SHARD,
              and rank up from E to S as your actual skills grow.
            </p>
            <div className="hero-cta">
              <button className="lp-btn lp-cyan" onClick={enter}>Enter the first Gate <span className="arr">⟶</span></button>
              <button className="lp-btn lp-ghost" onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
            </div>
            <div className="hero-stats">
              <div className="s">
                <div className="n">{fmt(stats.pilots)}</div>
                <div className="k">Seekers awakened</div>
              </div>
              <div className="s">
                <div className="n">{fmt(stats.gates)}</div>
                <div className="k">Gates cleared</div>
              </div>
              <div className="s">
                <div className="n">Season <span className="u">01</span></div>
                <div className="k">The Abyss is open</div>
              </div>
            </div>
          </div>

          {/* Gate visual */}
          <div className="gate-stage">
            <div className="gate-vis">
              <span className="frame-br tl" /><span className="frame-br tr" />
              <span className="frame-br bl" /><span className="frame-br brr" />
              <div className="lp-gate-glow" />
              <div className="lp-arch a1" />
              <div className="lp-arch a2" />
              <div className="lp-arch a3" />
              <div className="lp-gate-core" />
              <div className="lp-gate-beam" />
              <div className="lp-gate-particles" ref={particleRef} />
              <div className="lp-seeker" />
              <div className="lp-gate-floor" />
              <div className="lp-gate-readout">
                GATE // OPEN<br />
                <span className="d">THREAT: E-RANK</span><br />
                <span className="d">STATUS: STABLE</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── JOURNEY ── */}
        <section className="lp-sec" id="journey">
          <div className="lp-sec-head">
            <span className="lp-eyebrow">// The Seeker's journey</span>
            <h2 className="h-lg lp-reveal">From <span className="tint-dim">E-rank</span> novice<br />to <span className="tint-gold">S-rank</span> developer.</h2>
            <p className="lp-lead lp-reveal">No abstract "learning paths." A clear loop you can feel: awaken, enter a Gate, clear it, rank up, and walk out with real projects.</p>
          </div>

          <div className="lp-journey lp-reveal">
            <div className="lp-journey-track" id="lp-journey-track"><i /></div>
            {STEPS.map(step => (
              <div key={step.n} className="lp-j-step">
                <span className="lp-j-dot" />
                <div className="lp-j-node lp-panel">
                  <span className={`lp-rank ${step.rank}`}>{step.rank.toUpperCase()}</span>
                  <div className="j-num">{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WORLDS ── */}
        <section className="lp-sec" id="worlds">
          <div className="lp-sec-head split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <span className="lp-eyebrow">// Choose your world</span>
              <h2 className="h-lg lp-reveal">Three worlds.<br />One ascent.</h2>
            </div>
            <p className="lp-lead lp-reveal">Each world is a different domain with its own mood, its own Gates, and its own threats. Start anywhere.</p>
          </div>

          <div className="lp-worlds">
            <article className="lp-world abyss lp-reveal" onClick={enter}>
              <div className="w-bg" />
              <div className="w-inner">
                <div className="w-label">World 01 — Frontend &amp; web</div>
                <h3>The Abyss</h3>
                <p>A dark-fantasy descent through the building blocks of the web. Bend HTML, command CSS, and animate the interface until the void renders exactly as you will it.</p>
                <div className="w-meta">
                  <span className="lp-tag cyan">HTML · CSS · JS</span>
                  <span className="lp-tag">10 Gates</span>
                  <span className="lp-tag">Rank E–B</span>
                </div>
                <span className="w-enter">Descend into the Abyss <span className="arr">⟶</span></span>
              </div>
            </article>

            <article className="lp-world night lp-reveal">
              <div className="w-bg" />
              <div className="w-inner">
                <div className="w-label">World 02 — Software engineering</div>
                <h3>Night City</h3>
                <p>A neon sprawl of systems, data structures and algorithms. Run jobs, route requests, survive the architecture.</p>
                <div className="w-meta">
                  <span className="lp-tag magenta">Algorithms · APIs</span>
                  <span className="lp-tag">Coming Season 02</span>
                </div>
                <span className="w-enter magenta">Jack into Night City <span className="arr">⟶</span></span>
              </div>
            </article>

            <article className="lp-world young lp-reveal" onClick={() => goto('academy')}>
              <div className="w-bg" />
              <div className="w-inner">
                <div className="w-label">World 03 — Young Seekers</div>
                <h3>The Academy</h3>
                <p>A brighter, friendlier training ground for young Seekers (8–16). Same Gates, gentler threats, colorful guides.</p>
                <div className="w-meta">
                  <span className="lp-tag gold">Ages 8–16</span>
                  <span className="lp-tag">Guided</span>
                </div>
                <span className="w-enter gold">Enter the Academy <span className="arr">⟶</span></span>
              </div>
            </article>
          </div>
        </section>

        {/* ── SAMPLE GATE ── */}
        <section className="lp-sec" id="gate">
          <div className="lp-sec-head">
            <span className="lp-eyebrow">// Sample Gate</span>
            <h2 className="h-lg lp-reveal">Look inside a Gate.</h2>
          </div>

          <div className="lp-gate-sample">
            <div className="lp-reveal">
              <p className="lp-lead">Every Gate is a mission briefing: a clear objective, a rank, and a fixed reward. The System grades your code against the objectives — clear them all and the Gate closes, paying out XP and Void Shards instantly.</p>
              <div className="gate-icons">
                <div className="gi-row">
                  <span className="lp-rank c sm" style={{ display: 'inline-flex' }}>C</span>
                  <span className="lp-mono gi-text">Rank scales with the threat inside</span>
                </div>
                <div className="gi-row">
                  <span className="lp-shard lg" />
                  <span className="lp-mono gi-text">Shards drop the instant a Gate clears</span>
                </div>
              </div>
              <button className="lp-btn lp-cyan" style={{ marginTop: 34 }} onClick={enter}>Enter Gate 01 <span className="arr">⟶</span></button>
            </div>

            <div className="lp-panel lp-cyan-edge lp-gate-window lp-reveal">
              <div className="br tl" /><div className="br tr" />
              <div className="br bl" /><div className="br br2" />
              <div className="gw-head">
                <span className="gw-id">▸ Gate 01 // The Abyss</span>
                <span className="gw-stat">STATUS: UNCLEARED</span>
              </div>
              <div className="gw-body">
                <div className="gw-title">
                  <h3>The Document Tomb</h3>
                  <span className="lp-rank e">E</span>
                </div>
                <div className="gw-sub">Objective — find and fix all 4 markup errors in the broken HTML document</div>
                <div className="gw-rewards">
                  <div className="gw-reward xp">
                    <div className="k">XP Reward</div>
                    <div className="v">+100</div>
                  </div>
                  <div className="gw-reward shard">
                    <div className="k">Void Shards</div>
                    <div className="v"><span className="lp-shard" /> 80</div>
                  </div>
                </div>
                <div className="gw-obj">
                  <div className="o done"><span className="bx" /> Semantic structure: correct DOCTYPE</div>
                  <div className="o done"><span className="bx" /> All tags properly closed</div>
                  <div className="o"><span className="bx" /> Required attributes present</div>
                  <div className="o"><span className="bx" /> No nesting violations</div>
                </div>
              </div>
              <div className="gw-foot">
                <div className="gw-diff">
                  Difficulty <span className="lp-bar" data-lp-fill="20"><i /></span>
                </div>
                <button className="lp-btn lp-gold gw-btn" onClick={enter}>Clear Gate <span className="arr">⟶</span></button>
              </div>
            </div>
          </div>
        </section>

        {/* ── RANKS & SHARDS ── */}
        <section className="lp-sec" id="ranks">
          <div className="lp-sec-head">
            <span className="lp-eyebrow gold">// Ranks &amp; Void Shards</span>
            <h2 className="h-lg lp-reveal">Climb the ladder.<br />Bank the <span className="tint-gold">Shards.</span></h2>
          </div>

          <div className="lp-ranks-grid">
            <div className="lp-ladder lp-reveal">
              {RANKS.map(r => (
                <div key={r.r} className={`lp-row${r.gold ? ' gold' : ''}`}>
                  <span className={`lp-rank ${r.r}`}>{r.r.toUpperCase()}</span>
                  <div>
                    <div className={`lvl-name${r.gold ? ' tint-gold' : r.dim ? ' tint-dim' : ''}`}>{r.name}</div>
                    <div className="lvl-desc">{r.desc}</div>
                  </div>
                  <div className="lvl-xp">{r.xp}</div>
                </div>
              ))}
            </div>

            <div className="lp-shard-side lp-reveal">
              <div className="shard-visual">
                <div className="big-shard"><span className="shard-label">$SHARD</span></div>
              </div>
              <div className="shard-points">
                {[
                  { title: 'Earned, not bought',  body: "Shards only drop from clearing Gates and keeping streaks. You can't buy your way up a rank." },
                  { title: 'Spend them in-game',  body: 'Trade Shards for hints, Gate retries, cosmetic gear, and early access to new worlds.' },
                  { title: 'Yours to keep',        body: 'Shards live in your Seeker profile. No wallet, no purchase, no obligation — ever.' },
                ].map(pt => (
                  <div key={pt.title} className="shard-pt">
                    <span className="lp-shard pt-ic" />
                    <div><h4>{pt.title}</h4><p>{pt.body}</p></div>
                  </div>
                ))}
              </div>
              <div className="wallet-note">
                <b>Points, not crypto.</b> Void Shards are in-game progression points — earned by clearing Gates, spent on hints, retries, and cosmetics. No wallet, no purchases, nothing on-chain.
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST / FAQ ── */}
        <section className="lp-sec" id="faq">
          <div className="lp-sec-head">
            <span className="lp-eyebrow">// System log / FAQ</span>
            <h2 className="h-lg lp-reveal">Before you awaken.</h2>
          </div>

          <div className="lp-trust-grid">
            <div className="trust-left lp-reveal">
              <div className="who">
                <div className="who-item">
                  <div className="who-k">Who built this</div>
                  <p>A small team of working developers and game designers who were tired of tutorials that felt like chores. We build the Gates we wish we'd learned from.</p>
                </div>
                <div className="who-item">
                  <div className="who-k">The roadmap</div>
                  <p>Season 01 (The Abyss) is live. Night City enters open beta next, followed by a Season 02 of S-rank project Gates.</p>
                </div>
              </div>
              <div className="lp-disclaimer">
                ⚠ Void Shards is an independent learning platform. It is <b>not affiliated with, sponsored by, or endorsed by any cryptocurrency project</b>. "$SHARD" / "Void Shards" are in-app progression points — not a cryptocurrency, not an investment, and they carry no monetary value.
              </div>
            </div>

            <div className="lp-faq lp-reveal">
              {FAQS.map((item, i) => (
                <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    {item.q} <span className="pm">+</span>
                  </button>
                  <div className="faq-a"><div className="faq-inner">{item.a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── FINAL CTA ── */}
      <section className="lp-final">
        <div className="lp-glowline" />
        <div className="lp-wrap">
          <span className="lp-eyebrow" style={{ justifyContent: 'center' }}>// The Gate is open</span>
          <h2 className="h-lg lp-reveal" style={{ marginTop: 18 }}>Will you <span className="tint-cyan">awaken?</span></h2>
          <p className="lp-lead lp-reveal">Step through your first Gate in under a minute. No card, no wallet, no setup — just you and the void.</p>
          <div className="lp-final-cta">
            <button className="lp-btn lp-gold" onClick={enter}>Awaken now <span className="arr">⟶</span></button>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div className="lp-brand">
            <span className="lp-mark" />
            Void Shards
          </div>
          <div className="lp-f-links">
            <a href="#journey">Journey</a>
            <a href="#worlds">Worlds</a>
            <a href="#ranks">Ranks</a>
            <a href="#faq">FAQ</a>
            <button onClick={() => goto('terms')}>Terms</button>
            <button onClick={() => goto('privacy')}>Privacy</button>
          </div>
          <div className="lp-copy">© 2026 Void Shards — an independent learning platform.</div>
        </div>
      </footer>
    </div>
  )
}
