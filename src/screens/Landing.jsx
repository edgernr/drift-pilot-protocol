import { useState, useEffect } from 'react'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const { goto } = useNav()
  const { user } = useAuth()
  useScrollReveal()

  const [stats, setStats] = useState({ pilots: null, xp: null, gates: null })
  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('quest_completions').select('xp_earned, quest_id'),
    ]).then(([{ count }, { data: qc }]) => {
      const totalXp = qc?.reduce((s, r) => s + r.xp_earned, 0) ?? 0
      const gatesCleared = qc?.length ?? 0
      setStats({ pilots: count ?? 0, xp: totalXp, gates: gatesCleared })
    })
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
          <li><a href="#quests">Quests</a></li>
          <li><a href="#token">Token</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
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
                <button className="btn btn-ghost" onClick={() => goto('quest')}>Try a Quest</button>
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
                  <div className="hc-title teal-text">● LIVE</div>
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


      {/* TOKENOMICS */}
      <section id="token">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">$DRIFT TOKEN</span>
            <h2>Earn by learning. Spend to level faster.</h2>
            <p>Every quest cleared pays out $DRIFT. Stake it for XP multipliers, unlock premium quests, or burn it to reset gates and replay dungeons.</p>
          </div>
          <div className="token-wrap">
            <div className="token-visual reveal">
              <div className="token-ring token-ring-1" />
              <div className="token-ring token-ring-2" />
              <div className="token-coin" />
            </div>
            <div className="reveal">
              <div className="token-stats">
                <div className="token-stat"><div className="label">Total Supply</div><div className="value">100<span className="unit">M</span></div><div className="sub">fixed · no mint</div></div>
                <div className="token-stat"><div className="label">Learn-to-Earn Pool</div><div className="value">60<span className="unit">%</span></div><div className="sub">60M reserved</div></div>
                <div className="token-stat"><div className="label">Current Price</div><div className="value">$0.48</div><div className="sub teal-text">↑ 12.4% 24h</div></div>
                <div className="token-stat"><div className="label">Staking APR</div><div className="value">18<span className="unit">%</span></div><div className="sub">+2x XP multiplier</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-primary">View Tokenomics →</button>
                <button className="btn btn-ghost">Read Whitepaper</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section>
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">NETWORKS &amp; PARTNERS</span>
            <h2>Built on chains. Backed by builders.</h2>
          </div>
          <div className="partners reveal">
            {[
              { grad: 'oklch(0.7 0.25 295), oklch(0.5 0.2 200)', icon: '◎', name: 'Solana' },
              { grad: 'oklch(0.6 0.2 260), oklch(0.4 0.15 240)', icon: '◆', name: 'Ethereum' },
              { grad: 'oklch(0.75 0.15 200), oklch(0.55 0.2 220)', icon: '◈', name: 'Base' },
              { grad: 'oklch(0.65 0.22 320), oklch(0.45 0.2 290)', icon: '✦', name: 'Polygon' },
              { grad: 'oklch(0.8 0.18 75), oklch(0.55 0.22 40)', icon: '▲', name: 'Avalanche' },
              { grad: 'oklch(0.7 0.18 185), oklch(0.45 0.2 210)', icon: '◉', name: 'Arbitrum' },
            ].map(p => (
              <div key={p.name} className="partner">
                <div className="partner-mark" style={{ background: `linear-gradient(135deg, ${p.grad})` }}>{p.icon}</div>
                <div className="partner-name">{p.name.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">CHOOSE YOUR CLASS</span>
            <h2>Free to start. Premium to fly.</h2>
            <p>You keep every $DRIFT you earn, on every tier. Premium just makes you earn faster.</p>
          </div>
          <div className="pricing">
            <div className="panel price-card reveal">
              <div><div className="tier">SCOUT</div><div className="amount" style={{ marginTop: 12 }}>$0<span className="period">/forever</span></div></div>
              <h3>Learn the ropes.</h3>
              <ul><li>Access to 20+ starter quests</li><li>Earn $DRIFT on every completion</li><li>1 streak freeze per week</li><li>Community leaderboard</li></ul>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => goto('signup')}>Start for Free</button>
            </div>
            <div className="panel price-card featured reveal">
              <div><div className="tier">★ PILOT · MOST POPULAR</div><div className="amount" style={{ marginTop: 12 }}>$19<span className="period">/month</span></div></div>
              <h3>Unlock the full tree.</h3>
              <ul><li>All 60+ quests + weekly drops</li><li>2x $DRIFT earn multiplier</li><li>Exclusive pilot badges</li><li>Priority raid matchmaking</li><li>Unlimited streak freezes</li></ul>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => goto('signup')}>Become a Pilot →</button>
            </div>
            <div className="panel price-card reveal">
              <div><div className="tier">COMMANDER</div><div className="amount" style={{ marginTop: 12 }}>$79<span className="period">/month</span></div></div>
              <h3>Build your own squadron.</h3>
              <ul><li>Everything in Pilot</li><li>Host private raid rooms</li><li>1-on-1 mentor sessions</li><li>Early access to boss quests</li><li>Governance voting on $DRIFT</li></ul>
              <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => goto('signup')}>Command →</button>
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
            <a href="#">Docs</a>
            <a href="#">Discord</a>
            <a href="#">X / Twitter</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  )
}
