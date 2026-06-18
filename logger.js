// CarbonWise Daily Actions Logger

class EcoLogger {
  constructor() {
    this.templates = {
      'transit-public': { title: "Took Public Transit", category: "transport", impactValue: 5.2, points: 15 },
      'transit-active': { title: "Active Commute (Bike/Walk)", category: "transport", impactValue: 8.5, points: 20 },
      'diet-vegan': { title: "Vegan Meals All Day", category: "diet", impactValue: 6.0, points: 20 },
      'diet-veggie': { title: "Vegetarian Meals", category: "diet", impactValue: 3.5, points: 15 },
      'energy-unplug': { title: "Power Savings (Unplugged)", category: "energy", impactValue: 1.5, points: 10 },
      'waste-recycle': { title: "Recycled All Waste", category: "waste", impactValue: 2.0, points: 10 }
    };

    if (typeof document !== 'undefined') {
      this.bindEvents();
    }
  }

  bindEvents() {
    // Quick Log cards click
    const cards = document.querySelectorAll('.log-btn-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const templateKey = card.getAttribute('data-value') || card.getAttribute('data-action');
        this.logQuickTemplate(templateKey);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });

    // Custom Log Form Submit
    const form = document.getElementById('custom-log-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCustomSubmit();
      });
    }

    // Custom Log modal trigger within Logger View
    const customModalBtn = document.getElementById('btn-custom-log-modal');
    const modal = document.getElementById('custom-log-modal');
    if (customModalBtn && modal) {
      customModalBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }

    // Filter selector change
    const filterSelect = document.getElementById('log-filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        this.renderLogs();
      });
    }
  }

  initLogger() {
    this.renderLogs();
  }

  logQuickTemplate(key) {
    const template = this.templates[key];
    if (!template) return;

    this.addLogEntry(template.title, template.category, template.impactValue, template.points);
    Toast.show(`Success! Logged: "${template.title}" (+${template.points} XP)`, 'success');
  }

  handleCustomSubmit() {
    const categorySelect = document.getElementById('log-category-select');
    const titleInput = document.getElementById('log-title-input');
    const impactSelect = document.getElementById('log-impact-select');
    const modal = document.getElementById('custom-log-modal');

    if (!categorySelect || !titleInput || !impactSelect) return;

    const category = categorySelect.value;
    const title = titleInput.value.trim();
    const impact = impactSelect.value;

    let impactValue = 0;
    let points = 0;

    switch (impact) {
      case 'small':
        impactValue = 1.5;
        points = 10;
        break;
      case 'medium':
        impactValue = 4.0;
        points = 20;
        break;
      case 'large':
        impactValue = 10.0;
        points = 35;
        break;
      case 'unfavorable':
        impactValue = -5.0; // Negative indicates co2 added
        points = 5;
        break;
    }

    this.addLogEntry(title, category, impactValue, points);
    
    // Clear & Close form
    titleInput.value = '';
    impactSelect.selectedIndex = 1; // reset to medium
    if (modal) modal.classList.remove('active');
  }

  addLogEntry(title, category, impactValue, points) {
    const app = window.carbonWiseApp;
    
    const entry = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      title: title,
      category: category,
      impactValue: impactValue,
      points: points,
      timestamp: Date.now()
    };

    app.state.logs.push(entry);
    app.state.ecoPoints += points;
    app.saveState();

    // Re-render UI
    this.renderLogs();
    
    // If we've completed any logs related challenges, update them
    if (window.challengesEngine) {
      window.challengesEngine.checkDailyLogChallenges(category);
    }
  }

  deleteLogEntry(id) {
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    
    const app = window.carbonWiseApp;
    const index = app.state.logs.findIndex(l => l.id === id);
    
    if (index !== -1) {
      const log = app.state.logs[index];
      // Deduct points
      app.state.ecoPoints = Math.max(0, app.state.ecoPoints - log.points);
      app.state.logs.splice(index, 1);
      app.saveState();
      this.renderLogs();
    }
  }

  renderLogs() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('activity-logs-container');
    const filterSelect = document.getElementById('log-filter-select');
    if (!container) return;

    const logs = window.carbonWiseApp.state.logs;
    const filter = filterSelect ? filterSelect.value : 'all';

    // Filter logs
    const filteredLogs = logs.filter(log => {
      if (filter === 'all') return true;
      return log.category === filter;
    });

    if (filteredLogs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i data-lucide="folder-open"></i>
          <h3>No Logged Actions</h3>
          <p>Select a quick log card or add a custom action above to start building your eco logbook.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Sort logs descending by timestamp
    const sortedLogs = [...filteredLogs].sort((a, b) => b.timestamp - a.timestamp);

    let html = '<div style="display: flex; flex-direction: column;">';
    
    sortedLogs.forEach(log => {
      const dateStr = new Date(log.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const isSaving = log.impactValue >= 0;
      const impactClass = isSaving ? 'log-co2-saved' : 'log-co2-added';
      const prefix = isSaving ? '-' : '+';
      
      let catColor = 'var(--accent-blue)';
      let catIcon = 'car';
      if (log.category === 'diet') { catColor = 'var(--accent-emerald)'; catIcon = 'salad'; }
      if (log.category === 'energy') { catColor = 'var(--accent-amber)'; catIcon = 'plug-zap'; }
      if (log.category === 'waste') { catColor = 'var(--accent-purple)'; catIcon = 'trash-2'; }

      html += `
        <div class="log-item">
          <div class="log-item-details">
            <div class="log-item-icon" style="background: rgba(255,255,255,0.03); color: ${catColor};">
              <i data-lucide="${catIcon}" style="width: 16px; height: 16px;"></i>
            </div>
            <div>
              <div class="log-item-title">${escapeHtml(log.title)}</div>
              <div class="log-item-date">${dateStr} &bull; <span style="color: ${catColor}; font-weight: 500;">+${log.points} XP</span></div>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="log-item-value">
              <div class="${impactClass}" style="font-size: 0.95rem;">${prefix}${Math.abs(log.impactValue).toFixed(1)} kg</div>
              <div style="font-size: 0.65rem; color: var(--color-text-muted);">${isSaving ? 'CO2 saved' : 'CO2 added'}</div>
            </div>
            <button class="delete-log-btn" data-id="${log.id}">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Attach delete handlers
    const deleteBtns = container.querySelectorAll('.delete-log-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const logId = btn.getAttribute('data-id');
        this.deleteLogEntry(logId);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EcoLogger;
} else {
  // Instantiate and attach to window
  window.ecoLogger = new EcoLogger();
}
