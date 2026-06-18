// CarbonWise Step-by-Step Calculator

class CarbonCalculator {
  constructor() {
    this.currentStep = 0;
    this.questions = [
      {
        id: 'user_profile',
        title: "Let's get started!",
        desc: "What is your name? We'll customize your carbon dashboard.",
        type: 'text',
        key: 'userName',
        placeholder: 'Enter your name...',
        defaultValue: 'Eco Guardian'
      },
      {
        id: 'transportation_type',
        title: "How do you commute?",
        desc: "Choose the primary method of transportation you use for daily travel.",
        type: 'select-card',
        key: 'transportType',
        options: [
          { value: 'gas-car', label: 'Gasoline Car', icon: 'car-front' },
          { value: 'electric-car', label: 'Electric Car', icon: 'zap' },
          { value: 'public', label: 'Public Transit', icon: 'bus' },
          { value: 'active', label: 'Walk / Bicycle', icon: 'bike' }
        ]
      },
      {
        id: 'transportation_distance',
        title: "Commute distance",
        desc: "Estimate the total miles you travel in an average week across all transit modes.",
        type: 'slider',
        key: 'transportDistance',
        min: 0,
        max: 500,
        step: 10,
        unit: 'miles / week'
      },
      {
        id: 'diet',
        title: "What are your diet habits?",
        desc: "Food production is responsible for significant emissions. Select your typical diet.",
        type: 'select-card',
        key: 'dietType',
        options: [
          { value: 'heavy-meat', label: 'Meat Intensive', icon: 'beef' },
          { value: 'average', label: 'Average Mixed', icon: 'drumstick' },
          { value: 'vegetarian', label: 'Vegetarian', icon: 'egg' },
          { value: 'vegan', label: 'Vegan / Plant', icon: 'salad' }
        ]
      },
      {
        id: 'energy_bill',
        title: "Household electricity",
        desc: "Enter your average monthly household electric bill.",
        type: 'slider',
        key: 'energyBill',
        min: 0,
        max: 500,
        step: 10,
        unit: 'USD / month'
      },
      {
        id: 'household_occupants',
        title: "Household occupants",
        desc: "How many people (including yourself) share this household?",
        type: 'slider',
        key: 'houseSize',
        min: 1,
        max: 8,
        step: 1,
        unit: 'people'
      },
      {
        id: 'waste_recycling',
        title: "Recycling habits",
        desc: "How consistently do you recycle metal, plastic, paper, and glass?",
        type: 'select-card',
        key: 'recycleHabit',
        options: [
          { value: 'always', label: 'Always Recycle', icon: 'refresh-cw' },
          { value: 'sometimes', label: 'Sometimes', icon: 'help-circle' },
          { value: 'never', label: 'Rarely / Never', icon: 'trash' }
        ]
      },
      {
        id: 'waste_food',
        title: "Food waste generation",
        desc: "How much food waste does your household throw away compared to average?",
        type: 'select-card',
        key: 'wasteVolume',
        options: [
          { value: 'low', label: 'Much Less', icon: 'smile' },
          { value: 'average', label: 'Average', icon: 'meh' },
          { value: 'high', label: 'Much More', icon: 'frown' }
        ]
      }
    ];

    this.tempAnswers = {};
    if (typeof document !== 'undefined') {
      this.bindEvents();
    }
  }

  bindEvents() {
    const prevBtn = document.getElementById('btn-calc-prev');
    const nextBtn = document.getElementById('btn-calc-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousStep());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStep());
    }
  }

  initCalculator() {
    // Load existing calculator answers from global app state
    const state = window.carbonWiseApp.state;
    this.tempAnswers = { ...state.calculatorAnswers };
    if (!this.tempAnswers.userName) {
      this.tempAnswers.userName = state.userName;
    }
    
    this.currentStep = 0;
    this.renderStep();
  }

  renderStep() {
    const container = document.getElementById('calculator-steps-container');
    if (!container) return;

    const stepData = this.questions[this.currentStep];
    const prevBtn = document.getElementById('btn-calc-prev');
    const nextBtn = document.getElementById('btn-calc-next');

    // Show/hide Back button
    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep === 0 ? 'hidden' : 'visible';
    }

    // Set Next/Submit text
    if (nextBtn) {
      if (this.currentStep === this.questions.length - 1) {
        nextBtn.innerHTML = `Calculate & Submit <i data-lucide="check"></i>`;
      } else {
        nextBtn.innerHTML = `Next <i data-lucide="arrow-right"></i>`;
      }
    }

    // Update Progress Bar
    const progressPct = ((this.currentStep) / (this.questions.length)) * 100;
    const progress = document.getElementById('calculator-progress-bar');
    if (progress) {
      progress.style.width = `${progressPct}%`;
    }

    // Render step layout
    let html = `
      <div class="calc-step active">
        <h2 class="question-title">${stepData.title}</h2>
        <p class="question-desc">${stepData.desc}</p>
    `;

    if (stepData.type === 'text') {
      const val = this.tempAnswers[stepData.key] || stepData.defaultValue;
      const escapedVal = window.escapeHtml ? window.escapeHtml(val) : val;
      html += `
        <div class="form-group" style="margin: 2rem 0;">
          <label for="calc-text-input" class="sr-only">Enter your name</label>
          <input type="text" id="calc-text-input" aria-label="Enter your name" class="form-input" value="${escapedVal}" style="padding: 1rem; font-size: 1.1rem; width: 100%;">
        </div>
      `;
    } 
    else if (stepData.type === 'select-card') {
      const selectedVal = this.tempAnswers[stepData.key];
      html += `<div class="options-grid" role="group" aria-label="${stepData.title}">`;
      
      stepData.options.forEach(opt => {
        const isSelected = selectedVal === opt.value;
        const selectedClass = isSelected ? 'selected' : '';
        html += `
          <div class="option-card ${selectedClass}" data-value="${opt.value}" role="button" tabindex="0" aria-pressed="${isSelected}" aria-label="${opt.label}">
            <i data-lucide="${opt.icon}" aria-hidden="true"></i>
            <span>${opt.label}</span>
          </div>
        `;
      });
      
      html += `</div>`;
    } 
    else if (stepData.type === 'slider') {
      const val = this.tempAnswers[stepData.key] !== undefined ? this.tempAnswers[stepData.key] : stepData.min;
      html += `
        <div class="input-slider-wrapper">
          <div class="slider-info">
            <span style="color: var(--color-text-secondary);">Current Value:</span>
            <span class="slider-val"><span id="slider-bubble">${val}</span> ${stepData.unit}</span>
          </div>
          <label for="calc-slider" class="sr-only">${stepData.title}</label>
          <input type="range" id="calc-slider" class="custom-slider" 
                 min="${stepData.min}" max="${stepData.max}" step="${stepData.step}" value="${val}"
                 aria-label="${stepData.title}" aria-valuemin="${stepData.min}" aria-valuemax="${stepData.max}" aria-valuenow="${val}" aria-valuetext="${val} ${stepData.unit}">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted);">
            <span>${stepData.min} ${stepData.unit.split(' ')[0]}</span>
            <span>${stepData.max} ${stepData.unit.split(' ')[0]}</span>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Re-create lucide vector icons
    if (window.lucide) window.lucide.createIcons();

    // Bind inputs event listeners
    this.bindInputs(stepData);
  }

  bindInputs(stepData) {
    if (stepData.type === 'text') {
      const txt = document.getElementById('calc-text-input');
      txt.addEventListener('input', (e) => {
        this.tempAnswers[stepData.key] = e.target.value.trim() || 'Eco Friend';
      });
      txt.addEventListener('focus', () => txt.select());
      txt.addEventListener('click', () => txt.select());
    } 
    else if (stepData.type === 'select-card') {
      const cards = document.querySelectorAll('.option-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          cards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.tempAnswers[stepData.key] = card.getAttribute('data-value');
          
          // Auto advance on card selection after short delay to make UI snappy
          setTimeout(() => {
            this.nextStep();
          }, 250);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    } 
    else if (stepData.type === 'slider') {
      const slider = document.getElementById('calc-slider');
      const bubble = document.getElementById('slider-bubble');
      slider.addEventListener('input', (e) => {
        bubble.textContent = e.target.value;
        this.tempAnswers[stepData.key] = parseFloat(e.target.value);
      });
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep();
    }
  }

  nextStep() {
    const stepData = this.questions[this.currentStep];
    
    // Save current step data to temp if not set by events
    if (stepData.type === 'text') {
      const input = document.getElementById('calc-text-input');
      if (input) {
        this.tempAnswers[stepData.key] = input.value.trim() || 'Eco Friend';
      }
    } else if (stepData.type === 'slider') {
      const slider = document.getElementById('calc-slider');
      if (slider) {
        this.tempAnswers[stepData.key] = parseFloat(slider.value);
      }
    }

    // Validation
    if (this.tempAnswers[stepData.key] === undefined) {
      Toast.show("Please select or input an option to proceed.", "warning");
      return;
    }

    if (this.currentStep < this.questions.length - 1) {
      this.currentStep++;
      this.renderStep();
    } else {
      this.submitCalculator();
    }
  }

  submitCalculator() {
    // Compute Carbon Footprint using CarbonMath utility
    const ans = this.tempAnswers;
    const MathUtil = window.CarbonMath || CarbonMath;
    
    const breakdown = {
      transport: MathUtil.calculateTransport(ans.transportType, ans.transportDistance),
      diet: MathUtil.calculateDiet(ans.dietType),
      energy: MathUtil.calculateEnergy(ans.energyBill, ans.houseSize),
      waste: MathUtil.calculateWaste(ans.recycleHabit, ans.wasteVolume)
    };

    const totalFootprint = breakdown.transport + breakdown.diet + breakdown.energy + breakdown.waste;

    // Update global app state
    const app = window.carbonWiseApp;
    app.state.userName = ans.userName;
    app.state.calculatorAnswers = { ...ans };
    app.state.calculatorFootprint = totalFootprint;
    app.state.breakdown = breakdown;
    app.state.hasCalculated = true;

    // Award XP points for completing the assessment
    if (!localStorage.getItem('carbonwise_calculator_xp_granted')) {
      app.state.ecoPoints += 150; // 150 XP bonus for first assessment
      localStorage.setItem('carbonwise_calculator_xp_granted', 'true');
    }

    app.saveState();
    
    // Animate the progress bar to 100%
    const progress = document.getElementById('calculator-progress-bar');
    if (progress) {
      progress.style.width = '100%';
    }

    setTimeout(() => {
      Toast.show("Congratulations! Your carbon footprint profile is ready.", "success");
      app.navigateToView('dashboard');
    }, 300);
  }
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CarbonCalculator;
} else {
  // Instantiate and attach to window
  window.carbonCalc = new CarbonCalculator();
}
