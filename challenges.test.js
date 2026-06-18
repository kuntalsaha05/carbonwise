// Unit tests for ChallengesEngine
const assert = require('assert');
const test = require('node:test');
const ChallengesEngine = require('./challenges.js');

test('ChallengesEngine - Progress Checks', (t) => {
  const engine = new ChallengesEngine();
  const chalList = engine.challenges;

  // Find individual challenges
  const chalMeatless = chalList.find(c => c.id === 'chal_meatless');
  const chalPower = chalList.find(c => c.id === 'chal_power');
  const chalCommuter = chalList.find(c => c.id === 'chal_commuter');
  const chalEcoChef = chalList.find(c => c.id === 'chal_eco_chef');
  const chalWasteHero = chalList.find(c => c.id === 'chal_waste_hero');

  // Test log logs data
  const logs = [
    { category: 'diet', title: 'Vegan Meals All Day', timestamp: Date.now() },
    { category: 'diet', title: 'Vegetarian Meals', timestamp: Date.now() },
    { category: 'energy', title: 'Power Savings (Unplugged)', timestamp: Date.now() },
    { category: 'transport', title: 'Took Public Transit', timestamp: Date.now() },
    { category: 'transport', title: 'Active Commute (Bike/Walk)', timestamp: Date.now() },
    { category: 'waste', title: 'Recycled All Waste', timestamp: Date.now() },
    { category: 'diet', title: 'Steak Dinner (Not Eco)', timestamp: Date.now() }
  ];

  // 1. Meatless Day quest: vegan and vegetarian diet items within 24h
  assert.strictEqual(chalMeatless.checkProgress(logs), 2);

  // 2. Standby Power Down: unplug items within 24h
  assert.strictEqual(chalPower.checkProgress(logs), 1);

  // 3. Clean Commuter: transit & active travel within 7d
  assert.strictEqual(chalCommuter.checkProgress(logs), 2);

  // 4. Eco-Friendly Chef: strictly vegan meals within 7d
  assert.strictEqual(chalEcoChef.checkProgress(logs), 1);

  // 5. Circular Waste Hero: recycling sorted waste within 7d
  assert.strictEqual(chalWasteHero.checkProgress(logs), 1);
});

test('ChallengesEngine - Expired Logs Out of Filter Window', (t) => {
  const engine = new ChallengesEngine();
  const chalMeatless = engine.challenges.find(c => c.id === 'chal_meatless');
  const chalCommuter = engine.challenges.find(c => c.id === 'chal_commuter');

  const oldLogs = [
    // 2 days old (outside 24h, but inside 7d)
    { category: 'diet', title: 'Vegan Meals All Day', timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000) },
    // 8 days old (outside both 24h and 7d)
    { category: 'transport', title: 'Took Public Transit', timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000) }
  ];

  // Should be 0 since it is older than 24h
  assert.strictEqual(chalMeatless.checkProgress(oldLogs), 0);

  // Should be 0 since it is older than 7 days
  assert.strictEqual(chalCommuter.checkProgress(oldLogs), 0);
});
