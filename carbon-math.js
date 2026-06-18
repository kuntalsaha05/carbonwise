// CarbonWise Footprint Calculation Formulas

class CarbonMath {
  static calculateTransport(type, distance) {
    const commuteMilesAnnual = distance * 52;
    if (type === 'gas-car') {
      return Math.round(commuteMilesAnnual * 0.411);
    } else if (type === 'electric-car') {
      return Math.round(commuteMilesAnnual * 0.150);
    } else if (type === 'public') {
      return Math.round(commuteMilesAnnual * 0.120);
    }
    return 0; // walk/bicycle
  }

  static calculateDiet(type) {
    if (type === 'heavy-meat') {
      return 3000;
    } else if (type === 'average') {
      return 2000;
    } else if (type === 'vegetarian') {
      return 1400;
    }
    return 900; // vegan
  }

  static calculateEnergy(bill, houseSize) {
    // Assumes US national grid average intensity ($1.5 kg CO2e / dollar)
    const annualEnergyTotal = bill * 12 * 1.5;
    const size = houseSize || 1;
    return Math.round(annualEnergyTotal / size);
  }

  static calculateWaste(recycleHabit, wasteVolume) {
    let recycleCredits = 0;
    if (recycleHabit === 'always') {
      recycleCredits = -200;
    } else if (recycleHabit === 'sometimes') {
      recycleCredits = -50;
    }

    let foodWasteEmissions = 400;
    if (wasteVolume === 'low') {
      foodWasteEmissions = 200;
    } else if (wasteVolume === 'high') {
      foodWasteEmissions = 700;
    }

    const net = Math.round(foodWasteEmissions + recycleCredits);
    return net < 0 ? 0 : net;
  }
}

// Export module for Node.js tests or attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CarbonMath;
} else {
  window.CarbonMath = CarbonMath;
}
