/**
 * EDUALLIANCE - School Loan & Monthly Repayment Calculator Engine
 * Location: Port Harcourt, Rivers State
 */

(function () {
  'use strict';

  // Standard institutional school loan configuration
  const LOAN_CONFIG = {
    minAmount: 3000000,
    maxAmount: 150000000,
    defaultAmount: 25000000,
    minMonths: 6,
    maxMonths: 36,
    defaultMonths: 18,
    monthlyRate: 0.021 // ~2.1% flat/amortized monthly institutional rate
  };

  // Format currency in Nigerian Naira (₦)
  function formatNaira(amount) {
    if (isNaN(amount) || amount === null) return '₦0';
    return '₦' + Math.round(amount).toLocaleString('en-NG');
  }

  function initCalculator() {
    const amountSlider = document.getElementById('calc-amount-slider');
    const monthsSlider = document.getElementById('calc-months-slider');
    const studentsInput = document.getElementById('calc-students-input');
    const tuitionInput = document.getElementById('calc-tuition-input');

    const amountDisplay = document.getElementById('calc-amount-display');
    const monthsDisplay = document.getElementById('calc-months-display');
    const monthlyRepaymentDisplay = document.getElementById('calc-monthly-repayment');
    const totalRepaymentDisplay = document.getElementById('calc-total-repayment');
    const monthlyRevenueEstimateDisplay = document.getElementById('calc-monthly-revenue-estimate');
    const cashflowIndexPercent = document.getElementById('calc-cashflow-percent');
    const cashflowFillBar = document.getElementById('calc-cashflow-fill');
    const cashflowCard = document.getElementById('calc-cashflow-card');
    const cashflowDesc = document.getElementById('calc-cashflow-desc');
    const transferBtn = document.getElementById('btn-transfer-application');

    if (!amountSlider || !monthsSlider) return;

    // Slider & Input change handlers
    amountSlider.addEventListener('input', calculate);
    monthsSlider.addEventListener('input', calculate);
    if (studentsInput) studentsInput.addEventListener('input', calculate);
    if (tuitionInput) tuitionInput.addEventListener('input', calculate);

    function calculate() {
      const loanAmount = parseFloat(amountSlider.value) || LOAN_CONFIG.defaultAmount;
      const monthsCount = parseInt(monthsSlider.value) || LOAN_CONFIG.defaultMonths;
      const studentCount = parseInt(studentsInput ? studentsInput.value : 350) || 350;
      const averageTermTuition = parseFloat(tuitionInput ? tuitionInput.value : 180000) || 180000;

      // Update Slider value displays
      if (amountDisplay) amountDisplay.textContent = formatNaira(loanAmount);
      if (monthsDisplay) {
        const years = (monthsCount / 12).toFixed(1).replace('.0', '');
        monthsDisplay.textContent = `${monthsCount} Months (${years} ${monthsCount >= 12 ? 'Years' : 'Year'})`;
      }

      // Monthly standard amortization
      const r = LOAN_CONFIG.monthlyRate;
      const n = monthsCount;
      const numerator = loanAmount * r * Math.pow(1 + r, n);
      const denominator = Math.pow(1 + r, n) - 1;
      const monthlyRepayment = numerator / denominator;
      const totalRepayment = monthlyRepayment * n;

      // Estimated Monthly Revenue of School = (Total Term Fees / 4 months per term)
      const estimatedTermTuition = studentCount * averageTermTuition;
      const estimatedMonthlyTuition = estimatedTermTuition / 4;

      // Debt Service Coverage Percentage on Monthly Basis
      const cashflowBurdenRatio = (monthlyRepayment / (estimatedMonthlyTuition || 1)) * 100;

      // Update Results in DOM
      if (monthlyRepaymentDisplay) monthlyRepaymentDisplay.textContent = formatNaira(monthlyRepayment);
      if (totalRepaymentDisplay) totalRepaymentDisplay.textContent = formatNaira(totalRepayment);
      if (monthlyRevenueEstimateDisplay) monthlyRevenueEstimateDisplay.textContent = formatNaira(estimatedMonthlyTuition);

      // Health Meter Evaluation
      if (cashflowIndexPercent && cashflowFillBar && cashflowCard && cashflowDesc) {
        const clampedPercent = Math.min(Math.max(cashflowBurdenRatio, 2), 100);
        cashflowIndexPercent.textContent = `${clampedPercent.toFixed(1)}% of Monthly Fee Income`;
        cashflowFillBar.style.width = `${Math.min(clampedPercent, 100)}%`;

        if (cashflowBurdenRatio <= 25) {
          cashflowCard.className = 'cashflow-health-card';
          cashflowDesc.innerHTML = `<strong>Optimal Debt-Service Ratio:</strong> Monthly repayment absorbs only ${clampedPercent.toFixed(1)}% of estimated monthly tuition revenue, preserving strong operational liquidity for staff payroll and overheads.`;
        } else if (cashflowBurdenRatio <= 38) {
          cashflowCard.className = 'cashflow-health-card warning';
          cashflowDesc.innerHTML = `<strong>Balanced Coverage (${clampedPercent.toFixed(1)}%):</strong> Monthly repayment is within standard institutional underwriting parameters. Historical fee collection records will be assessed.`;
        } else {
          cashflowCard.className = 'cashflow-health-card warning';
          cashflowDesc.innerHTML = `<strong>High Debt Burden (${clampedPercent.toFixed(1)}%):</strong> We suggest extending the repayment tenure to ${Math.min(monthsCount + 6, LOAN_CONFIG.maxMonths)} months to lower monthly debt commitments.`;
        }
      }

      // Store in session storage for application auto-fill
      sessionStorage.setItem('edualliance_calc_data', JSON.stringify({
        amount: loanAmount,
        months: monthsCount,
        students: studentCount,
        averageTuition: averageTermTuition,
        monthlyRepayment: monthlyRepayment
      }));
    }

    // Transfer button action
    if (transferBtn) {
      transferBtn.addEventListener('click', function () {
        calculate();
        window.location.href = 'apply.html?prefill=true';
      });
    }

    // Initial run
    calculate();
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
})();
