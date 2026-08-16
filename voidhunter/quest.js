/* Quest screen — code editor with tests & rewards */
(function () {
  const root = document.getElementById('screen-quest');
  if (!root) return;

  root.innerHTML = `
    <style>
      #screen-quest .q-wrap {
        display: grid;
        grid-template-columns: 320px 1fr 320px;
        min-height: 100vh;
        position: relative;
        z-index: 2;
      }
      #screen-quest .q-topbar {
        grid-column: 1 / -1;
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 28px;
        border-bottom: 1px solid var(--line);
        background: rgba(5,7,13,0.6);
        backdrop-filter: blur(16px);
        position: sticky; top: 0; z-index: 10;
      }
      #screen-quest .q-topbar .left {
        display: flex; align-items: center; gap: 16px;
      }
      #screen-quest .q-topbar .back {
        font-family: var(--f-mono); font-size: 12px; color: var(--ink-2);
        cursor: pointer; padding: 6px 10px; border-radius: 6px;
      }
      #screen-quest .q-topbar .back:hover { color: var(--teal); background: rgba(180,200,255,0.04); }
      #screen-quest .q-topbar .crumb {
        font-family: var(--f-mono); font-size: 12px; color: var(--ink-2);
        display: flex; align-items: center; gap: 8px;
      }
      #screen-quest .q-topbar .crumb .now { color: var(--ink-0); }
      #screen-quest .q-topbar .right { display: flex; align-items: center; gap: 14px; }
      #screen-quest .timer {
        font-family: var(--f-mono); font-size: 14px; color: var(--amber);
        padding: 6px 12px; border: 1px solid oklch(0.82 0.18 75 / 0.3);
        border-radius: 999px; background: oklch(0.82 0.18 75 / 0.08);
      }

      /* LEFT: brief */
      #screen-quest .brief {
        padding: 28px 24px;
        border-right: 1px solid var(--line);
        overflow-y: auto;
        max-height: calc(100vh - 65px);
      }
      #screen-quest .brief-hero {
        background: linear-gradient(135deg, oklch(0.4 0.2 295 / 0.4), oklch(0.6 0.18 185 / 0.2));
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
      }
      #screen-quest .brief-hero::before {
        content: ""; position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
        background-size: 20px 20px;
        mask-image: radial-gradient(ellipse at 70% 40%, black, transparent 70%);
      }
      #screen-quest .brief-hero h2 {
        font-size: 24px; font-weight: 500; letter-spacing: -0.02em;
        margin: 10px 0 8px; position: relative; z-index: 2;
      }
      #screen-quest .brief-hero .chapter {
        font-family: var(--f-mono); font-size: 11px; color: var(--teal);
        text-transform: uppercase; letter-spacing: 0.15em;
        position: relative; z-index: 2;
      }
      #screen-quest .brief-hero p {
        color: var(--ink-1); font-size: 13px;
        position: relative; z-index: 2;
      }

      #screen-quest .reward-bar {
        display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        margin-bottom: 24px;
      }
      #screen-quest .reward-bar .rwd {
        padding: 14px;
        background: rgba(180,200,255,0.02);
        border: 1px solid var(--line);
        border-radius: 10px;
      }
      #screen-quest .reward-bar .rwd .lbl {
        font-family: var(--f-mono); font-size: 10px; color: var(--ink-2);
        text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px;
      }
      #screen-quest .reward-bar .rwd .v {
        font-family: var(--f-display); font-size: 22px; font-weight: 500;
        letter-spacing: -0.02em;
      }
      #screen-quest .reward-bar .rwd.eva .v { color: var(--magenta); }
      #screen-quest .reward-bar .rwd.xp .v { color: var(--teal); }

      #screen-quest .brief-section {
        margin-bottom: 24px;
      }
      #screen-quest .brief-section h4 {
        font-family: var(--f-mono); font-size: 11px; color: var(--ink-2);
        text-transform: uppercase; letter-spacing: 0.15em;
        margin-bottom: 12px;
      }
      #screen-quest .brief-section p {
        color: var(--ink-1); font-size: 14px; line-height: 1.65;
        margin-bottom: 12px;
      }
      #screen-quest .brief-section code {
        font-family: var(--f-mono); font-size: 12px;
        padding: 1px 6px; border-radius: 4px;
        background: rgba(180,200,255,0.06);
        color: var(--teal);
      }

      #screen-quest .objectives { list-style: none; display: flex; flex-direction: column; gap: 10px; }
      #screen-quest .objectives li {
        display: flex; align-items: flex-start; gap: 10px;
        font-size: 13px; color: var(--ink-1);
      }
      #screen-quest .objectives li .bx {
        width: 16px; height: 16px; border-radius: 4px;
        border: 1px solid var(--line-2);
        flex-shrink: 0; margin-top: 2px;
        display: flex; align-items: center; justify-content: center;
        font-size: 10px;
      }
      #screen-quest .objectives li.done .bx {
        background: oklch(0.9 0.22 135 / 0.15); border-color: var(--lime); color: var(--lime);
      }
      #screen-quest .objectives li.done { color: var(--ink-2); }

      #screen-quest .hint-btn {
        width: 100%; padding: 12px;
        border: 1px dashed var(--line-2);
        border-radius: 10px;
        font-family: var(--f-mono); font-size: 12px; color: var(--ink-2);
        text-align: center; cursor: pointer;
        transition: all 0.15s;
      }
      #screen-quest .hint-btn:hover {
        border-color: var(--teal); color: var(--teal);
      }
      #screen-quest .hint-btn .cost {
        font-family: var(--f-mono); color: var(--magenta); margin-left: 6px;
      }

      /* CENTER: editor */
      #screen-quest .editor-wrap {
        display: flex; flex-direction: column;
        border-right: 1px solid var(--line);
        overflow: hidden;
      }
      #screen-quest .editor-tabs {
        display: flex;
        border-bottom: 1px solid var(--line);
        background: rgba(5,7,13,0.4);
        padding: 0 16px;
      }
      #screen-quest .editor-tab {
        padding: 14px 16px;
        font-family: var(--f-mono); font-size: 12px;
        color: var(--ink-2);
        border-bottom: 2px solid transparent;
        cursor: pointer;
      }
      #screen-quest .editor-tab.active {
        color: var(--teal); border-color: var(--teal);
      }
      #screen-quest .editor-tab .dot {
        display: inline-block; width: 6px; height: 6px; border-radius: 50%;
        background: var(--amber); margin-left: 8px;
      }

      #screen-quest .editor {
        flex: 1;
        background: #030510;
        padding: 24px 0;
        font-family: var(--f-mono); font-size: 14px;
        line-height: 1.8;
        overflow-y: auto;
        position: relative;
      }
      #screen-quest .editor .line {
        display: grid;
        grid-template-columns: 60px 1fr;
        padding: 0 24px 0 0;
      }
      #screen-quest .editor .line:hover { background: rgba(180,200,255,0.02); }
      #screen-quest .editor .line .ln {
        color: var(--ink-3);
        text-align: right; padding-right: 16px;
        user-select: none;
        border-right: 1px solid var(--line);
        margin-right: 16px;
      }
      #screen-quest .editor .line.cur .ln { color: var(--teal); }
      #screen-quest .editor .line.cur { background: oklch(0.86 0.18 185 / 0.04); }

      #screen-quest .slot {
        display: inline-block;
        padding: 0 6px;
        border: 1px dashed var(--magenta);
        border-radius: 3px;
        background: oklch(0.72 0.28 340 / 0.1);
        color: var(--magenta);
        min-width: 50px;
        text-align: center;
        cursor: text;
      }
      #screen-quest .slot.filled {
        border-style: solid;
        border-color: var(--lime);
        background: oklch(0.9 0.22 135 / 0.1);
        color: var(--lime);
      }

      #screen-quest .editor-footer {
        padding: 14px 24px;
        border-top: 1px solid var(--line);
        background: rgba(5,7,13,0.6);
        display: flex; justify-content: space-between; align-items: center;
      }
      #screen-quest .editor-footer .status {
        font-family: var(--f-mono); font-size: 12px; color: var(--ink-2);
        display: flex; align-items: center; gap: 8px;
      }
      #screen-quest .editor-footer .actions { display: flex; gap: 10px; }

      /* RIGHT: tests + preview */
      #screen-quest .right-panel {
        display: flex; flex-direction: column;
        overflow: hidden;
      }
      #screen-quest .preview-box {
        padding: 20px;
        border-bottom: 1px solid var(--line);
      }
      #screen-quest .preview-box h4 {
        font-family: var(--f-mono); font-size: 11px; color: var(--ink-2);
        text-transform: uppercase; letter-spacing: 0.15em;
        margin-bottom: 12px;
        display: flex; justify-content: space-between; align-items: center;
      }
      #screen-quest .preview-box h4 .chip {
        font-size: 9px; padding: 2px 8px;
      }
      #screen-quest .preview-frame {
        background: #0a0d18;
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 16px;
        min-height: 160px;
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
      }
      #screen-quest .preview-card {
        flex: 1;
        height: 100px;
        background: linear-gradient(135deg, oklch(0.5 0.22 310 / 0.5), oklch(0.45 0.2 295 / 0.3));
        border: 1px solid oklch(0.68 0.25 295 / 0.4);
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--f-mono); font-size: 12px;
        color: var(--ink-1);
      }
      #screen-quest .preview-card:nth-child(2) {
        background: linear-gradient(135deg, oklch(0.55 0.2 340 / 0.4), oklch(0.5 0.22 310 / 0.3));
      }
      #screen-quest .preview-card:nth-child(3) {
        background: linear-gradient(135deg, oklch(0.5 0.18 185 / 0.4), oklch(0.55 0.22 220 / 0.3));
      }

      #screen-quest .tests-box {
        padding: 20px;
        flex: 1; overflow-y: auto;
      }
      #screen-quest .tests-box h4 {
        font-family: var(--f-mono); font-size: 11px; color: var(--ink-2);
        text-transform: uppercase; letter-spacing: 0.15em;
        margin-bottom: 14px;
        display: flex; justify-content: space-between; align-items: center;
      }
      #screen-quest .tests-box h4 .score {
        color: var(--teal);
      }
      #screen-quest .test {
        display: flex; gap: 12px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        margin-bottom: 8px;
        background: rgba(180,200,255,0.02);
      }
      #screen-quest .test.pass {
        border-color: oklch(0.9 0.22 135 / 0.4);
        background: oklch(0.9 0.22 135 / 0.05);
      }
      #screen-quest .test.fail {
        border-color: oklch(0.72 0.28 340 / 0.4);
        background: oklch(0.72 0.28 340 / 0.05);
      }
      #screen-quest .test .mark {
        width: 20px; height: 20px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700;
        flex-shrink: 0;
      }
      #screen-quest .test.pass .mark { background: var(--lime); color: #000; }
      #screen-quest .test.fail .mark { background: var(--magenta); color: #000; }
      #screen-quest .test.pending .mark { background: rgba(255,255,255,0.04); color: var(--ink-3); border: 1px dashed var(--line-2); }
      #screen-quest .test .t {
        font-size: 13px; flex: 1;
      }
      #screen-quest .test .t .desc {
        font-family: var(--f-mono); font-size: 11px;
        color: var(--ink-2); margin-top: 2px;
      }

      /* Reward modal */
      #screen-quest .reward-modal {
        position: fixed; inset: 0;
        background: rgba(5,7,13,0.85);
        backdrop-filter: blur(12px);
        display: none;
        align-items: center; justify-content: center;
        z-index: 100;
        animation: fadeIn 0.3s;
      }
      #screen-quest .reward-modal.open { display: flex; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes popUp {
        0% { transform: scale(0.8); opacity: 0; }
        60% { transform: scale(1.05); }
        100% { transform: scale(1); opacity: 1; }
      }
      #screen-quest .reward-inner {
        padding: 48px 56px;
        max-width: 440px;
        text-align: center;
        animation: popUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      #screen-quest .reward-coin {
        width: 140px; height: 140px; border-radius: 50%;
        margin: 0 auto 24px;
        background: radial-gradient(circle at 35% 30%, oklch(0.95 0.2 340), oklch(0.6 0.28 320) 45%, oklch(0.4 0.25 300) 100%);
        box-shadow: 0 0 80px oklch(0.72 0.28 340 / 0.6), inset -15px -15px 30px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--f-display); font-size: 36px; font-weight: 600; color: #fff;
        animation: spin2 4s linear infinite;
      }
      @keyframes spin2 {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
      #screen-quest .reward-inner h2 { font-size: 36px; margin-bottom: 8px; }
      #screen-quest .reward-inner p { color: var(--ink-1); margin-bottom: 24px; }
      #screen-quest .reward-grid {
        display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        margin-bottom: 24px;
      }
      #screen-quest .reward-grid .r {
        padding: 14px;
        background: rgba(180,200,255,0.03);
        border: 1px solid var(--line);
        border-radius: 10px;
      }
      #screen-quest .reward-grid .r .v {
        font-family: var(--f-display); font-size: 26px; font-weight: 500;
      }
      #screen-quest .reward-grid .r .l {
        font-family: var(--f-mono); font-size: 10px; color: var(--ink-2);
        text-transform: uppercase; letter-spacing: 0.12em;
      }

      @media (max-width: 1100px) {
        #screen-quest .q-wrap { grid-template-columns: 1fr; }
        #screen-quest .brief { max-height: none; border-right: none; border-bottom: 1px solid var(--line); }
      }
    </style>

    <div class="q-wrap">
      <div class="q-topbar">
        <div class="left">
          <span class="back" data-goto="dashboard">← Dashboard</span>
          <div class="crumb">
            <span>Flexbox</span> <span>›</span> <span class="now">The Flexbox Vault</span>
          </div>
        </div>
        <div class="right">
          <span class="chip chip-magenta"><span class="dot dot-pulse"></span> ACTIVE</span>
          <span class="timer mono">◷ 12:34</span>
          <button class="btn btn-ghost btn-sm">⚑ Hint</button>
          <button class="btn btn-primary btn-sm" id="qSubmit">Run Tests ▶</button>
        </div>
      </div>

      <!-- LEFT: brief -->
      <aside class="brief">
        <div class="brief-hero">
          <div class="chapter">ACT II · CHAPTER 04</div>
          <h2>The Flexbox Vault</h2>
          <p>Three cards. One vault. Align them horizontally, spaced evenly, centered vertically — and the lock opens.</p>
        </div>

        <div class="reward-bar">
          <div class="rwd eva">
            <div class="lbl">REWARD</div>
            <div class="v">+240 EVA</div>
          </div>
          <div class="rwd xp">
            <div class="lbl">XP</div>
            <div class="v">+1,200</div>
          </div>
        </div>

        <div class="brief-section">
          <h4>BRIEF</h4>
          <p>Your ship's cargo vault is locked. The three payload cards need to be arranged in a single row inside the parent container.</p>
          <p>Use the <code>display: flex</code> property along with <code>justify-content</code> and <code>align-items</code> to complete the layout.</p>
        </div>

        <div class="brief-section">
          <h4>OBJECTIVES</h4>
          <ul class="objectives">
            <li class="done"><div class="bx">✓</div>Make the container a flex row</li>
            <li class="done"><div class="bx">✓</div>Space cards with justify-between</li>
            <li><div class="bx"></div>Center cards vertically</li>
            <li><div class="bx"></div>Pass all tests</li>
          </ul>
        </div>

        <div class="hint-btn">⚑ Get a hint <span class="cost">−20 $EVA</span></div>
      </aside>

      <!-- CENTER: editor -->
      <div class="editor-wrap">
        <div class="editor-tabs">
          <div class="editor-tab active">index.tsx <span class="dot"></span></div>
          <div class="editor-tab">styles.css</div>
          <div class="editor-tab">README.md</div>
        </div>
        <div class="editor">
          <div class="line"><span class="ln">1</span><span><span class="tk-com">// The Flexbox Vault — unlock the cargo bay</span></span></div>
          <div class="line"><span class="ln">2</span><span><span class="tk-kw">import</span> { Card } <span class="tk-kw">from</span> <span class="tk-str">"./Card"</span>;</span></div>
          <div class="line"><span class="ln">3</span><span>&nbsp;</span></div>
          <div class="line"><span class="ln">4</span><span><span class="tk-kw">const</span> <span class="tk-fn">Vault</span> = () =&gt; {</span></div>
          <div class="line"><span class="ln">5</span><span>&nbsp;&nbsp;<span class="tk-kw">return</span> (</span></div>
          <div class="line cur"><span class="ln">6</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tk-fn">div</span> <span class="tk-prop">className</span>=<span class="tk-str">"flex <span class="slot filled" contenteditable="true">justify-between</span> <span class="slot" contenteditable="true" id="slot2">items-___</span>"</span>&gt;</span></div>
          <div class="line"><span class="ln">7</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tk-fn">Card</span> <span class="tk-prop">label</span>=<span class="tk-str">"ALPHA"</span> /&gt;</span></div>
          <div class="line"><span class="ln">8</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tk-fn">Card</span> <span class="tk-prop">label</span>=<span class="tk-str">"BETA"</span> /&gt;</span></div>
          <div class="line"><span class="ln">9</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span class="tk-fn">Card</span> <span class="tk-prop">label</span>=<span class="tk-str">"GAMMA"</span> /&gt;</span></div>
          <div class="line"><span class="ln">10</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span class="tk-fn">div</span>&gt;</span></div>
          <div class="line"><span class="ln">11</span><span>&nbsp;&nbsp;);</span></div>
          <div class="line"><span class="ln">12</span><span>};</span></div>
          <div class="line"><span class="ln">13</span><span>&nbsp;</span></div>
          <div class="line"><span class="ln">14</span><span><span class="tk-kw">export</span> <span class="tk-kw">default</span> Vault;</span></div>
        </div>
        <div class="editor-footer">
          <div class="status">
            <span class="dot" style="color:var(--lime);width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 6px currentColor;"></span>
            Autosaved · 2s ago
          </div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm">↺ Reset</button>
            <button class="btn btn-primary btn-sm" id="qSubmit2">Run Tests ▶</button>
          </div>
        </div>
      </div>

      <!-- RIGHT: preview + tests -->
      <aside class="right-panel">
        <div class="preview-box">
          <h4>
            LIVE PREVIEW
            <span class="chip chip-teal">RENDER OK</span>
          </h4>
          <div class="preview-frame">
            <div class="preview-card">ALPHA</div>
            <div class="preview-card">BETA</div>
            <div class="preview-card">GAMMA</div>
          </div>
        </div>
        <div class="tests-box">
          <h4>
            TEST SUITE
            <span class="score">2/3 passing</span>
          </h4>
          <div class="test pass">
            <div class="mark">✓</div>
            <div class="t">
              Cards render in a horizontal row
              <div class="desc">flexDirection == "row"</div>
            </div>
          </div>
          <div class="test pass">
            <div class="mark">✓</div>
            <div class="t">
              Cards are spaced evenly
              <div class="desc">justifyContent == "space-between"</div>
            </div>
          </div>
          <div class="test pending">
            <div class="mark">○</div>
            <div class="t">
              Cards are centered vertically
              <div class="desc">alignItems == "center"</div>
            </div>
          </div>
          <div class="test pending">
            <div class="mark">○</div>
            <div class="t">
              No layout shift on resize
              <div class="desc">CLS &lt; 0.1 across 3 breakpoints</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Reward modal -->
    <div class="reward-modal" id="qRewardModal">
      <div class="reward-inner">
        <div class="reward-coin">EVA</div>
        <span class="chip chip-lime" style="display:inline-flex;"><span class="dot dot-pulse"></span> QUEST CLEARED</span>
        <h2 style="margin-top: 16px;"><span class="gradient-text">Vault unlocked.</span></h2>
        <p>All tests green. Payload secured. Rewards minted to your wallet.</p>
        <div class="reward-grid">
          <div class="r">
            <div class="l">$EVA EARNED</div>
            <div class="v magenta-text">+240</div>
          </div>
          <div class="r">
            <div class="l">XP GAINED</div>
            <div class="v teal-text">+1,200</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button class="btn btn-ghost" id="qCloseModal">Review code</button>
          <button class="btn btn-primary" data-goto="dashboard">Next mission →</button>
        </div>
      </div>
    </div>
  `;

  // Hook up the "Run Tests" button to open reward modal (simulate pass)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#qSubmit, #qSubmit2')) {
      const modal = document.getElementById('qRewardModal');
      if (modal) modal.classList.add('open');
    }
    if (e.target.closest('#qCloseModal')) {
      const modal = document.getElementById('qRewardModal');
      if (modal) modal.classList.remove('open');
    }
  });
})();
