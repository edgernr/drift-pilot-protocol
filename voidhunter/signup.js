/* Signup screen — wallet-first onboarding */
(function () {
  const root = document.getElementById('screen-signup');
  if (!root) return;

  root.innerHTML = `
    <style>
      #screen-signup .signup-wrap {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      #screen-signup .signup-left {
        padding: 48px 56px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-right: 1px solid var(--line);
        position: relative;
        z-index: 2;
      }
      #screen-signup .signup-right {
        padding: 48px 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        background:
          radial-gradient(ellipse 60% 50% at 70% 40%, oklch(0.4 0.2 295 / 0.35), transparent 70%),
          radial-gradient(ellipse 50% 40% at 30% 80%, oklch(0.6 0.18 185 / 0.2), transparent 70%);
        z-index: 2;
      }
      #screen-signup .signup-logo {
        display: flex; align-items: center; gap: 12px;
        font-family: var(--f-display); font-weight: 600; font-size: 17px;
      }
      #screen-signup .signup-logo .logo-mark {
        width: 26px; height: 26px;
        background: linear-gradient(135deg, var(--teal), var(--violet));
        border-radius: 7px; box-shadow: var(--glow-teal); position: relative;
      }
      #screen-signup .signup-logo .logo-mark::after {
        content: ""; position: absolute; inset: 5px; border: 2px solid #05070d; border-radius: 3px;
      }
      #screen-signup .signup-hero h1 {
        font-size: 52px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.05;
        margin: 32px 0 20px;
      }
      #screen-signup .signup-hero p {
        color: var(--ink-1); font-size: 17px; max-width: 440px;
      }
      #screen-signup .signup-stats {
        display: flex; gap: 40px; padding-top: 32px; border-top: 1px solid var(--line);
      }
      #screen-signup .signup-stats .s { font-family: var(--f-mono); font-size: 12px; color: var(--ink-2); }
      #screen-signup .signup-stats .n {
        font-family: var(--f-display); font-size: 28px; font-weight: 500; color: var(--ink-0);
        letter-spacing: -0.02em; display: block;
      }

      #screen-signup .signup-card {
        width: 100%; max-width: 440px;
        padding: 40px 36px;
      }
      #screen-signup .signup-card h2 { font-size: 28px; margin-bottom: 8px; }
      #screen-signup .signup-card .sub { color: var(--ink-2); font-size: 14px; margin-bottom: 32px; }

      #screen-signup .wallets { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
      #screen-signup .wallet-btn {
        display: flex; align-items: center; gap: 14px;
        padding: 16px 20px;
        background: rgba(180, 200, 255, 0.02);
        border: 1px solid var(--line-2);
        border-radius: 12px;
        width: 100%;
        text-align: left;
        transition: all 0.2s;
        position: relative;
      }
      #screen-signup .wallet-btn:hover {
        background: rgba(180, 200, 255, 0.05);
        border-color: var(--teal);
        transform: translateY(-1px);
      }
      #screen-signup .wallet-btn .mark {
        width: 36px; height: 36px; border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--f-display); font-weight: 700; font-size: 16px;
        flex-shrink: 0;
      }
      #screen-signup .wallet-btn .n { font-size: 15px; font-weight: 500; }
      #screen-signup .wallet-btn .d { font-family: var(--f-mono); font-size: 11px; color: var(--ink-2); }
      #screen-signup .wallet-btn .arrow {
        margin-left: auto; color: var(--ink-3); font-family: var(--f-mono);
        transition: transform 0.2s, color 0.2s;
      }
      #screen-signup .wallet-btn:hover .arrow { color: var(--teal); transform: translateX(4px); }
      #screen-signup .wallet-btn .badge {
        position: absolute; top: 10px; right: 14px;
        font-family: var(--f-mono); font-size: 9px; color: var(--lime);
        text-transform: uppercase; letter-spacing: 0.15em;
      }

      #screen-signup .or-divider {
        display: flex; align-items: center; gap: 12px;
        font-family: var(--f-mono); font-size: 11px;
        color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.2em;
        margin: 20px 0;
      }
      #screen-signup .or-divider::before, #screen-signup .or-divider::after {
        content: ""; flex: 1; height: 1px; background: var(--line);
      }

      #screen-signup .email-field {
        display: flex; gap: 10px; margin-bottom: 16px;
      }
      #screen-signup .email-field input {
        flex: 1;
        background: rgba(180, 200, 255, 0.02);
        border: 1px solid var(--line-2);
        border-radius: 10px;
        padding: 14px 16px;
        color: var(--ink-0);
        font-family: var(--f-body);
        font-size: 14px;
        outline: none;
        transition: border-color 0.15s;
      }
      #screen-signup .email-field input:focus { border-color: var(--teal); }
      #screen-signup .email-field input::placeholder { color: var(--ink-3); }

      #screen-signup .signup-footer {
        margin-top: 28px;
        padding-top: 24px;
        border-top: 1px solid var(--line);
        text-align: center;
        font-family: var(--f-mono); font-size: 11px; color: var(--ink-2);
      }
      #screen-signup .signup-footer a { color: var(--teal); }

      #screen-signup .back-link {
        font-family: var(--f-mono); font-size: 12px;
        color: var(--ink-2);
        display: inline-flex; align-items: center; gap: 6px;
        cursor: pointer;
      }
      #screen-signup .back-link:hover { color: var(--teal); }

      #screen-signup .pilot-preview {
        position: absolute;
        right: 48px; bottom: 48px;
        padding: 14px 18px;
        background: rgba(10, 13, 24, 0.7);
        border: 1px solid var(--line-2);
        border-radius: 12px;
        backdrop-filter: blur(12px);
        display: flex; align-items: center; gap: 12px;
        font-family: var(--f-mono); font-size: 11px;
        z-index: 3;
      }
      #screen-signup .pilot-preview .dot { color: var(--lime); }

      @media (max-width: 900px) {
        #screen-signup .signup-wrap { grid-template-columns: 1fr; }
        #screen-signup .signup-left { border-right: none; border-bottom: 1px solid var(--line); }
      }
    </style>

    <div class="signup-wrap">
      <div class="signup-left">
        <div>
          <div class="signup-logo">
            <div class="logo-mark"></div>
            <span>EVA-01</span>
          </div>

          <div class="signup-hero">
            <span class="chip chip-violet" style="margin-top: 80px; display: inline-flex;"><span class="dot dot-pulse"></span> ENLISTING · SEASON 01</span>
            <h1>Welcome, pilot.<br/><span class="gradient-text">Let's suit up.</span></h1>
            <p>Connect your wallet to mint your pilot ID, or sign up with email — we'll spin one up for you.</p>
          </div>
        </div>

        <div class="signup-stats">
          <div>
            <span class="n">142k</span>
            <span class="s">active pilots</span>
          </div>
          <div>
            <span class="n gradient-text">2.4M</span>
            <span class="s">$EVA earned</span>
          </div>
          <div>
            <span class="n">24/7</span>
            <span class="s">raid matchmaking</span>
          </div>
        </div>
      </div>

      <div class="signup-right">
        <div class="panel panel-glow signup-card">
          <span class="back-link" data-goto="landing">← back to home</span>

          <h2 style="margin-top: 24px;">Link your wallet</h2>
          <p class="sub">Or create an account with email. You can add a wallet later.</p>

          <div class="wallets">
            <button class="wallet-btn" data-goto="dashboard">
              <div class="mark" style="background: linear-gradient(135deg, oklch(0.7 0.25 295), oklch(0.5 0.2 200));">◎</div>
              <div>
                <div class="n">Phantom</div>
                <div class="d">Solana · most popular</div>
              </div>
              <span class="badge">RECOMMENDED</span>
              <span class="arrow">→</span>
            </button>
            <button class="wallet-btn" data-goto="dashboard">
              <div class="mark" style="background: linear-gradient(135deg, oklch(0.75 0.18 75), oklch(0.55 0.22 40));">🦊</div>
              <div>
                <div class="n">MetaMask</div>
                <div class="d">EVM chains</div>
              </div>
              <span class="arrow">→</span>
            </button>
            <button class="wallet-btn" data-goto="dashboard">
              <div class="mark" style="background: linear-gradient(135deg, oklch(0.7 0.18 220), oklch(0.5 0.2 260));">◈</div>
              <div>
                <div class="n">WalletConnect</div>
                <div class="d">Scan QR · 300+ wallets</div>
              </div>
              <span class="arrow">→</span>
            </button>
            <button class="wallet-btn" data-goto="dashboard">
              <div class="mark" style="background: linear-gradient(135deg, oklch(0.8 0.1 220), oklch(0.5 0.1 200));">◉</div>
              <div>
                <div class="n">Coinbase Wallet</div>
                <div class="d">Base &amp; Ethereum</div>
              </div>
              <span class="arrow">→</span>
            </button>
          </div>

          <div class="or-divider">OR</div>

          <div class="email-field">
            <input type="email" placeholder="pilot@eva-01.xyz" />
            <button class="btn btn-primary btn-sm" data-goto="dashboard">Launch →</button>
          </div>

          <div class="signup-footer">
            By continuing you agree to the <a href="#">Flight Rules</a> &amp; <a href="#">Privacy Policy</a>
          </div>
        </div>

        <div class="pilot-preview">
          <span class="dot" style="width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor;"></span>
          <span>3,214 pilots online now</span>
        </div>
      </div>
    </div>
  `;
})();
