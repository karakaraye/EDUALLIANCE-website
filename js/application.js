/**
 * EDUALLIANCE - Multi-Step School Loan Application Engine
 * Location: Port Harcourt Head Office, Rivers State
 */

(function () {
  'use strict';

  let currentStep = 1;
  const totalSteps = 5;

  const appData = {
    schoolName: '',
    cacNumber: '',
    ministryCode: '',
    schoolCategory: 'Comprehensive Secondary (JSS & SSS)',
    schoolAddress: '',
    schoolState: 'Rivers',
    schoolLGA: '',
    yearsOperating: '5 - 9 Years',
    studentEnrollment: 350,
    campusesCount: '1 Campus (Single Site)',

    repFullName: '',
    repDesignation: 'Proprietor / School Owner',
    repPhone: '',
    repEmail: '',
    repIdType: 'NIN',
    repIdNumber: '',
    boardAuthorized: true,

    loanAmount: 25000000,
    requestedTenureMonths: 18,
    targetDisbursementDate: '2026-10',
    additionalNotes: '',

    avgTermTuition: 180000,
    termFeeCollectionMode: 'Termly (Beginning of Term)',
    primaryBanker: 'First Bank of Nigeria',
    annualSchoolRevenue: '₦50M - ₦150M',
    existingLoanObligations: 'None (Debt Free)',

    uploadedDocs: {
      cacCert: 'CAC_Registration_Certificate.pdf',
      ministryApproval: 'Ministry_of_Education_Approval.pdf',
      bankStatements: '12_Months_Bank_Statement.pdf',
      feeSchedule: 'Termly_Tuition_Fee_Schedule.pdf'
    },

    submittedAt: null,
    applicationRef: ''
  };

  function initApplication() {
    const nextBtn = document.getElementById('btn-app-next');
    const backBtn = document.getElementById('btn-app-back');
    const submitBtn = document.getElementById('btn-app-submit');
    const form = document.getElementById('school-loan-form');

    if (!form) return;

    // Check pre-fill from calculator
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('prefill') === 'true') {
      const calcDataRaw = sessionStorage.getItem('edualliance_calc_data');
      if (calcDataRaw) {
        try {
          const calcData = JSON.parse(calcDataRaw);
          if (calcData.amount) {
            const amountInput = document.getElementById('loanAmount');
            if (amountInput) amountInput.value = calcData.amount;
          }
          if (calcData.months) {
            const monthsInput = document.getElementById('requestedTenureMonths');
            if (monthsInput) monthsInput.value = calcData.months;
          }
          if (calcData.students) {
            const studentsInput = document.getElementById('studentEnrollment');
            if (studentsInput) studentsInput.value = calcData.students;
          }
          if (calcData.averageTuition) {
            const tuitionInput = document.getElementById('avgTermTuition');
            if (tuitionInput) tuitionInput.value = calcData.averageTuition;
          }
        } catch (e) {
          console.warn('Could not parse calculator prefill data', e);
        }
      }
    }

    // Radio Card Click Handlers
    const radioLabels = document.querySelectorAll('.radio-card-label');
    radioLabels.forEach(label => {
      label.addEventListener('click', function () {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          updateRadioCardSelections();
        }
      });
    });

    function updateRadioCardSelections() {
      radioLabels.forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        if (radio && radio.checked) {
          label.classList.add('selected');
        } else {
          label.classList.remove('selected');
        }
      });
    }
    updateRadioCardSelections();

    // File Upload Drag & Drop simulation
    setupDropzones();

    // Next Button Click
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (validateStep(currentStep)) {
          saveStepData(currentStep);
          if (currentStep < totalSteps) {
            currentStep++;
            goToStep(currentStep);
          }
        }
      });
    }

    // Back Button Click
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        if (currentStep > 1) {
          currentStep--;
          goToStep(currentStep);
        }
      });
    }

    // Submit Button Click
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (validateStep(5)) {
          saveStepData(5);
          processSubmission();
        }
      });
    }

    // Navigation Step click on bubbles if allowed
    const stepNodes = document.querySelectorAll('.wizard-step-node');
    stepNodes.forEach((node, idx) => {
      node.addEventListener('click', function () {
        const targetStep = idx + 1;
        if (targetStep < currentStep) {
          currentStep = targetStep;
          goToStep(currentStep);
        }
      });
    });
  }

  function goToStep(step) {
    const panes = document.querySelectorAll('.step-content-pane');
    panes.forEach((pane, idx) => {
      if (idx + 1 === step) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    const stepNodes = document.querySelectorAll('.wizard-step-node');
    stepNodes.forEach((node, idx) => {
      const nodeStep = idx + 1;
      node.classList.remove('active', 'completed');
      if (nodeStep === step) {
        node.classList.add('active');
      } else if (nodeStep < step) {
        node.classList.add('completed');
      }
    });

    const fillBar = document.querySelector('.wizard-progress-fill');
    if (fillBar) {
      const percent = ((step - 1) / (totalSteps - 1)) * 90;
      fillBar.style.width = `${percent}%`;
    }

    const backBtn = document.getElementById('btn-app-back');
    const nextBtn = document.getElementById('btn-app-next');
    const submitBtn = document.getElementById('btn-app-submit');

    if (backBtn) {
      backBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    }
    if (nextBtn) {
      nextBtn.style.display = step === totalSteps ? 'none' : 'inline-flex';
    }
    if (submitBtn) {
      submitBtn.style.display = step === totalSteps ? 'inline-flex' : 'none';
    }

    if (step === 5) {
      populateReviewSummary();
    }

    const formCard = document.querySelector('.form-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function validateStep(step) {
    let isValid = true;
    const currentPane = document.getElementById(`step-${step}-pane`);
    if (!currentPane) return true;

    const formGroups = currentPane.querySelectorAll('.form-group');
    formGroups.forEach(g => g.classList.remove('has-error'));

    const requiredInputs = currentPane.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      if (input.type === 'checkbox') {
        if (!input.checked) {
          isValid = false;
          input.closest('.form-group')?.classList.add('has-error');
        }
      } else if (!input.value.trim()) {
        isValid = false;
        input.closest('.form-group')?.classList.add('has-error');
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    });

    if (!isValid) {
      showToast('Please complete all required fields marked with an asterisk (*).', 'warning');
    }

    return isValid;
  }

  function saveStepData(step) {
    if (step === 1) {
      appData.schoolName = document.getElementById('schoolName')?.value || '';
      appData.cacNumber = document.getElementById('cacNumber')?.value || '';
      appData.ministryCode = document.getElementById('ministryCode')?.value || '';
      appData.schoolCategory = document.querySelector('input[name="schoolCategory"]:checked')?.value || 'Comprehensive Secondary';
      appData.schoolAddress = document.getElementById('schoolAddress')?.value || '';
      appData.schoolState = document.getElementById('schoolState')?.value || 'Rivers';
      appData.schoolLGA = document.getElementById('schoolLGA')?.value || '';
      appData.yearsOperating = document.getElementById('yearsOperating')?.value || '5 - 9 Years';
      appData.studentEnrollment = parseInt(document.getElementById('studentEnrollment')?.value) || 350;
    } else if (step === 2) {
      appData.repFullName = document.getElementById('repFullName')?.value || '';
      appData.repDesignation = document.getElementById('repDesignation')?.value || 'Proprietor / School Owner';
      appData.repPhone = document.getElementById('repPhone')?.value || '';
      appData.repEmail = document.getElementById('repEmail')?.value || '';
      appData.repIdType = document.getElementById('repIdType')?.value || 'NIN';
      appData.repIdNumber = document.getElementById('repIdNumber')?.value || '';
      appData.boardAuthorized = document.getElementById('boardAuthorized')?.checked || true;
    } else if (step === 3) {
      appData.loanAmount = parseFloat(document.getElementById('loanAmount')?.value) || 25000000;
      appData.requestedTenureMonths = parseInt(document.getElementById('requestedTenureMonths')?.value) || 18;
      appData.targetDisbursementDate = document.getElementById('targetDisbursementDate')?.value || '2026-10';
      appData.additionalNotes = document.getElementById('additionalNotes')?.value || '';
    } else if (step === 4) {
      appData.avgTermTuition = parseFloat(document.getElementById('avgTermTuition')?.value) || 180000;
      appData.termFeeCollectionMode = document.getElementById('termFeeCollectionMode')?.value || 'Termly';
      appData.primaryBanker = document.getElementById('primaryBanker')?.value || 'First Bank';
      appData.annualSchoolRevenue = document.getElementById('annualSchoolRevenue')?.value || '₦50M - ₦150M';
      appData.existingLoanObligations = document.getElementById('existingLoanObligations')?.value || 'None';
    }
  }

  function populateReviewSummary() {
    const summaryContainer = document.getElementById('review-summary-container');
    if (!summaryContainer) return;

    const formatNaira = (amt) => '₦' + Math.round(amt || 0).toLocaleString('en-NG');

    summaryContainer.innerHTML = `
      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; color: var(--navy-900); font-weight: 800; margin-bottom: 1rem; border-bottom: 1px solid var(--slate-200); padding-bottom: 0.5rem;">
          1. School Profile & Accreditation
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
          <div><span style="color: var(--slate-500);">School Legal Name:</span> <strong style="color: var(--navy-900);">${appData.schoolName || 'Gracefield Model High School'}</strong></div>
          <div><span style="color: var(--slate-500);">CAC RC / BN Number:</span> <strong style="color: var(--navy-900);">${appData.cacNumber || 'RC-1428901'}</strong></div>
          <div><span style="color: var(--slate-500);">Ministry Reference:</span> <strong style="color: var(--navy-900);">${appData.ministryCode || 'RS/MOE/2019/312'}</strong></div>
          <div><span style="color: var(--slate-500);">Campus Location:</span> <strong style="color: var(--navy-900);">${appData.schoolAddress || 'Trans-Amadi, Port Harcourt, Rivers State'}</strong></div>
          <div><span style="color: var(--slate-500);">Active Student Enrollment:</span> <strong style="color: var(--teal-700);">${appData.studentEnrollment || 350} Students</strong></div>
          <div><span style="color: var(--slate-500);">Years of Operation:</span> <strong style="color: var(--navy-900);">${appData.yearsOperating || '5 - 9 Years'}</strong></div>
        </div>
      </div>

      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; color: var(--navy-900); font-weight: 800; margin-bottom: 1rem; border-bottom: 1px solid var(--slate-200); padding-bottom: 0.5rem;">
          2. Authorized Decision-Maker Credentials
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
          <div><span style="color: var(--slate-500);">Representative Name:</span> <strong style="color: var(--navy-900);">${appData.repFullName || 'Chief (Mrs.) Grace Briggs'}</strong></div>
          <div><span style="color: var(--slate-500);">Institutional Designation:</span> <strong style="color: var(--teal-700);">${appData.repDesignation}</strong></div>
          <div><span style="color: var(--slate-500);">Official Phone:</span> <strong style="color: var(--navy-900);">${appData.repPhone || '+234 803 000 0000'}</strong></div>
          <div><span style="color: var(--slate-500);">Official Email:</span> <strong style="color: var(--navy-900);">${appData.repEmail || 'proprietor@school.edu.ng'}</strong></div>
        </div>
      </div>

      <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.1rem; color: var(--navy-900); font-weight: 800; margin-bottom: 1rem; border-bottom: 1px solid var(--slate-200); padding-bottom: 0.5rem;">
          3. School Loan Request & Tuition Metrics
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
          <div><span style="color: var(--slate-500);">Requested Principal:</span> <strong style="color: var(--gold-600); font-size: 1.05rem;">${formatNaira(appData.loanAmount)}</strong></div>
          <div><span style="color: var(--slate-500);">Repayment Tenure:</span> <strong style="color: var(--navy-900);">${appData.requestedTenureMonths} Months (${(appData.requestedTenureMonths / 12).toFixed(1)} Yrs)</strong></div>
          <div><span style="color: var(--slate-500);">Average Term Tuition / Student:</span> <strong style="color: var(--teal-700);">${formatNaira(appData.avgTermTuition)}</strong></div>
          <div><span style="color: var(--slate-500);">Primary Institution Banker:</span> <strong style="color: var(--navy-900);">${appData.primaryBanker}</strong></div>
          <div><span style="color: var(--slate-500);">Underwriting Office:</span> <strong style="color: var(--navy-900);">Port Harcourt Head Office, Rivers State</strong></div>
        </div>
      </div>
    `;
  }

  function setupDropzones() {
    const dropboxes = document.querySelectorAll('.doc-upload-box');
    dropboxes.forEach(box => {
      const input = box.querySelector('input[type="file"]');
      
      box.addEventListener('click', () => {
        if (input) input.click();
      });

      if (input) {
        input.addEventListener('change', function () {
          if (this.files && this.files[0]) {
            const fileName = this.files[0].name;
            const existingChip = box.querySelector('.doc-uploaded-chip');
            if (existingChip) existingChip.remove();

            const chip = document.createElement('div');
            chip.className = 'doc-uploaded-chip';
            chip.innerHTML = `
              <span>✓ ${fileName}</span>
              <span style="color: var(--slate-500); font-size: 0.7rem;">${(this.files[0].size / 1024 / 1024).toFixed(2)} MB</span>
            `;
            box.appendChild(chip);
            showToast(`Document "${fileName}" attached successfully.`, 'success');
          }
        });
      }
    });
  }

  function processSubmission() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const appRef = `EDU-2026-${randomNum}`;
    appData.applicationRef = appRef;
    appData.submittedAt = new Date().toISOString();

    let registry = [];
    try {
      const stored = localStorage.getItem('edualliance_applications_registry');
      if (stored) registry = JSON.parse(stored);
    } catch (e) {
      registry = [];
    }
    registry.unshift(appData);
    localStorage.setItem('edualliance_applications_registry', JSON.stringify(registry));

    const wizardWrap = document.querySelector('.app-portal-layout');
    if (wizardWrap) {
      const formatNaira = (amt) => '₦' + Math.round(amt || 0).toLocaleString('en-NG');

      wizardWrap.innerHTML = `
        <div class="submission-success-card">
          <div class="success-seal-wrap">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <span class="badge badge-teal" style="font-size: 0.85rem; padding: 0.4rem 1rem; margin-bottom: 1rem;">
            Official Application Received
          </span>
          <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--navy-900); margin-bottom: 0.5rem;">
            School Loan Application Submitted
          </h2>
          <p style="font-size: 1.05rem; color: var(--slate-600); max-width: 600px; margin: 0 auto 1.5rem auto;">
            Thank you, <strong>${appData.repFullName || 'School Proprietor'}</strong>. Your application on behalf of 
            <strong>${appData.schoolName || 'your educational institution'}</strong> has been registered with the 
            EDUALLIANCE Port Harcourt Underwriting Desk.
          </p>

          <div class="app-ref-badge-display">
            <span>Reference ID:</span>
            <strong>${appRef}</strong>
          </div>

          <div style="background: rgba(13, 107, 99, 0.05); border: 1px solid rgba(13, 107, 99, 0.2); border-radius: var(--radius-lg); padding: 1.5rem; max-width: 680px; margin: 0 auto 2rem auto; text-align: left;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--teal-700); margin-bottom: 0.65rem; text-transform: uppercase;">
              Next Steps for Authorized Representative:
            </h4>
            <ul style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.875rem; color: var(--slate-700);">
              <li style="display: flex; align-items: flex-start; gap: 0.5rem;">
                <strong style="color: var(--navy-900);">1. Desk Review:</strong> Our Port Harcourt underwriting team will complete initial document verification within 24 to 48 business hours.
              </li>
              <li style="display: flex; align-items: flex-start; gap: 0.5rem;">
                <strong style="color: var(--navy-900);">2. Campus Appraisal:</strong> A dedicated Education Finance Officer will contact you to schedule an on-site school verification visit.
              </li>
              <li style="display: flex; align-items: flex-start; gap: 0.5rem;">
                <strong style="color: var(--navy-900);">3. Facility Execution:</strong> Formal Offer Letter with monthly repayment schedule will be issued for execution.
              </li>
            </ul>
          </div>

          <table class="summary-details-table">
            <tr>
              <td class="field-title">Institution Name</td>
              <td class="field-val">${appData.schoolName || 'Registered Educational Institution'}</td>
            </tr>
            <tr>
              <td class="field-title">CAC RC / BN Number</td>
              <td class="field-val">${appData.cacNumber || 'Verified CAC Record'}</td>
            </tr>
            <tr>
              <td class="field-title">Requested Principal</td>
              <td class="field-val" style="color: var(--gold-600); font-weight: 800;">${formatNaira(appData.loanAmount)}</td>
            </tr>
            <tr>
              <td class="field-title">Repayment Tenure</td>
              <td class="field-val">${appData.requestedTenureMonths} Monthly Instalments</td>
            </tr>
            <tr>
              <td class="field-title">Processing Office</td>
              <td class="field-val">Port Harcourt Head Office, Rivers State</td>
            </tr>
            <tr>
              <td class="field-title">Submission Date</td>
              <td class="field-val">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
          </table>

          <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 2.5rem;">
            <button onclick="window.print()" class="btn-secondary-lg" style="font-size: 0.95rem;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print / Save Application Slip
            </button>
            <a href="tracker.html?ref=${appRef}" class="btn-primary-lg" style="font-size: 0.95rem;">
              Track Live Application Status &rarr;
            </a>
          </div>
        </div>
      `;

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
  } else {
    initApplication();
  }
})();
