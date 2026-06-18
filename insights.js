// CarbonWise Insights & Charts Generation Engine

class InsightsEngine {
  constructor() {}

  initInsights() {
    this.renderInsightsCards();
  }

  // Generate and render the Donut Chart on the Dashboard
  renderDonutChart() {
    const container = document.getElementById('category-donut-container');
    const legendContainer = document.getElementById('category-legend');
    if (!container || !legendContainer) return;

    const state = window.carbonWiseApp.state;
    const total = state.calculatorFootprint;

    if (!state.hasCalculated || total === 0) {
      container.innerHTML = `
        <svg viewBox="0 0 100 100" class="circular-chart">
          <circle cx="50" cy="50" r="40" class="circle-bg" stroke-width="4"></circle>
          <text x="50" y="47" class="gauge-percentage" style="font-size: 0.35rem;">No Data</text>
          <text x="50" y="58" class="gauge-label" style="font-size: 0.12rem;">Run Calculator</text>
        </svg>
      `;
      legendContainer.innerHTML = '';
      return;
    }

    const categories = [
      { key: 'transport', label: 'Transport', value: state.breakdown.transport, colorClass: 'blue', colorHex: 'var(--accent-blue)' },
      { key: 'diet', label: 'Diet', value: state.breakdown.diet, colorClass: 'emerald', colorHex: 'var(--accent-emerald)' },
      { key: 'energy', label: 'Household', value: state.breakdown.energy, colorClass: 'amber', colorHex: 'var(--accent-amber)' },
      { key: 'waste', label: 'Waste & Shopping', value: state.breakdown.waste, colorClass: 'purple', colorHex: 'var(--accent-purple)' }
    ];

    // Filter out zero-values to avoid divide by zero or tiny invisible slices
    const activeCategories = categories.filter(c => c.value > 0);

    let accumulatedPercent = 0;
    let circlesHtml = '';
    
    // Circumference of r=40 is 2 * PI * 40 = 251.327
    const circumference = 251.327;

    activeCategories.forEach(cat => {
      const percent = cat.value / total;
      const dashLength = percent * circumference;
      const dashOffset = -accumulatedPercent * circumference;
      
      circlesHtml += `
        <circle cx="50" cy="50" r="40" 
                class="circle ${cat.colorClass}" 
                stroke-width="5"
                stroke-dasharray="${dashLength} ${circumference}" 
                stroke-dashoffset="${dashOffset}" />
      `;
      accumulatedPercent += percent;
    });

    const tonnes = (total / 1000).toFixed(1);

    container.innerHTML = `
      <svg viewBox="0 0 100 100" class="circular-chart">
        <circle cx="50" cy="50" r="40" class="circle-bg" stroke-width="5"></circle>
        <g transform="rotate(-90 50 50)">
          ${circlesHtml}
        </g>
        <text x="50" y="47" class="gauge-percentage">${tonnes}t</text>
        <text x="50" y="58" class="gauge-label">Annual CO2e</text>
      </svg>
    `;

    // Render legend items
    let legendHtml = '';
    categories.forEach(cat => {
      const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
      legendHtml += `
        <div class="legend-item">
          <div class="legend-color" style="background: ${cat.colorHex};"></div>
          <span>${cat.label} (${pct}%)</span>
        </div>
      `;
    });
    legendContainer.innerHTML = legendHtml;
  }

  // Generate and render the 7-day Carbon History Bar Chart
  renderHistoryChart() {
    const wrapper = document.getElementById('history-chart-wrapper');
    if (!wrapper) return;

    const state = window.carbonWiseApp.state;
    
    // Generate dates for last 7 days (including today)
    const dataDays = [];
    const baseDailyEmissions = state.hasCalculated ? (state.calculatorFootprint / 365) : 12.0; // 12kg default daily average if no profile

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0); // start of day
      
      // Calculate logged offsets for this day
      const nextDay = date.getTime() + (24 * 60 * 60 * 1000);
      const dayLogs = state.logs.filter(l => l.timestamp >= date.getTime() && l.timestamp < nextDay);
      
      let savedCo2 = 0;
      let addedCo2 = 0;
      dayLogs.forEach(l => {
        if (l.impactValue >= 0) {
          savedCo2 += l.impactValue;
        } else {
          addedCo2 += Math.abs(l.impactValue);
        }
      });

      const actualEmissions = Math.max(0, baseDailyEmissions - savedCo2 + addedCo2);
      
      dataDays.push({
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        value: actualEmissions,
        saved: savedCo2
      });
    }

    // Determine scale (max value to fit chart size)
    const maxVal = Math.max(15, ...dataDays.map(d => d.value + d.saved));
    const chartHeight = 160;
    const chartWidth = 460;
    
    let barsHtml = '';
    let gridLinesHtml = '';
    
    // Grid Lines (0%, 25%, 50%, 75%, 100%)
    const gridDivs = 4;
    for (let i = 0; i <= gridDivs; i++) {
      const y = 20 + (i / gridDivs) * (chartHeight - 40);
      const val = (maxVal * (1 - i / gridDivs)).toFixed(0);
      gridLinesHtml += `
        <line class="chart-grid-line" x1="40" y1="${y}" x2="${chartWidth}" y2="${y}" />
        <text class="chart-label axis-y" x="30" y="${y + 4}">${val} kg</text>
      `;
    }

    // Draw bars
    const barWidth = 32;
    const startX = 60;
    const stepX = 58;

    dataDays.forEach((day, i) => {
      const x = startX + i * stepX;
      
      // Scale height
      const hEmissions = (day.value / maxVal) * (chartHeight - 40);
      const hSaved = (day.saved / maxVal) * (chartHeight - 40);
      
      const yEmissions = chartHeight - 20 - hEmissions;
      const ySaved = yEmissions - hSaved;

      barsHtml += `
        <!-- Emissions Bar (Glow Blue / Purple gradient) -->
        <rect class="bar-rect" x="${x}" y="${yEmissions}" width="${barWidth}" height="${hEmissions}" 
              fill="url(#emissionsGradient)" rx="4" />
              
        <!-- Saved CO2 Offset Bar (Green stack on top) -->
        ${hSaved > 0 ? `
          <rect x="${x}" y="${ySaved}" width="${barWidth}" height="${hSaved}" 
                fill="url(#savedGradient)" rx="4" opacity="0.85" />
        ` : ''}

        <!-- X Label -->
        <text class="chart-label" x="${x + barWidth / 2}" y="${chartHeight}">${day.label}</text>
      `;
    });

    wrapper.innerHTML = `
      <svg class="bar-chart-svg" viewBox="0 0 ${chartWidth} ${chartHeight + 10}">
        <defs>
          <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-blue)" />
            <stop offset="100%" stop-color="var(--accent-purple)" stop-opacity="0.6" />
          </linearGradient>
          <linearGradient id="savedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent-emerald)" />
            <stop offset="100%" stop-color="#059669" stop-opacity="0.8" />
          </linearGradient>
        </defs>
        
        <!-- Grid Lines & Y labels -->
        ${gridLinesHtml}
        
        <!-- Y Axis Base Line -->
        <line class="chart-axis-line" x1="40" y1="20" x2="40" y2="${chartHeight - 20}" />
        <!-- X Axis Base Line -->
        <line class="chart-axis-line" x1="40" y1="${chartHeight - 20}" x2="${chartWidth}" y2="${chartHeight - 20}" />
        
        <!-- Bars & Labels -->
        ${barsHtml}
      </svg>
    `;
  }

  // Generate personalized insight advisory cards based on profile breakdown
  renderInsightsCards() {
    const container = document.getElementById('insights-cards-container');
    if (!container) return;

    const state = window.carbonWiseApp.state;

    if (!state.hasCalculated) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i data-lucide="calculator"></i>
          <h3>No Insights Yet</h3>
          <p>Please complete your carbon footprint profile calculator to unlock personalized insights and recommendations.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const breakdown = state.breakdown;
    
    // Sort categories by highest footprint
    const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
    const primaryCategory = sorted[0][0]; // highest emission category
    const secondaryCategory = sorted[1][0];

    const cardsPool = {
      transport: {
        title: 'Optimize Daily Transit',
        desc: `Your transportation footprint is your highest impact at <strong>${(breakdown.transport / 1000).toFixed(1)}t CO2e/yr</strong>. Public transit or cycling even 2 days a week will offset over <strong>400kg of CO2</strong> annually.`,
        icon: 'car',
        type: 'warning'
      },
      energy: {
        title: 'Optimize Household Energy',
        desc: `Household electricity represents <strong>${(breakdown.energy / 1000).toFixed(1)}t CO2e/yr</strong>. Setting thermostats to 20°C (68°F) in winter, switching to LED bulbs, and cold washing laundry can shave <strong>$150/yr</strong> off bills and save <strong>220kg CO2</strong>.`,
        icon: 'home',
        type: 'warning'
      },
      diet: {
        title: 'Green Up Your Diet',
        desc: `Agricultural production yields <strong>${(breakdown.diet / 1000).toFixed(1)}t CO2e/yr</strong> for you. Substituting beef or dairy with plant alternatives for 3 meals a week can cut food emissions by <strong>35%</strong>.`,
        icon: 'salad',
        type: 'warning'
      },
      waste: {
        title: 'Circular Waste Sorting',
        desc: `Waste and recycling habits account for <strong>${(breakdown.waste / 1000).toFixed(1)}t CO2e/yr</strong>. Composting food waste prevents landfill methane release, reducing household food-waste footprint by <strong>50%</strong>.`,
        icon: 'trash-2',
        type: 'warning'
      }
    };

    let html = '';

    // Render primary highest contributor card
    const primary = cardsPool[primaryCategory];
    html += `
      <div class="glass-card insight-card warning">
        <div class="insight-icon"><i data-lucide="${primary.icon}"></i></div>
        <div class="insight-details">
          <h3>Priority recommendation: ${primary.title}</h3>
          <p>${primary.desc}</p>
        </div>
      </div>
    `;

    // Render secondary contributor card
    const secondary = cardsPool[secondaryCategory];
    html += `
      <div class="glass-card insight-card warning">
        <div class="insight-icon"><i data-lucide="${secondary.icon}"></i></div>
        <div class="insight-details">
          <h3>Secondary target: ${secondary.title}</h3>
          <p>${secondary.desc}</p>
        </div>
      </div>
    `;

    // Render Paris agreement target alignment card
    const targetAlign = state.calculatorFootprint;
    const isAligned = targetAlign < 2000;
    const pctDiff = Math.abs(Math.round(((targetAlign - 2000) / 2000) * 100));

    html += `
      <div class="glass-card insight-card ${isAligned ? 'info' : 'warning'}" style="grid-column: 1 / -1;">
        <div class="insight-icon"><i data-lucide="globe"></i></div>
        <div class="insight-details">
          <h3>Paris Agreement Target Alignment (2.0t limit)</h3>
          <p>
            ${isAligned 
              ? `Outstanding work! Your carbon footprint is <strong>${(targetAlign / 1000).toFixed(1)}t CO2e</strong>, which fits below the Paris Agreement global climate safety threshold of 2 tonnes/year.` 
              : `Your carbon footprint is currently <strong>${(targetAlign / 1000).toFixed(1)}t CO2e</strong>. You need to reduce it by <strong>${pctDiff}%</strong> to meet the global personal quota of 2.0 tonnes/year.`}
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;

    if (window.lucide) window.lucide.createIcons();
  }
}

// Instantiate and attach to window
window.insightsEngine = new InsightsEngine();
