// CarbonWise Quests and Challenges Engine

class ChallengesEngine {
  constructor() {
    this.challenges = [
      {
        id: 'chal_meatless',
        title: 'Meatless Day',
        desc: 'Log a vegan or vegetarian diet choice to reduce agricultural carbon emissions.',
        category: 'diet',
        type: 'daily',
        goalCount: 1,
        xpReward: 25,
        co2Bonus: 8.0, // kg CO2 saved
        checkProgress: (logs) => {
          const past24h = Date.now() - (24 * 60 * 60 * 1000);
          return logs.filter(l => 
            l.timestamp >= past24h && 
            l.category === 'diet' && 
            (l.title.includes('Vegan') || l.title.includes('Vegetarian'))
          ).length;
        }
      },
      {
        id: 'chal_power',
        title: 'Standby Power Down',
        desc: 'Log appliance standby unplugging to prevent phantom energy draw.',
        category: 'energy',
        type: 'daily',
        goalCount: 1,
        xpReward: 15,
        co2Bonus: 3.0,
        checkProgress: (logs) => {
          const past24h = Date.now() - (24 * 60 * 60 * 1000);
          return logs.filter(l => 
            l.timestamp >= past24h && 
            l.category === 'energy' && 
            l.title.toLowerCase().includes('unplug')
          ).length;
        }
      },
      {
        id: 'chal_commuter',
        title: 'Clean Commuter',
        desc: 'Avoid single-occupancy driving. Log 3 active travel or public transit trips in the last week.',
        category: 'transport',
        type: 'weekly',
        goalCount: 3,
        xpReward: 60,
        co2Bonus: 25.0,
        checkProgress: (logs) => {
          const past7d = Date.now() - (7 * 24 * 60 * 60 * 1000);
          return logs.filter(l => 
            l.timestamp >= past7d && 
            l.category === 'transport' && 
            (l.title.includes('Transit') || l.title.includes('Active'))
          ).length;
        }
      },
      {
        id: 'chal_eco_chef',
        title: 'Eco-Friendly Chef',
        desc: 'Cook 4 strictly vegan meals this week to maximize dietary carbon offsets.',
        category: 'diet',
        type: 'weekly',
        goalCount: 4,
        xpReward: 80,
        co2Bonus: 35.0,
        checkProgress: (logs) => {
          const past7d = Date.now() - (7 * 24 * 60 * 60 * 1000);
          return logs.filter(l => 
            l.timestamp >= past7d && 
            l.category === 'diet' && 
            l.title.includes('Vegan')
          ).length;
        }
      },
      {
        id: 'chal_waste_hero',
        title: 'Circular Waste Hero',
        desc: 'Log sorting and recycling household waste 3 times in a week.',
        category: 'waste',
        type: 'weekly',
        goalCount: 3,
        xpReward: 40,
        co2Bonus: 10.0,
        checkProgress: (logs) => {
          const past7d = Date.now() - (7 * 24 * 60 * 60 * 1000);
          return logs.filter(l => 
            l.timestamp >= past7d && 
            l.category === 'waste' && 
            l.title.includes('Recycled')
          ).length;
        }
      }
    ];

    this.activeTab = 'active'; // 'active' or 'completed'
    if (typeof document !== 'undefined') {
      this.bindEvents();
    }
  }

  bindEvents() {
    const tabActive = document.getElementById('btn-tab-active-challenges');
    const tabCompleted = document.getElementById('btn-tab-completed-challenges');

    if (tabActive && tabCompleted) {
      tabActive.addEventListener('click', () => {
        tabActive.classList.add('active');
        tabCompleted.classList.remove('active');
        this.activeTab = 'active';
        this.renderChallenges();
      });

      tabCompleted.addEventListener('click', () => {
        tabCompleted.classList.add('active');
        tabActive.classList.remove('active');
        this.activeTab = 'completed';
        this.renderChallenges();
      });
    }
  }

  initChallenges() {
    this.renderChallenges();
  }

  renderChallenges() {
    const container = document.getElementById('challenges-display-grid');
    if (!container) return;

    const state = window.carbonWiseApp.state;
    const completedIds = state.completedChallenges;

    // Filter challenges based on active tab
    const displayList = this.challenges.filter(chal => {
      const isCompleted = completedIds.includes(chal.id);
      return this.activeTab === 'active' ? !isCompleted : isCompleted;
    });

    if (displayList.length === 0) {
      const msg = this.activeTab === 'active' 
        ? "Excellent job! You have completed all active challenges. Check back tomorrow!" 
        : "No completed challenges yet. Start logging actions to complete them!";
      
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i data-lucide="trophy"></i>
          <h3>${this.activeTab === 'active' ? 'All Caught Up!' : 'No Achievements Yet'}</h3>
          <p>${msg}</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let html = '';

    displayList.forEach(chal => {
      const progress = chal.checkProgress(state.logs);
      const isClaimable = progress >= chal.goalCount && this.activeTab === 'active';
      const pct = Math.min(100, Math.round((progress / chal.goalCount) * 100));
      
      let badgeClass = chal.type === 'daily' ? 'daily' : 'weekly';
      
      html += `
        <div class="glass-card challenge-card">
          <div>
            <span class="challenge-badge ${badgeClass}">${chal.type} quest</span>
            <h3 class="challenge-title">${chal.title}</h3>
            <p class="challenge-desc">${chal.desc}</p>
          </div>
          
          <div>
            <!-- Progress Bar (Only show in Active Tab) -->
            ${this.activeTab === 'active' ? `
              <div style="margin: 0.75rem 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 0.25rem;">
                  <span>Progress: ${progress} / ${chal.goalCount}</span>
                  <span>${pct}%</span>
                </div>
                <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--accent-emerald), var(--accent-blue)); border-radius: 3px;"></div>
                </div>
              </div>
            ` : `
              <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-emerald); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">
                <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i> Completed
              </div>
            `}
            
            <div class="challenge-footer">
              <div class="reward-info">
                <span>Reward</span>
                <span class="reward-pts">+${chal.xpReward} XP</span>
              </div>
              
              ${this.activeTab === 'active' ? `
                <button class="btn ${isClaimable ? 'btn-primary' : 'btn-secondary'}" 
                        ${isClaimable ? '' : 'disabled'} 
                        data-id="${chal.id}">
                  ${isClaimable ? 'Claim XP & CO2' : 'In Progress'}
                </button>
              ` : `
                <div style="text-align: right; font-size: 0.75rem; color: var(--color-text-muted);">
                  <span>Saved</span>
                  <div style="color: var(--accent-emerald); font-weight: 700; font-size: 0.9rem;">-${chal.co2Bonus} kg CO2</div>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Bind claim buttons
    if (this.activeTab === 'active') {
      const claimButtons = container.querySelectorAll('button[data-id]');
      claimButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.claimReward(id);
        });
      });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  claimReward(id) {
    const chal = this.challenges.find(c => c.id === id);
    if (!chal) return;

    const app = window.carbonWiseApp;
    
    // Add to completed challenges list
    app.state.completedChallenges.push(id);
    
    // Log special challenge completion log
    const entry = {
      id: 'chal_log_' + Date.now(),
      title: `Quest: ${chal.title}`,
      category: chal.category,
      impactValue: chal.co2Bonus,
      points: chal.xpReward,
      timestamp: Date.now()
    };
    
    app.state.logs.push(entry);
    app.state.ecoPoints += chal.xpReward;
    app.saveState();
    
    Toast.show(`Congratulations! You completed the quest "${chal.title}". You earned +${chal.xpReward} XP and saved -${chal.co2Bonus}kg CO2!`, 'success');
    
    this.renderChallenges();
  }

  // Triggered when a log occurs, checking for state updates to trigger badge popups or alerts
  checkDailyLogChallenges(category) {
    const state = window.carbonWiseApp.state;
    let completedAny = false;

    this.challenges.forEach(chal => {
      // If not completed already
      if (!state.completedChallenges.includes(chal.id)) {
        const progress = chal.checkProgress(state.logs);
        if (progress >= chal.goalCount) {
          completedAny = true;
        }
      }
    });

    if (completedAny) {
      // If we are currently on the logger tab, maybe alert them to claim rewards
      console.log("A challenge is now claimable!");
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChallengesEngine;
} else {
  // Instantiate and attach to window
  window.challengesEngine = new ChallengesEngine();
}
