const { Synth, Gain } = require('tone');

class NoiseLayer {
  constructor(id) {
    this.id = id;
    this.gain = new Gain(0.5).toDestination();
    this.noise = new Synth({
      oscillator: {
        type: 'noise',
        partials: 100
      },
      envelope: {
        attack: 0.01,
        decay: 0.02,
        sustain: 0.8,
        release: 0.1
      }
    }).connect(this.gain);

    this.parameters = {
      frequency: 440,
      feedback: 0.3,
      grainSize: 0.05,
      modulationIndex: 0.45,
      noiseType: 'brown',
      diffusion: 0.8,
      lowCut: 50,
      highCut: 8000,
      modulationFreq: 0.1,
      chaos: 0.2,
      resonance: 0.6,
      detune: 0.002,
      spread: 0.5,
      reverb: 0.4,
      delay: 0.7,
      bitCrush: 8,
      aliasing: true,
      frequencyDrift: 0.01,
      harmonicSpread: 3,
      subOctave: -1,
      noiseDensity: 0.7,
      grainVariance: 0.3
    };
  }
}

module.exports = NoiseLayer;