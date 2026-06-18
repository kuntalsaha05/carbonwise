// CarbonWise Google Gemini AI Eco Advisor Interface

class GeminiAdvisor {
  constructor() {
    this.chatOpen = false;
    this.messages = [];
    this.apiKey = localStorage.getItem('carbonwise_gemini_key') || '';
    
    this.bindEvents();
  }

  bindEvents() {
    // We'll write bindings for DOM elements that we will inject in index.html
    document.addEventListener('click', (e) => {
      // Toggle Chat panel
      if (e.target.closest('#btn-toggle-gemini-chat') || e.target.closest('#gemini-chat-close')) {
        this.toggleChat();
      }

      // Save Key Button
      if (e.target.id === 'btn-save-gemini-key') {
        const input = document.getElementById('gemini-key-input');
        if (input) {
          this.saveApiKey(input.value.trim());
        }
      }

      // Delete Key Button
      if (e.target.id === 'btn-delete-gemini-key') {
        this.deleteApiKey();
      }
    });

    // Chat submit
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'gemini-chat-form') {
        e.preventDefault();
        this.handleMessageSubmit();
      }
    });
  }

  saveApiKey(key) {
    if (!key) {
      Toast.show("Please enter a valid API key.", "warning");
      return;
    }
    this.apiKey = key;
    localStorage.setItem('carbonwise_gemini_key', key);
    Toast.show("Gemini API Key saved securely in your browser's local storage.", "success");
    this.renderChatWindow();
  }

  deleteApiKey() {
    if (confirm("Are you sure you want to remove your API Key from local storage?")) {
      this.apiKey = '';
      localStorage.removeItem('carbonwise_gemini_key');
      Toast.show("API Key removed.", "info");
      this.renderChatWindow();
    }
  }

  toggleChat() {
    const chatContainer = document.getElementById('gemini-chat-container');
    if (!chatContainer) return;
    
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen) {
      chatContainer.classList.add('active');
      this.renderChatWindow();
      // If messages list is empty, push initial greeting
      if (this.messages.length === 0) {
        this.addSystemMessage("Hello! I am your Gemini Eco Advisor. Ask me anything about reducing your carbon footprint, green options, or local initiatives!");
      }
    } else {
      chatContainer.classList.remove('active');
    }
  }

  addSystemMessage(text) {
    this.messages.push({ sender: 'model', text: text, timestamp: Date.now() });
    this.renderMessages();
  }

  addUserMessage(text) {
    this.messages.push({ sender: 'user', text: text, timestamp: Date.now() });
    this.renderMessages();
    this.queryGeminiAPI(text);
  }

  renderChatWindow() {
    const container = document.getElementById('gemini-chat-container');
    if (!container) return;

    if (!this.apiKey) {
      container.innerHTML = `
        <div class="gemini-chat-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="sparkles" style="color: var(--accent-blue);"></i>
            <span style="font-weight:600;">Gemini Eco Advisor</span>
          </div>
          <button id="gemini-chat-close" class="close-modal-btn" style="font-size: 1.25rem;">&times;</button>
        </div>
        <div class="gemini-chat-body" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; text-align: center; gap: 1rem;">
          <i data-lucide="shield-check" style="font-size: 2.5rem; color: var(--accent-emerald); margin: 0 auto;"></i>
          <h3 style="font-size: 1.1rem; font-weight:600;">Secure API Setup</h3>
          <p style="font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.4;">
            To enable real-time carbon advice, enter your personal Google Gemini API Key. Your key is stored strictly inside your browser and is never uploaded anywhere.
          </p>
          <div class="form-group" style="text-align: left;">
            <label for="gemini-key-input" style="font-size: 0.75rem;">Gemini API Key</label>
            <input type="password" id="gemini-key-input" class="form-input" placeholder="AIzaSy..." style="width: 100%; font-size: 0.85rem;">
          </div>
          <button id="btn-save-gemini-key" class="btn btn-primary" style="justify-content: center;">Enable Advisor</button>
          <a href="https://aistudio.google.com/" target="_blank" style="font-size: 0.75rem; color: var(--accent-blue); text-decoration: none;">Get a free API Key from Google AI Studio &rarr;</a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="gemini-chat-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i data-lucide="sparkles" style="color: var(--accent-blue); animation: pulse 2s infinite;"></i>
            <span style="font-weight:600;">Gemini Eco Advisor</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button id="btn-delete-gemini-key" title="Remove API Key" style="background:none; border:none; color: var(--color-text-muted); cursor:pointer; transition: var(--transition-smooth);"><i data-lucide="key-round" style="width:14px; height:14px;"></i></button>
            <button id="gemini-chat-close" class="close-modal-btn" style="font-size: 1.25rem;">&times;</button>
          </div>
        </div>
        <div class="gemini-chat-body" id="gemini-messages-list">
          <!-- Messages will render here -->
        </div>
        <form id="gemini-chat-form" class="gemini-chat-footer">
          <input type="text" id="gemini-chat-input" placeholder="Ask Gemini..." required autocomplete="off">
          <button type="submit" class="gemini-send-btn"><i data-lucide="send" style="width: 16px; height: 16px;"></i></button>
        </form>
      `;
      this.renderMessages();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  formatMessageText(text) {
    if (typeof text !== 'string') return text;
    let escaped = window.escapeHtml ? window.escapeHtml(text) : text;
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  renderMessages() {
    const list = document.getElementById('gemini-messages-list');
    if (!list) return;

    let html = '';
    this.messages.forEach(msg => {
      const isUser = msg.sender === 'user';
      const bubbleClass = isUser ? 'gemini-bubble user' : 'gemini-bubble model';
      html += `
        <div class="gemini-message-row ${isUser ? 'user-row' : 'model-row'}">
          <div class="${bubbleClass}">
            ${this.formatMessageText(msg.text)}
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
    
    // Auto-scroll to bottom of chat
    list.scrollTop = list.scrollHeight;
    
    if (window.lucide) window.lucide.createIcons();
  }

  handleMessageSubmit() {
    const input = document.getElementById('gemini-chat-input');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.addUserMessage(text);
  }

  // Pre-prompts Gemini with local carbon calculator profile data to make it extremely contextual
  buildContextPrompt(userQuery) {
    const state = window.carbonWiseApp.state;
    const isCalc = state.hasCalculated;
    
    let profileContext = '';
    if (isCalc) {
      profileContext = `
The user has calculated their carbon footprint profile on our app CarbonWise. Here is their profile data:
- Estimated Annual Carbon Footprint: ${(state.calculatorFootprint / 1000).toFixed(1)} metric tonnes of CO2e.
- Breakdown: 
  - Transportation: ${state.breakdown.transport} kg CO2e/yr (Commutes primarily via: ${state.calculatorAnswers.transportType}, distance: ${state.calculatorAnswers.transportDistance} miles/week).
  - Diet: ${state.breakdown.diet} kg CO2e/yr (Diet type: ${state.calculatorAnswers.dietType}).
  - Household Energy: ${state.breakdown.energy} kg CO2e/yr (Average electricity bill: $${state.calculatorAnswers.energyBill}/month, shared among ${state.calculatorAnswers.houseSize} occupants).
  - Waste & Shopping: ${state.breakdown.waste} kg CO2e/yr (Recycling frequency: ${state.calculatorAnswers.recycleHabit}, food waste size: ${state.calculatorAnswers.wasteVolume}).
`;
    } else {
      profileContext = `The user has not completed their carbon calculator profile yet. Encourage them to do so to get custom calculations.`;
    }

    return `
You are the "Gemini Eco Advisor" for CarbonWise, a modern carbon footprint reduction web dashboard.
Your goal is to provide concise, friendly, and actionable advice on green living, energy saving, eco-friendly transit, and recycling.
Always keep responses relatively short (under 120 words) and directly relevant to the user's questions.

${profileContext}

User Query: "${userQuery}"
Please respond as the CarbonWise Eco Advisor:
`;
  }

  async queryGeminiAPI(queryText) {
    // Add temporary loading indicator
    const list = document.getElementById('gemini-messages-list');
    if (list) {
      const loader = document.createElement('div');
      loader.id = 'gemini-loading-indicator';
      loader.className = 'gemini-message-row model-row';
      loader.innerHTML = `
        <div class="gemini-bubble model typing">
          <span></span><span></span><span></span>
        </div>
      `;
      list.appendChild(loader);
      list.scrollTop = list.scrollHeight;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{
        parts: [{
          text: this.buildContextPrompt(queryText)
        }]
      }]
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Remove loading indicator
      const loaderEl = document.getElementById('gemini-loading-indicator');
      if (loaderEl) loaderEl.remove();

      if (!response.ok) {
        const errData = await response.json();
        const errMsg = errData.error?.message || 'Failed connection to Google API.';
        this.addSystemMessage(`API Error: ${errMsg}. Please verify your key or check connectivity.`);
        return;
      }

      const data = await response.json();
      const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned from Gemini.';
      
      // Award 5 XP for consulting the AI (daily limit 15 XP)
      window.carbonWiseApp.addEcoPoints(5);

      this.addSystemMessage(answerText);
    } catch (e) {
      console.error(e);
      const loaderEl = document.getElementById('gemini-loading-indicator');
      if (loaderEl) loaderEl.remove();
      this.addSystemMessage("Error querying Gemini API. Check your internet connection and API key.");
    }
  }
}

// Instantiate and attach to window
window.geminiAdvisor = new GeminiAdvisor();
