/**
 * EDUALLIANCE - School Application Reference Tracker Engine
 * Port Harcourt Head Office, Rivers State
 */

(function () {
  'use strict';

  // Demo fallback profiles aligned with Port Harcourt, Rivers State
  const SAMPLE_APPLICATIONS = {
    'EDU-2026-8941': {
      schoolName: 'Gracefield Model College, Trans-Amadi, Port Harcourt',
      cacNumber: 'RC-1428901',
      loanAmount: 35000000,
      requestedTenureMonths: 24,
      stageIndex: 3, // 1: Registered, 2: KYC Verified, 3: Campus Appraisal Scheduled, 4: Credit Committee, 5: Disbursed
      submissionDate: '12 September 2026',
      assignedOfficer: 'Mr. Kenneth Briggs',
      officerTitle: 'Senior Education Credit Officer - Port Harcourt Desk',
      officerPhone: '084-888-4300',
      notes: 'Physical campus appraisal confirmed for Thursday, 17th September 2026 at 10:00 AM in Trans-Amadi.'
    },
    'EDU-2026-1044': {
      schoolName: 'St. Thomas International Academy, Peter Odili Road, Port Harcourt',
      cacNumber: 'RC-992381',
      loanAmount: 20000000,
      requestedTenureMonths: 18,
      stageIndex: 4,
      submissionDate: '08 September 2026',
      assignedOfficer: 'Mrs. Stella Jumbo',
      officerTitle: 'Underwriting Lead - Rivers State Desk',
      officerPhone: '+234 803 888 4301',
      notes: 'Campus technical audit concluded. File submitted to Credit Committee for final Offer Letter issuance.'
    }
  };

  function initTracker() {
    const searchForm = document.getElementById('tracker-search-form');
    const inputRef = document.getElementById('tracker-ref-input');
    const resultsContainer = document.getElementById('tracker-results-container');

    if (!searchForm || !inputRef || !resultsContainer) return;

    // Check query params for auto-lookup
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      inputRef.value = refParam;
      lookupApplication(refParam);
    }

    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const ref = inputRef.value.trim().toUpperCase();
      if (!ref) return;
      lookupApplication(ref);
    });

    function lookupApplication(ref) {
      let app = null;

      // 1. Check local storage registry
      try {
        const stored = localStorage.getItem('edualliance_applications_registry');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find(item => item.applicationRef && item.applicationRef.toUpperCase() === ref);
          if (found) {
            app = {
              schoolName: found.schoolName || 'Your Educational Institution',
              cacNumber: found.cacNumber || 'RC Verified',
              loanAmount: found.loanAmount || 25000000,
              requestedTenureMonths: found.requestedTenureMonths || 18,
              stageIndex: 2, // newly submitted moves to stage 2: KYC review
              submissionDate: new Date(found.submittedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
              assignedOfficer: 'Mr. Kenneth Briggs',
              officerTitle: 'Education Credit Specialist - Port Harcourt Desk',
              officerPhone: '084-888-4300',
              notes: 'Your school dossier and CAC credentials are currently undergoing preliminary desk review at our Port Harcourt office.'
            };
          }
        }
      } catch (e) {
        console.warn('Storage check failed', e);
      }

      // 2. Check sample fallback
      if (!app) {
        app = SAMPLE_APPLICATIONS[ref];
      }

      // 3. Fallback for any newly typed EDU-2026-XXXX
      if (!app && ref.startsWith('EDU-')) {
        app = {
          schoolName: 'Registered Educational Institution',
          cacNumber: 'CAC-Verified',
          loanAmount: 25000000,
          requestedTenureMonths: 18,
          stageIndex: 2,
          submissionDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          assignedOfficer: 'Mr. Kenneth Briggs',
          officerTitle: 'Education Underwriting Officer',
          officerPhone: '084-888-4300',
          notes: 'Application registered. Desk appraisal underway in Port Harcourt.'
        };
      }

      if (app) {
        renderTrackingView(ref, app);
      } else {
        renderNotFound(ref);
      }
    }

    function renderTrackingView(ref, app) {
      const formatNaira = (amt) => '₦' + Math.round(amt || 0).toLocaleString('en-NG');

      const stages = [
        { title: '1. Online Application Received', desc: 'Institutional application & supporting credentials registered in the portal.' },
        { title: '2. Document Screening & KYC', desc: 'CAC verification, State Ministry approval checks, and tuition deposit review.' },
        { title: '3. Physical Campus Appraisal', desc: 'On-site verification by EDUALLIANCE Port Harcourt team & student population assessment.' },
        { title: '4. Credit Committee Review', desc: 'Underwriting approval and structuring of monthly repayment schedule.' },
        { title: '5. Offer Letter Execution & Funding', desc: 'Final execution of facility agreement and direct account disbursement.' }
      ];

      let stagesHTML = '';
      stages.forEach((stage, idx) => {
        const stepNum = idx + 1;
        let statusClass = 'pending';
        let badgeText = 'Pending';
        let badgeClass = 'badge-navy';

        if (stepNum < app.stageIndex) {
          statusClass = 'completed';
          badgeText = 'Completed';
          badgeClass = 'badge-emerald';
        } else if (stepNum === app.stageIndex) {
          statusClass = 'current';
          badgeText = 'In Progress';
          badgeClass = 'badge-gold';
        }

        stagesHTML += `
          <div class="tracking-timeline-step ${statusClass}" style="display: flex; gap: 1.5rem; position: relative; padding-bottom: 2rem;">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; z-index: 2;
                ${statusClass === 'completed' ? 'background: var(--emerald-600); color: white;' : statusClass === 'current' ? 'background: var(--navy-900); color: var(--gold-400); border: 2px solid var(--gold-500);' : 'background: var(--slate-100); color: var(--slate-400); border: 1px solid var(--slate-300);'}">
                ${statusClass === 'completed' ? '✓' : stepNum}
              </div>
              ${idx < stages.length - 1 ? `<div style="width: 2px; flex-grow: 1; background: ${stepNum < app.stageIndex ? 'var(--emerald-600)' : 'var(--slate-200)'}; margin: 4px 0;"></div>` : ''}
            </div>
            <div style="flex-grow: 1; background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-xs);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                <h4 style="font-size: 1rem; font-weight: 800; color: var(--navy-900);">${stage.title}</h4>
                <span class="badge ${badgeClass}" style="font-size: 0.725rem;">${badgeText}</span>
              </div>
              <p style="font-size: 0.84rem; color: var(--slate-600); line-height: 1.5;">${stage.desc}</p>
            </div>
          </div>
        `;
      });

      resultsContainer.innerHTML = `
        <div style="background: var(--white); border-radius: var(--radius-xl); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg); padding: 2.5rem; margin-top: 2rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--slate-200); padding-bottom: 1.5rem; margin-bottom: 2rem;">
            <div>
              <span class="badge badge-teal" style="margin-bottom: 0.5rem;">Active Institutional Record</span>
              <h3 style="font-size: 1.65rem; font-weight: 800; color: var(--navy-900);">${app.schoolName}</h3>
              <p style="font-size: 0.875rem; color: var(--slate-500);">CAC ID: <strong>${app.cacNumber}</strong> | Submitted: <strong>${app.submissionDate}</strong></p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--slate-400); display: block;">Application ID</span>
              <span style="font-size: 1.35rem; font-weight: 800; color: var(--navy-900); background: var(--slate-100); padding: 0.35rem 0.85rem; border-radius: var(--radius-md); font-family: monospace;">${ref}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2.5rem;">
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--navy-900); margin-bottom: 1.5rem;">
                Institutional Review Milestones
              </h4>
              <div style="display: flex; flex-direction: column;">
                ${stagesHTML}
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.5rem;">
                <h5 style="font-size: 0.8125rem; font-weight: 800; text-transform: uppercase; color: var(--slate-400); margin-bottom: 0.75rem;">
                  Loan Particulars
                </h5>
                <p style="font-size: 0.875rem; color: var(--slate-600); margin-bottom: 0.35rem;">Facility:</p>
                <p style="font-size: 0.95rem; font-weight: 700; color: var(--navy-900); margin-bottom: 0.85rem;">Institutional School Loan</p>
                <p style="font-size: 0.875rem; color: var(--slate-600); margin-bottom: 0.35rem;">Requested Principal:</p>
                <p style="font-size: 1.25rem; font-weight: 800; color: var(--gold-600); margin-bottom: 0.85rem;">${formatNaira(app.loanAmount)}</p>
                <p style="font-size: 0.875rem; color: var(--slate-600); margin-bottom: 0.35rem;">Repayment Tenure:</p>
                <p style="font-size: 0.95rem; font-weight: 700; color: var(--navy-900);">${app.requestedTenureMonths} Monthly Instalments</p>
              </div>

              <div style="background: linear-gradient(135deg, var(--navy-950) 0%, var(--teal-900) 100%); color: var(--white); border-radius: var(--radius-lg); padding: 1.5rem;">
                <h5 style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--gold-400); margin-bottom: 0.75rem;">
                  Port Harcourt Underwriting Desk
                </h5>
                <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--white); margin-bottom: 0.2rem;">${app.assignedOfficer}</h4>
                <p style="font-size: 0.775rem; color: var(--slate-300); margin-bottom: 1rem;">${app.officerTitle}</p>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem;">
                  <a href="tel:${app.officerPhone}" style="color: var(--white); display: flex; align-items: center; gap: 0.4rem;">
                    📞 Office Desk: <strong>${app.officerPhone}</strong>
                  </a>
                </div>
              </div>

              <div style="background: rgba(217, 119, 6, 0.08); border: 1px solid rgba(217, 119, 6, 0.25); border-radius: var(--radius-md); padding: 1rem; font-size: 0.8125rem; color: var(--slate-700);">
                <strong style="color: var(--gold-700); display: block; margin-bottom: 0.25rem;">Latest Advisory Note:</strong>
                ${app.notes}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderNotFound(ref) {
      resultsContainer.innerHTML = `
        <div style="background: var(--white); border-radius: var(--radius-xl); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); padding: 3rem; text-align: center; margin-top: 2rem;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: #fff1f2; color: #e11d48; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 1.25rem auto;">
            !
          </div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--navy-900); margin-bottom: 0.5rem;">
            No Application Found for Reference "${ref}"
          </h3>
          <p style="font-size: 0.95rem; color: var(--slate-600); max-width: 500px; margin: 0 auto 1.5rem auto;">
            Please ensure you have entered the exact Reference ID generated upon submitting your School Loan Application (e.g. <code>EDU-2026-8941</code>).
          </p>
          <div style="display: flex; justify-content: center; gap: 1rem;">
            <button onclick="document.getElementById('tracker-ref-input').value = 'EDU-2026-8941'; document.getElementById('tracker-search-form').dispatchEvent(new Event('submit'))" class="btn-secondary-lg" style="font-size: 0.875rem;">
              View Demo Record (EDU-2026-8941)
            </button>
            <a href="apply.html" class="btn-primary-lg" style="font-size: 0.875rem;">
              Submit New Application
            </a>
          </div>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
  } else {
    initTracker();
  }
})();
