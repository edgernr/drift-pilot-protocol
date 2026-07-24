import { useState, useEffect, useRef } from 'react'
import './Signup.css'
import { useNav } from '../context/NavigationContext'
import { useAuth } from '../context/AuthContext'
import { createBotProbe, HONEYPOT_STYLE } from '../lib/securitySignals'
import { precheckEmail, loadBlockedDomains } from '../lib/emailGuard'
import Turnstile, { TURNSTILE_ENABLED } from '../components/Turnstile'

export default function Signup() {
  const { goto } = useNav()
  const { signup, loading, error, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [company, setCompany] = useState('') // honeypot — real users never see/fill this
  const [localError, setLocalError] = useState(null)
  const [emailSent, setEmailSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const probeRef = useRef(null)
  const captchaRef = useRef(null)

  useEffect(() => {
    loadBlockedDomains()
    probeRef.current = createBotProbe()
    return () => probeRef.current?.dispose()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)
    clearError()
    const emailErr = precheckEmail(email)
    if (emailErr) { setLocalError(emailErr); return }
    if (password !== confirm) { setLocalError('Passwords do not match.'); return }
    if (TURNSTILE_ENABLED && !captchaToken) { setLocalError('Please complete the verification challenge.'); return }
    // Bot heuristics: honeypot = hard stop; timing/entropy = scored signal.
    const probe = probeRef.current?.evaluate(company) ?? { botScore: 0, signals: {}, hardBlock: false }
    if (probe.hardBlock) { setLocalError('Something went wrong. Please try again.'); return }
    const result = await signup(email, password, name.trim(), null, { botScore: probe.botScore, signals: probe.signals }, captchaToken || undefined)
    captchaRef.current?.reset(); setCaptchaToken('') // token is single-use
    if (result === 'ok') goto('dashboard')
    if (result === 'confirm') setEmailSent(true)
  }

  const displayError = localError || error

  if (emailSent) {
    return (
      <div className="signup-wrap">
        <div className="signup-left">
          <div className="auth-brand">
            <span className="auth-mark" />
            Void Shards
          </div>
          <div />
          <div className="auth-status">
            <span className="pulse" />
            Season 01 · The Abyss is live
          </div>
        </div>
        <div className="signup-right">
          <div className="auth-card auth-sent">
            <div className="auth-br tl" /><div className="auth-br tr" />
            <div className="auth-br bl" /><div className="auth-br br2" />
            <div className="auth-sent-icon">📬</div>
            <h2>Check your inbox</h2>
            <p className="sub" style={{ marginBottom: 32 }}>
              We sent a confirmation link to{' '}
              <span className="auth-sent-email">{email}</span>.
              Click it to activate your account.
            </p>
            <button className="auth-btn-ghost" onClick={() => goto('login')}>Back to login</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-wrap">
      <div className="signup-left">
        <div className="auth-brand">
          <span className="auth-mark" />
          Void Shards
        </div>

        <div className="signup-hero">
          <span className="auth-eyebrow">// Enlisting · Season 01</span>
          <h1>
            Welcome,<br />
            <span className="tint-gold">Seeker.</span>
          </h1>
          <p>Create your account and start earning $SHARD from day one.</p>
        </div>

        <div className="auth-status">
          <span className="pulse" />
          Season 01 · The Abyss is live
        </div>
      </div>

      <div className="signup-right">
        <div className="auth-card">
          <div className="auth-br tl" /><div className="auth-br tr" />
          <div className="auth-br bl" /><div className="auth-br br2" />

          <button className="auth-back" onClick={() => goto('landing')}>← back to home</button>
          <h2>Create account</h2>
          <p className="sub">Already a seeker? <span className="link" onClick={() => goto('login')}>Log in →</span></p>

          {displayError && <div className="auth-error">{displayError}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Honeypot — hidden from humans; bots that autofill it are blocked.
                Named + attributed so real password managers / Chrome autofill do
                NOT fill it (that would false-positive a legit signup). */}
            <input
              type="text"
              name="hp_ref"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              style={HONEYPOT_STYLE}
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
            <div className="auth-field">
              <label>Seeker name</label>
              <input
                type="text"
                placeholder="e.g. Axon"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="nickname"
                required
              />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="seeker@voidshards.net"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="auth-field">
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <Turnstile ref={captchaRef} onVerify={setCaptchaToken} />
            <button type="submit" className="auth-btn-gold" disabled={loading}>
              {loading ? 'Creating account…' : 'Awaken →'}
            </button>
          </form>

          <div className="auth-footer">
            By continuing you agree to the{' '}
            <span className="link" onClick={() => goto('terms')}>Terms</span>
            {' '}&amp;{' '}
            <span className="link" onClick={() => goto('privacy')}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
