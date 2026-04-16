import { useState } from 'react';
import Head from 'next/head';

const FIELD = (label, key, placeholder, tooltip, prefix = '', suffix = '') => ({
  label, key, placeholder, tooltip, prefix, suffix,
});

const INPUTS = [
  FIELD('Number of Salesforce Users', 'users', '50', 'Active licensed Salesforce users in your org'),
  FIELD('Average Hourly Cost per User (USD)', 'hourlyRate', '75', 'Blended fully-loaded hourly rate including salary + benefits', '$'),
  FIELD('Hours Lost/Week to Manual Workarounds', 'hoursLost', '5', 'Time spent on copy-paste, manual reports, broken flows, etc.', '', 'hrs/week'),
  FIELD('Number of Broken Automations / Flows', 'brokenFlows', '12', 'Flows, Process Builders, or Apex triggers causing errors or manual re-work'),
  FIELD('Avg Hours to Diagnose & Fix Each Automation', 'fixHours', '8', 'From ticket creation to confirmed resolution', '', 'hrs'),
  FIELD('Monthly Cost of Apex / Integration Bugs (USD)', 'bugCost', '3000', 'Support tickets, emergency dev time, data reconciliation costs', '$', '/mo'),
  FIELD('Salesforce License Cost / User / Month (USD)', 'licenseCost', '150', 'Enterprise = $150, Unlimited = $300, etc.', '$', '/mo'),
  FIELD('Estimated % of Licenses Under-Utilized', 'unusedPct', '20', 'Users with full licenses doing read-only or low-activity work', '', '%'),
];

function fmt(n, decimals = 0) {
  if (isNaN(n) || !isFinite(n)) return '—';
  return '$' + Number(n.toFixed(decimals)).toLocaleString('en-US');
}

function calcROI(vals) {
  const v = (k) => parseFloat(vals[k]) || 0;

  const weeklyWaste = v('users') * v('hourlyRate') * v('hoursLost');
  const annualWaste = weeklyWaste * 52;

  const automationCost = v('brokenFlows') * v('fixHours') * v('hourlyRate');
  const annualAutomationCost = automationCost * 12;

  const annualBugCost = v('bugCost') * 12;

  const unusedLicenseCost =
    v('users') * (v('unusedPct') / 100) * v('licenseCost') * 12;

  const totalAnnualLoss = annualWaste + annualAutomationCost + annualBugCost + unusedLicenseCost;

  // Conservative recovery: typically 55–75% captured post-engagement
  const conservativeROI = totalAnnualLoss * 0.55;
  const aggressiveROI = totalAnnualLoss * 0.75;

  return {
    weeklyWaste,
    annualWaste,
    annualAutomationCost,
    annualBugCost,
    unusedLicenseCost,
    totalAnnualLoss,
    conservativeROI,
    aggressiveROI,
  };
}

export default function Home() {
  const defaults = Object.fromEntries(INPUTS.map((f) => [f.key, f.placeholder]));
  const [vals, setVals] = useState(defaults);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showResults, setShowResults] = useState(false);

  const roi = calcROI(vals);

  const handleCalc = (e) => {
    e.preventDefault();
    setShowResults(true);
    window.scrollTo({ top: document.getElementById('results')?.offsetTop - 80, behavior: 'smooth' });
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Head>
        <title>Salesforce Tech Debt ROI Calculator | Gated Enterprise</title>
        <meta name="description" content="Quantify the hidden cost of Salesforce technical debt. Get your free ROI analysis from Gated Enterprise." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <style>{`
        .hero { background: linear-gradient(135deg, #00A1E0 0%, #0d1117 60%); padding: 64px 24px 48px; text-align: center; }
        .hero h1 { font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
        .hero h1 span { color: #FF6B35; }
        .hero p { font-size: 1.1rem; color: #c9d1d9; max-width: 640px; margin: 0 auto 12px; }
        .badge { display: inline-block; background: rgba(255,107,53,0.15); border: 1px solid #FF6B35; color: #FF6B35; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em; margin-bottom: 24px; text-transform: uppercase; }

        .container { max-width: 860px; margin: 0 auto; padding: 0 24px 80px; }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 32px; margin-top: 32px; }
        .card h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 24px; color: var(--brand); }

        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px; }

        .field label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: var(--text); }
        .field .tip { font-size: 0.75rem; color: var(--muted); margin-bottom: 8px; }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .prefix, .suffix { position: absolute; font-size: 0.9rem; color: var(--muted); pointer-events: none; }
        .prefix { left: 12px; }
        .suffix { right: 12px; }
        .field input {
          width: 100%; padding: 10px 14px; border-radius: 8px;
          border: 1px solid var(--border); background: var(--bg);
          color: var(--text); font-size: 1rem;
          transition: border-color 0.2s;
        }
        .field input:focus { outline: none; border-color: var(--brand); }
        .has-prefix input { padding-left: 28px; }
        .has-suffix input { padding-right: 72px; }

        .btn {
          display: block; width: 100%; margin-top: 28px;
          background: var(--brand); color: #fff;
          font-size: 1.1rem; font-weight: 700; padding: 14px;
          border: none; border-radius: 10px; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .btn:hover { background: var(--brand-dark); }
        .btn:active { transform: scale(0.98); }
        .btn-accent { background: var(--accent); }
        .btn-accent:hover { background: #e55a28; }

        #results { scroll-margin-top: 80px; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; }
        .metric { background: var(--surface2); border-radius: 10px; padding: 20px 16px; text-align: center; border: 1px solid var(--border); }
        .metric .val { font-size: 1.6rem; font-weight: 800; color: var(--accent); }
        .metric .lbl { font-size: 0.78rem; color: var(--muted); margin-top: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
        .metric.green .val { color: var(--success); }
        .metric.blue .val { color: var(--brand); }

        .breakdown { border-top: 1px solid var(--border); margin-top: 24px; padding-top: 20px; }
        .breakdown h3 { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
        .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(48,54,61,0.6); font-size: 0.92rem; }
        .row:last-child { border-bottom: none; }
        .row .amt { font-weight: 700; color: var(--accent); }
        .row.total { font-size: 1rem; font-weight: 800; padding-top: 14px; color: var(--text); }
        .row.total .amt { color: var(--success); font-size: 1.1rem; }

        .cta-card { background: linear-gradient(135deg, #00A1E0 0%, #0070a8 100%); border-radius: 12px; padding: 36px 32px; margin-top: 32px; text-align: center; }
        .cta-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        .cta-card p { color: rgba(255,255,255,0.85); margin-bottom: 24px; }

        .lead-form { display: grid; gap: 12px; max-width: 480px; margin: 0 auto; }
        .lead-form input {
          padding: 11px 14px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1);
          color: #fff; font-size: 0.95rem; width: 100%;
        }
        .lead-form input::placeholder { color: rgba(255,255,255,0.6); }
        .lead-form input:focus { outline: none; border-color: #fff; }

        .success-msg { background: rgba(63,185,80,0.15); border: 1px solid var(--success); border-radius: 10px; padding: 20px; text-align: center; color: var(--success); font-weight: 600; }

        footer { text-align: center; color: var(--muted); font-size: 0.8rem; padding: 24px; border-top: 1px solid var(--border); }
      `}</style>

      {/* Hero */}
      <div className="hero">
        <div className="badge">Free ROI Analysis</div>
        <h1>Your Salesforce Tech Debt<br />Is Costing You <span>More Than You Think</span></h1>
        <p>Enter your org's metrics below. We'll calculate the exact dollar value of inefficiency hiding in your Salesforce stack — in 60 seconds.</p>
      </div>

      <div className="container">
        {/* Calculator Form */}
        <form onSubmit={handleCalc}>
          <div className="card">
            <h2>📊 Org Cost Parameters</h2>
            <div className="grid">
              {INPUTS.map((f) => (
                <div className="field" key={f.key}>
                  <label>{f.label}</label>
                  <div className="tip">{f.tooltip}</div>
                  <div className={`input-wrap${f.prefix ? ' has-prefix' : ''}${f.suffix ? ' has-suffix' : ''}`}>
                    {f.prefix && <span className="prefix">{f.prefix}</span>}
                    <input
                      type="number"
                      min="0"
                      value={vals[f.key]}
                      onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                    {f.suffix && <span className="suffix">{f.suffix}</span>}
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="btn">Calculate My Tech Debt Cost →</button>
          </div>
        </form>

        {/* Results */}
        {showResults && (
          <div id="results" className="card">
            <h2>💸 Your Annual Tech Debt Cost Breakdown</h2>
            <div className="results-grid">
              <div className="metric">
                <div className="val">{fmt(roi.annualWaste)}</div>
                <div className="lbl">Lost to Manual Workarounds / Year</div>
              </div>
              <div className="metric">
                <div className="val">{fmt(roi.annualAutomationCost)}</div>
                <div className="lbl">Broken Automation Repair Cost / Year</div>
              </div>
              <div className="metric">
                <div className="val">{fmt(roi.annualBugCost)}</div>
                <div className="lbl">Apex & Integration Bug Cost / Year</div>
              </div>
              <div className="metric">
                <div className="val">{fmt(roi.unusedLicenseCost)}</div>
                <div className="lbl">Under-Utilized License Spend / Year</div>
              </div>
            </div>

            <div className="breakdown">
              <h3>Summary</h3>
              <div className="row"><span>Manual Workaround Waste</span><span className="amt">{fmt(roi.annualWaste)}/yr</span></div>
              <div className="row"><span>Automation Repair Overhead</span><span className="amt">{fmt(roi.annualAutomationCost)}/yr</span></div>
              <div className="row"><span>Apex / Integration Bug Cost</span><span className="amt">{fmt(roi.annualBugCost)}/yr</span></div>
              <div className="row"><span>Wasted License Spend</span><span className="amt">{fmt(roi.unusedLicenseCost)}/yr</span></div>
              <div className="row total">
                <span>🔴 Total Annual Tech Debt Cost</span>
                <span className="amt">{fmt(roi.totalAnnualLoss)}/yr</span>
              </div>
              <div className="row total" style={{ borderTop: '1px solid #3fb950', marginTop: '12px', paddingTop: '14px' }}>
                <span>✅ Conservative Recovery Potential (55%)</span>
                <span className="amt" style={{ color: 'var(--success)' }}>{fmt(roi.conservativeROI)}/yr</span>
              </div>
              <div className="row total" style={{ paddingTop: '8px' }}>
                <span>🚀 Aggressive Recovery Potential (75%)</span>
                <span className="amt" style={{ color: 'var(--brand)' }}>{fmt(roi.aggressiveROI)}/yr</span>
              </div>
            </div>
          </div>
        )}

        {/* CTA / Lead Capture */}
        <div className="cta-card">
          <h2>Ready to Recover That Revenue?</h2>
          <p>Get a free 15-minute architectural review with a Senior Salesforce Consultant.<br />No slides. No pitch deck. Just direct technical conversation.</p>
          {submitted ? (
            <div className="success-msg">
              ✅ You're on the list. Expect a calendar invite within 24 hours.<br />
              <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--success)' }}>We'll come prepared with your org-specific findings.</span>
            </div>
          ) : (
            <form className="lead-form" onSubmit={handleLeadSubmit}>
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
              <input type="email" placeholder="Work Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="btn btn-accent">Book My Free Review →</button>
            </form>
          )}
        </div>
      </div>

      <footer>
        © {new Date().getFullYear()} Gated Enterprise · Premium Salesforce Consulting · <a href="mailto:hello@gatedenterprise.com">hello@gatedenterprise.com</a>
      </footer>
    </>
  );
}
