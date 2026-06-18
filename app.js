// CarbonWise Global State Manager

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;

class Toast {
  static show(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';
    if (type === 'warning') icon = 'alert-circle';
    
    toast.innerHTML = `
      <i data-lucide="${icon}"></i>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
    
    // Trigger animations
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Dismiss after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}
window.Toast = Toast;

const DEFAULT_STATE = {
  hasCalculated: false,
  userName: "Eco Guardian",
  ecoPoints: 0,
  level: 1,
  calculatorAnswers: {
    transportType: 'none',
    transportDistance: 0,
    dietType: 'vegan',
    energyBill: 0,
    houseSize: 2,
    recycleHabit: 'always',
    wasteVolume: 2
  },
  calculatorFootprint: 0, // kg CO2e per year
  breakdown: {
    transport: 0,
    diet: 0,
    energy: 0,
    waste: 0
  },
  logs: [],
  completedChallenges: []
};

class CarbonWiseApp {
  constructor() {
    window.carbonWiseApp = this;
    this.state = { ...DEFAULT_STATE };
    this.init();
  }

  init() {
    this.loadState();
    this.bindNavigation();
    this.bindGlobalEvents();
    this.updateUserUI();
    this.renderActiveView('dashboard');
  }

  loadState() {
    const saved = localStorage.getItem('carbonwise_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULT_STATE to handle schema updates gracefully
        this.state = { ...DEFAULT_STATE, ...parsed };
      } catch (e) {
        console.error("Error loading saved state, resetting to default", e);
        this.state = { ...DEFAULT_STATE };
      }
    } else {
      this.state = { ...DEFAULT_STATE };
    }
  }

  saveState() {
    localStorage.setItem('carbonwise_state', JSON.stringify(this.state));
    this.updateUserUI();
  }

  resetState() {
    if (confirm("Are you sure you want to reset all tracking data and carbon profiles?")) {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE)); // deep clone
      this.saveState();
      location.reload();
    }
  }

  bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = link.getAttribute('data-view');
        
        // Update active class on nav links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        this.renderActiveView(viewName);
      });
    });

    // Dashboard inner link navigation
    const goCalcBtn = document.getElementById('go-to-calc-btn');
    if (goCalcBtn) {
      goCalcBtn.addEventListener('click', () => {
        this.navigateToView('calculator');
      });
    }

    const goLoggerLink = document.getElementById('go-to-logger-link');
    if (goLoggerLink) {
      goLoggerLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToView('logger');
      });
    }
  }

  bindGlobalEvents() {
    // Reset Button
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetState());
    }

    // Modal Events
    const logModalBtn = document.getElementById('btn-quick-log-dash');
    const logModal = document.getElementById('custom-log-modal');
    const closeModalBtn = document.getElementById('btn-close-log-modal');

    if (logModalBtn && logModal) {
      logModalBtn.addEventListener('click', () => {
        logModal.classList.add('active');
      });
    }

    if (closeModalBtn && logModal) {
      closeModalBtn.addEventListener('click', () => {
        logModal.classList.remove('active');
      });
    }

    // Close modal on overlay click
    if (logModal) {
      logModal.addEventListener('click', (e) => {
        if (e.target === logModal) {
          logModal.classList.remove('active');
        }
      });
    }
  }

  navigateToView(viewName) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
    this.renderActiveView(viewName);
  }

  renderActiveView(viewName) {
    // Hide all views, show selected
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Trigger specific rendering sub-controllers
    switch (viewName) {
      case 'dashboard':
        this.initDashboard();
        break;
      case 'calculator':
        if (window.carbonCalc) window.carbonCalc.initCalculator();
        break;
      case 'logger':
        if (window.ecoLogger) window.ecoLogger.initLogger();
        break;
      case 'challenges':
        if (window.challengesEngine) window.challengesEngine.initChallenges();
        break;
      case 'insights':
        if (window.insightsEngine) window.insightsEngine.initInsights();
        break;
    }
    
    // Smooth scroll to top of view
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update Lucide Icons in case new elements rendered
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  updateUserUI() {
    // Update display name
    const displays = ['dashboard-user-name', 'user-name-display'];
    displays.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = this.state.userName;
    });

    // Update level display
    const xp = this.state.ecoPoints;
    const level = Math.floor(xp / 100) + 1;
    this.state.level = level;

    const levelText = document.getElementById('user-level-display');
    if (levelText) {
      let title = "Novice";
      if (level >= 5) title = "Defender";
      if (level >= 10) title = "Champion";
      if (level >= 20) title = "Eco Sage";
      levelText.textContent = `Level ${level} ${title}`;
    }

    const avatar = document.getElementById('user-avatar');
    if (avatar && this.state.userName) {
      avatar.textContent = this.state.userName.charAt(0).toUpperCase();
    }

    // Warning banner for calculator
    const banner = document.getElementById('calc-warning-banner');
    if (banner) {
      if (this.state.hasCalculated) {
        banner.style.display = 'none';
      } else {
        banner.style.display = 'flex';
      }
    }
  }

  initDashboard() {
    this.updateUserUI();

    // 1. Footprint metric
    const annualVal = document.getElementById('metric-annual-co2');
    if (annualVal) {
      const tonnes = (this.state.calculatorFootprint / 1000).toFixed(1);
      annualVal.textContent = tonnes;
    }

    // 2. Average comparison subtext
    const compareSub = document.getElementById('metric-vs-average');
    if (compareSub) {
      const nationalAverage = 16000; // 16 tonnes per year average in US/developed
      const diff = ((nationalAverage - this.state.calculatorFootprint) / nationalAverage * 100).toFixed(0);
      if (this.state.calculatorFootprint === 0) {
        compareSub.textContent = "Take the footprint calc to see comparison";
        compareSub.className = "trend-down";
      } else if (diff >= 0) {
        compareSub.textContent = `${diff}% below developed average (16t)`;
        compareSub.className = "trend-down";
      } else {
        compareSub.textContent = `${Math.abs(diff)}% above developed average (16t)`;
        compareSub.className = "trend-up";
      }
    }

    // 3. Monthly Saved
    const monthlySaved = document.getElementById('metric-monthly-saved');
    if (monthlySaved) {
      // Calculate saved co2 from all logs in the current month
      const totalSaved = this.state.logs
        .filter(l => l.impactValue > 0)
        .reduce((sum, current) => sum + current.impactValue, 0);
      
      monthlySaved.textContent = totalSaved.toFixed(1);
    }

    // 4. Eco Points
    const pts = document.getElementById('metric-eco-points');
    if (pts) {
      pts.textContent = this.state.ecoPoints;
    }

    const nextLevelSub = document.getElementById('metric-points-level');
    if (nextLevelSub) {
      const levelXp = this.state.ecoPoints % 100;
      const remaining = 100 - levelXp;
      nextLevelSub.textContent = `Next level: ${remaining} XP remaining`;
    }

    // 5. Render charts
    if (window.insightsEngine) {
      window.insightsEngine.renderDonutChart();
      window.insightsEngine.renderHistoryChart();
    }

    // 6. Recent activities
    this.renderRecentLogs();
  }

  renderRecentLogs() {
    const listWrapper = document.getElementById('dashboard-recent-logs');
    if (!listWrapper) return;

    if (this.state.logs.length === 0) {
      listWrapper.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 0;">
          <i data-lucide="info" style="font-size: 1.8rem;"></i>
          <h3>No Daily Logs Yet</h3>
          <p style="font-size: 0.8rem;">Activities you log will show up here to highlight your progress.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Sort by timestamp descending and take top 3
    const sorted = [...this.state.logs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);

    let html = '<div style="display: flex; flex-direction: column; gap: 0.25rem;">';
    
    sorted.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const isSaving = log.impactValue >= 0;
      const impactClass = isSaving ? 'log-co2-saved' : 'log-co2-added';
      const prefix = isSaving ? '-' : '+';
      const word = isSaving ? 'saved' : 'emitted';
      
      let catColor = 'var(--accent-blue)';
      let catIcon = 'car';
      if (log.category === 'diet') { catColor = 'var(--accent-emerald)'; catIcon = 'salad'; }
      if (log.category === 'energy') { catColor = 'var(--accent-amber)'; catIcon = 'plug-zap'; }
      if (log.category === 'waste') { catColor = 'var(--accent-purple)'; catIcon = 'trash-2'; }
      
      html += `
        <div class="log-item">
          <div class="log-item-details">
            <div class="log-item-icon" style="background: rgba(255,255,255,0.03); color: ${catColor};">
              <i data-lucide="${catIcon}" style="width: 14px; height: 14px;"></i>
            </div>
            <div>
              <div class="log-item-title">${escapeHtml(log.title)}</div>
              <div class="log-item-date">${date} &bull; ${log.category.charAt(0).toUpperCase() + log.category.slice(1)}</div>
            </div>
          </div>
          <div class="log-item-value">
            <span class="${impactClass}">${prefix}${Math.abs(log.impactValue).toFixed(1)} kg</span>
            <div style="font-size: 0.65rem; color: var(--color-text-muted);">${word}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    listWrapper.innerHTML = html;

    if (window.lucide) window.lucide.createIcons();
  }

  addEcoPoints(amount) {
    this.state.ecoPoints += amount;
    this.saveState();
  }
}

// Class definition complete. Instantiation deferred to index.html DOMContentLoaded.
