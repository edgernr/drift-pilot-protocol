import { useState, useEffect } from 'react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const { goto } = useNav()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  useScrollReveal()

  const [stats, setStats] = useState({ pilots: null, xp: null, gates: null })
  useEffect(() => {
    // platform_stats is a privacy-safe public view (pretest_setup.sql) that
    // aggregates platform-wide totals server-side — quest_completions RLS
    // (correctly) blocks anon/cross-user reads, so we cannot sum them client-side.
    supabase.from('platform_stats').select('pilots, total_xp, gates_cleared').single()
      .then(({ data }) => {
        setStats(data
          ? { pilots: Number(data.pilots) || 0, xp: Number(data.total_xp) || 0, gates: Number(data.gates_cleared) || 0 }
          : { pilots: 0, xp: 0, gates: 0 })
      }, () => setStats({ pilots: 0, xp: 0, gates: 0 }))
  }, [])

  return (
    <>
      <nav className="nav">
        <div className="logo">
          <img src="/LOGO.svg" alt="DRIFT PILOT PROTOCOL" style={{ height: 40 }} />
          <span className="chip chip-teal" style={{ fontSize: 9, padding: '2px 8px' }}>BETA</span>
        </div>
        <ul>
          <li><a href="#worlds">Worlds</a></li>
          <li><a href="#worlds">Quests</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#academy" style={{ color: 'var(--builder-gold, oklch(0.86 0.19 80))' }}>Academy</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); goto('downloads') }}>Download App</a></li>
        </ul>
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleTheme}
          style={{ padding: '8px 12px', fontSize: 15, lineHeight: 1 }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀' : '◑'}
        </button>
        {user
          ? <button className="btn btn-ghost btn-sm" onClick={() => goto('dashboard')}>Dashboard →</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => goto('signup')}>Sign Up / Log In →</button>
        }
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="reveal">
              <span className="chip chip-violet"><span className="dot dot-pulse" /> SEASON 01 · NOW LIVE</span>
              <h1>
                <span className="line">Level up</span>
                <span className="line gradient-text">your frontend.</span>
                <span className="line">Get paid in $DRIFT.</span>
              </h1>
              <p className="lede">
                A gamified coding academy where every quest you ship earns real on-chain rewards.
                Learn React, TypeScript &amp; modern frontend — mission by mission, XP by XP.
              </p>
              <div className="hero-ctas">
                {user
                  ? <button className="btn btn-primary" onClick={() => goto('dashboard')}>Go to Dashboard →</button>
                  : <button className="btn btn-primary" onClick={() => goto('signup')}>Start Season 01 →</button>
                }
                <button className="btn btn-ghost" onClick={() => goto(user ? 'quest' : 'signup')}>Try a Quest</button>
              </div>
              <div className="hero-meta">
                <div>
                  <div className="num">{stats.pilots !== null ? stats.pilots.toLocaleString() : '—'}</div>
                  <div className="lbl">Pilots enrolled</div>
                </div>
                <div>
                  <div className="num">{stats.xp !== null ? stats.xp.toLocaleString() : '—'}</div>
                  <div className="lbl">Total XP earned</div>
                </div>
                <div>
                  <div className="num">{stats.gates !== null ? stats.gates.toLocaleString() : '—'}</div>
                  <div className="lbl">Gates cleared</div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <div className="panel panel-glow hero-card">
                <div className="hero-card-header">
                  <div className="hc-dots"><span /><span /><span /></div>
                  <div className="hc-title">quest_042 / flex-row-puzzle.tsx</div>
                </div>
                <div className="hero-card-body">
                  <div className="quest-header">
                    <div>
                      <div className="quest-title">The Flexbox Vault</div>
                      <div className="quest-sub">ACT II · Chapter 04</div>
                    </div>
                    <div className="reward-pill">
                      <div className="coin">E</div>
                      +240 $DRIFT
                    </div>
                  </div>
                  <div className="code-block">
                    <div><span className="ln">1</span><span className="tk-com">{'// Align the cards horizontally, spaced evenly.'}</span></div>
                    <div><span className="ln">2</span><span className="tk-kw">const</span> Vault = () =&gt; (</div>
                    <div><span className="ln">3</span>&nbsp;&nbsp;&lt;<span className="tk-fn">div</span> <span className="tk-prop">className</span>=<span className="tk-str">"flex ___-___"</span>&gt;</div>
                    <div><span className="ln">4</span>&nbsp;&nbsp;&nbsp;&nbsp;{'{'}<span className="tk-fn">cards</span>.map(c =&gt; &lt;<span className="tk-fn">Card</span> /&gt;){'}'}</div>
                    <div><span className="ln">5</span>&nbsp;&nbsp;&lt;/<span className="tk-fn">div</span>&gt;</div>
                    <div><span className="ln">6</span>);</div>
                  </div>
                  <div>
                    <div className="test-row pass"><div className="check">✓</div><span>cards render in a horizontal row</span></div>
                    <div className="test-row pass"><div className="check">✓</div><span>spacing uses justify-between</span></div>
                    <div className="test-row pending"><div className="check">○</div><span>vertical alignment set to center</span></div>
                  </div>
                </div>
                <div className="hero-card-footer">
                  <span className="chip chip-teal">XP 1,840 / 3,000</span>
                  <div className="xp-bar"><div className="fill" /></div>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>LVL 12 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SKILL TREE */}
      <section id="tree">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">THE SKILL TREE</span>
            <h2>A constellation of quests. Every node you clear unlocks the next.</h2>
            <p>60+ hand-crafted missions across HTML, CSS, JavaScript, React and TypeScript. Clear a branch → mint a soulbound badge → unlock bounty missions.</p>
          </div>
          <div className="tree-wrap reveal">
            <svg className="tree-svg" viewBox="0 0 1200 540" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.86 0.18 185)" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="oklch(0.68 0.25 295)" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="gLineCurrent" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="oklch(0.86 0.18 185)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="oklch(0.72 0.28 340)" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d="M 140 270 L 340 140" stroke="url(#gLine)" strokeWidth="1.5" fill="none" />
              <path d="M 140 270 L 340 270" stroke="url(#gLine)" strokeWidth="1.5" fill="none" />
              <path d="M 140 270 L 340 400" stroke="url(#gLine)" strokeWidth="1.5" fill="none" />
              <path d="M 340 140 L 560 140" stroke="url(#gLine)" strokeWidth="1.5" fill="none" />
              <path d="M 340 270 L 560 270" stroke="url(#gLineCurrent)" strokeWidth="2" fill="none" />
              <path d="M 340 400 L 560 400" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" fill="none" />
              <path d="M 560 140 L 800 200" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" fill="none" />
              <path d="M 560 270 L 800 200" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" fill="none" />
              <path d="M 560 270 L 800 340" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" fill="none" />
              <path d="M 560 400 L 800 340" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" fill="none" />
              <path d="M 800 200 L 1040 270" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" fill="none" />
              <path d="M 800 340 L 1040 270" stroke="url(#gLine)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" fill="none" />
            </svg>
            <div className="tree-node unlocked" style={{ left: '12%', top: '50%' }}>
              <div className="node">H</div><div className="lbl">HTML Basics</div><div className="xp">✓ 1,200 XP</div>
            </div>
            <div className="tree-node unlocked" style={{ left: '28%', top: '26%' }}>
              <div className="node">B</div><div className="lbl">Box Model</div><div className="xp">✓ 800 XP</div>
            </div>
            <div className="tree-node unlocked" style={{ left: '28%', top: '50%' }}>
              <div className="node">F</div><div className="lbl">Flexbox</div><div className="xp">✓ 1,500 XP</div>
            </div>
            <div className="tree-node unlocked" style={{ left: '28%', top: '74%' }}>
              <div className="node">G</div><div className="lbl">CSS Grid</div><div className="xp">✓ 1,500 XP</div>
            </div>
            <div className="tree-node unlocked" style={{ left: '47%', top: '26%' }}>
              <div className="node">A</div><div className="lbl">Animations</div><div className="xp">✓ 900 XP</div>
            </div>
            <div className="tree-node current" style={{ left: '47%', top: '50%' }}>
              <div className="node">JS</div><div className="lbl">JavaScript</div><div className="xp">in progress</div>
            </div>
            <div className="tree-node locked" style={{ left: '47%', top: '74%' }}>
              <div className="node">TS</div><div className="lbl">TypeScript</div><div className="xp">6,000 XP req.</div>
            </div>
            <div className="tree-node locked" style={{ left: '67%', top: '37%' }}>
              <div className="node">R</div><div className="lbl">React</div><div className="xp">9,000 XP req.</div>
            </div>
            <div className="tree-node locked" style={{ left: '67%', top: '63%' }}>
              <div className="node">N</div><div className="lbl">Next.js</div><div className="xp">12,000 XP req.</div>
            </div>
            <div className="tree-node locked" style={{ left: '87%', top: '50%' }}>
              <div className="node">★</div><div className="lbl">Ship a dApp</div><div className="xp">BOSS QUEST</div>
            </div>
          </div>
        </div>
      </section>

      {/* WORLD MAP */}
      <section id="worlds">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">WORLD MAP</span>
            <h2>Four worlds. One arc. Ship it all.</h2>
            <p>Each world is a complete curriculum — quests, lore, and a final boss that tests everything you've built.</p>
          </div>
          <div className="world-row reveal">
            {[
              { n:'01', name:'HTML RUINS',      theme:'Broken ancient web temples.',                     color:'var(--amber)',   glow:'oklch(0.82 0.18 75 / 0.18)',   skills:['HTML','CSS','Layouts','Flexbox'],                  boss:'DIV EATER',        active:true },
              { n:'02', name:'REACTIVE SECTOR', theme:'Living UI structures constantly changing shape.', color:'var(--violet)',  glow:'oklch(0.55 0.26 290 / 0.18)', skills:['React','Components','State','Hooks'],              boss:'STATE OVERFLOW',   active:false },
              { n:'03', name:'ROUTER MAZE',     theme:'An infinite dimensional transport system.',       color:'var(--teal)',    glow:'oklch(0.86 0.18 185 / 0.18)', skills:['React Router','Navigation','Context API'],        boss:'404 PHANTOM',      active:false },
              { n:'04', name:'IMMERSIVE GRID',  theme:'A massive holographic simulation.',               color:'var(--magenta)', glow:'oklch(0.72 0.28 340 / 0.18)', skills:['Animations','Optimization','A11y','Real-time UI'], boss:'THE WHITE SCREEN', active:false, final:true },
            ].map(w => (
              <div key={w.n} className={`world-card${w.active ? ' wc-on' : ' wc-off'}`} style={{ '--wc': w.color, '--wg': w.glow }}>
                <div className="wc-meta">
                  <span className="wc-num">WORLD {w.n}</span>
                  <span className={`wc-tag${w.active ? ' wc-tag-on' : ''}`}>{w.active ? '● ACTIVE' : w.final ? 'FINAL' : 'LOCKED'}</span>
                </div>
                <div className="wc-name">{w.name}</div>
                <p className="wc-theme">{w.theme}</p>
                <div className="wc-skills">
                  {w.skills.map(s => <span key={s} className="wc-skill">{s}</span>)}
                </div>
                <div className="wc-boss-block">
                  <div className="wc-boss-lbl">{w.final ? 'FINAL BOSS' : 'BOSS'}</div>
                  <div className="wc-boss-name">{w.boss}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* PARTNERS */}
      <section>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">CHAINS WE SUPPORT</span>
            <h2>Built on Ethereum.</h2>
          </div>
          <div className="partners reveal">
            {[
              { grad: 'oklch(0.6 0.2 260), oklch(0.4 0.15 240)', icon: '◆', name: 'Ethereum' },
            ].map(p => (
              <div key={p.name} className="partner">
                <div className="partner-mark" style={{ background: `linear-gradient(135deg, ${p.grad})` }}>{p.icon}</div>
                <div className="partner-name">{p.name.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACADEMY */}
      <section id="academy" style={{ padding: '100px 0', background: 'oklch(0.09 0.02 260)' }}>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow" style={{ color: 'oklch(0.86 0.19 80)' }}>DRIFT BUILDERS ACADEMY</span>
            <h2>Coding quests for ages 8–16.<br /><span style={{ color: 'oklch(0.86 0.19 80)' }}>40 gates. 3 tracks.</span></h2>
            <p>Visual block coding → Python → JavaScript + React. Every gate is a short coding challenge. Complete it, answer a quiz, earn XP. No fluff.</p>
          </div>

          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 48 }}>
            {[
              { icon: '🟡', track: 'Block Layer',  age: 'Ages 8–10',  rank: 'E', color: 'oklch(0.86 0.19 80)',  gates: [{ id: 'S-01', name: 'The First Block',      concept: 'Sequences' }, { id: 'S-02', name: 'The Repeat Machine',  concept: 'Loops' },       { id: 'S-06', name: 'The Glitch Block',   concept: 'Boss · Debugging' }] },
              { icon: '🐍', track: 'Code Layer',   age: 'Ages 11–13', rank: 'D', color: 'oklch(0.82 0.18 135)', gates: [{ id: 'P-01', name: 'First Words',          concept: 'Print & Strings' }, { id: 'P-04', name: 'The Loop Writer',    concept: 'Loops' },       { id: 'P-08', name: 'The Class Constructor', concept: 'Classes & OOP' }] },
              { icon: '⚡', track: 'Web Layer',    age: 'Ages 13–16', rank: 'C', color: 'oklch(0.78 0.18 210)', gates: [{ id: 'J-01', name: 'The DOM Awakens',      concept: 'DOM Basics' },    { id: 'J-03', name: 'The Async Signal',   concept: 'Async / Await' }, { id: 'J-10', name: 'The Hook Circuit',   concept: 'Boss · React Hooks' }] },
            ].map(t => (
              <div key={t.track} className="panel" style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.track}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>{t.age}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {t.gates.map(g => (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'oklch(0.12 0.02 260)', borderRadius: 6 }}>
                      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: t.color, minWidth: 36 }}>{g.id}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>{g.concept}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign: 'center' }}>
            <button className="btn btn-primary" style={{ background: 'oklch(0.86 0.19 80)', color: '#000', border: 'none', fontSize: 16, padding: '14px 32px' }} onClick={() => goto('academy')}>
              Enter the Academy →
            </button>
            <p style={{ marginTop: 14, color: 'var(--ink-3)', fontSize: 13 }}>Free to start · Parent account required for ages 8–13</p>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">CHOOSE YOUR CLASS</span>
            <h2>Free to start. Season Pass to fly.</h2>
            <p>Begin with the first gates for free. The Season Pass unlocks the full run, XP boosts, and pass-holder perks.</p>
          </div>
          <div className="pricing">
            <div className="panel price-card reveal">
              <div><div className="tier">FREE</div><div className="amount" style={{ marginTop: 12 }}>$0</div></div>
              <h3>Access to the first gates</h3>
              <ul><li>Play the opening gates</li><li>Earn $DRIFT on every completion</li><li>Community leaderboard</li></ul>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => goto(user ? 'dashboard' : 'signup')}>Start Free →</button>
            </div>
            <div className="panel price-card featured reveal">
              <div>
                <div className="tier">★ SEASON PASS · MOST POPULAR</div>
                <span className="chip chip-magenta" style={{ marginTop: 10 }}>Launch pricing · Phase 1</span>
                <div className="amount" style={{ marginTop: 12 }}>$9.99<span className="period">/month</span></div>
              </div>
              <h3>The full season, every perk.</h3>
              <ul><li>Everything in Free</li><li>×1.25 XP boost all season</li><li>Early access to new gates</li><li>Gate Zero Raid access</li></ul>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => goto(user ? 'dashboard' : 'signup')}>Get Season Pass →</button>
            </div>
            <div className="panel price-card reveal">
              <div><div className="tier">SEASON PASS · SEASON</div><div className="amount" style={{ marginTop: 12 }}>$24.99<span className="period">/season</span></div></div>
              <h3>3 months. Best value.</h3>
              <ul><li>Everything in the monthly pass</li><li>One payment for the full season</li><li>Save ~17% vs monthly</li></ul>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => goto(user ? 'dashboard' : 'signup')}>Get Season Pass →</button>
            </div>
          </div>

          <p className="reveal" style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            Pricing is reviewed at the end of Phase 1; on hitting retention benchmarks it transitions to Phase 2 ($20/month or $49/season).
          </p>

          <div className="reveal" style={{ marginTop: 56 }}>
            <div className="section-head" style={{ marginBottom: 32 }}>
              <span className="eyebrow">SEASON PASS BENEFITS</span>
              <h2 style={{ fontSize: 28 }}>Everything you unlock.</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { cat: 'Gameplay', items: ['×1.25 XP boost for the full season', 'Early access to new gates before public release', 'Exclusive access to the Gate Zero Raid'] },
                { cat: 'Profile',  items: ['Exclusive avatar frames (dark fantasy / cyberpunk)', 'Season badge on profile', 'Custom username color'] },
                { cat: '$DRIFT',   items: ['Bonus $DRIFT airdrop at season start', 'Increased $DRIFT drop rate from quests'] },
                { cat: 'Community',items: ['Private Discord channel for pass holders', 'Priority feedback'] },
                { cat: 'Content',  items: ['Exclusive side quests', 'Access to the platform roadmap'] },
              ].map(group => (
                <div key={group.cat} className="panel" style={{ padding: '20px 22px' }}>
                  <div className="tier" style={{ color: 'var(--teal)', marginBottom: 14 }}>{group.cat}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, margin: 0, padding: 0 }}>
                    {group.items.map(item => (
                      <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--ink-1)' }}>
                        <span style={{ color: 'var(--lime)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container reveal">
          <span className="eyebrow">READY FOR LAUNCH</span>
          <h2 style={{ marginTop: 16 }}>Press start.<br /><span className="gradient-text">Your code is waiting.</span></h2>
          <p>Join 142k pilots learning frontend the fun way. No credit card. Wallet optional.</p>
          <button className="btn btn-primary" onClick={() => goto(user ? 'dashboard' : 'signup')}>{user ? 'Go to Dashboard →' : 'Enter Drift Pilot Protocol →'}</button>
        </div>
      </section>

      <footer>
        <div className="container inner">
          <div>© 2026 Drift Pilot Protocol · All missions reserved.</div>
          <div className="right">
            <a href="#" onClick={(e) => { e.preventDefault(); goto('downloads') }}>Download App</a>
            <a href="#" onClick={(e) => { e.preventDefault(); goto('terms') }}>Terms</a>
            <a href="#" onClick={(e) => { e.preventDefault(); goto('privacy') }}>Privacy</a>
          </div>
        </div>
      </footer>
    </>
  )
}
