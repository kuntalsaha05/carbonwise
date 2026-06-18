// Unit tests for CarbonMath

const assert = require('assert');
const test = require('node:test');
const CarbonMath = require('./carbon-math.js');

test('CarbonMath - Transport Calculations', (t) => {
  // Gas Car: 100 miles/week * 52 weeks * 0.411 = 2137.2 -> 2137 kg CO2
  assert.strictEqual(CarbonMath.calculateTransport('gas-car', 100), 2137);

  // Electric Car: 100 miles/week * 52 weeks * 0.150 = 780 kg CO2
  assert.strictEqual(CarbonMath.calculateTransport('electric-car', 100), 780);

  // Public Transit: 100 miles/week * 52 weeks * 0.120 = 624 kg CO2
  assert.strictEqual(CarbonMath.calculateTransport('public', 100), 624);

  // Active (Walk/Bike): 0 kg CO2
  assert.strictEqual(CarbonMath.calculateTransport('active', 150), 0);
});

test('CarbonMath - Diet Calculations', (t) => {
  assert.strictEqual(CarbonMath.calculateDiet('heavy-meat'), 3000);
  assert.strictEqual(CarbonMath.calculateDiet('average'), 2000);
  assert.strictEqual(CarbonMath.calculateDiet('vegetarian'), 1400);
  assert.strictEqual(CarbonMath.calculateDiet('vegan'), 900);
});

test('CarbonMath - Utility Energy Calculations', (t) => {
  // $100/month * 12 months * 1.5 intensity / 2 occupants = 900 kg CO2
  assert.strictEqual(CarbonMath.calculateEnergy(100, 2), 900);

  // $150/month * 12 months * 1.5 intensity / 1 occupant = 2700 kg CO2
  assert.strictEqual(CarbonMath.calculateEnergy(150, 1), 2700);
});

test('CarbonMath - Waste & Recycling Calculations', (t) => {
  // Low waste (200) + Always recycle (-200) = 0 kg CO2
  assert.strictEqual(CarbonMath.calculateWaste('always', 'low'), 0);

  // High waste (700) + Never recycle (0) = 700 kg CO2
  assert.strictEqual(CarbonMath.calculateWaste('never', 'high'), 700);

  // Average waste (400) + Sometimes recycle (-50) = 350 kg CO2
  assert.strictEqual(CarbonMath.calculateWaste('sometimes', 'average'), 350);
});
