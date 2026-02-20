// models/modelsFullPairsStrength.js
class FullPairsStrength {
  constructor() {
    this.marketStrength = [];
    this.timestamp = new Date().toISOString();
  }

  update(data) {
    this.marketStrength = data;
    this.timestamp = new Date().toISOString();
  }

  getJSON() {
    return {
      success: true,
      timestamp: this.timestamp,
      marketStrength: this.marketStrength,
    };
  }
}

module.exports = new FullPairsStrength();