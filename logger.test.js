// Unit tests for EcoLogger
const assert = require('assert');
const test = require('node:test');
const EcoLogger = require('./logger.js');

// Mock window and carbonWiseApp
global.window = {
  carbonWiseApp: {
    state: {
      logs: [],
      ecoPoints: 0
    },
    saveState() {}
  }
};
global.escapeHtml = (x) => x;

test('EcoLogger - addLogEntry', (t) => {
  const logger = new EcoLogger();
  logger.addLogEntry("Vegan Lunch", "diet", 4.0, 15);
  
  const logs = global.window.carbonWiseApp.state.logs;
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].title, "Vegan Lunch");
  assert.strictEqual(logs[0].category, "diet");
  assert.strictEqual(logs[0].impactValue, 4.0);
  assert.strictEqual(logs[0].points, 15);
  assert.strictEqual(global.window.carbonWiseApp.state.ecoPoints, 15);
});

test('EcoLogger - deleteLogEntry', (t) => {
  const logger = new EcoLogger();
  // Clear logs first and add a test log
  global.window.carbonWiseApp.state.logs = [
    { id: 'test_1', title: 'Test Log', category: 'energy', impactValue: 1.5, points: 10, timestamp: Date.now() }
  ];
  global.window.carbonWiseApp.state.ecoPoints = 10;

  // Mock global confirm to return true
  global.confirm = () => true;

  logger.deleteLogEntry('test_1');
  assert.strictEqual(global.window.carbonWiseApp.state.logs.length, 0);
  assert.strictEqual(global.window.carbonWiseApp.state.ecoPoints, 0);
});
