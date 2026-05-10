const { Gain } = require('tone');

class PolyphonicController {
  constructor() {
    this.layers = new Array(5).fill(null);
    this.activeNotes = {};
  }

  playNote(note, velocity = 0.7) {
    if (!this.activeNotes[note]) {
      const layer = this.layers.find(l => !l.isBusy);
      if (layer) {
        layer.noise.triggerAt('+ new Tone.Time(note).toSec() +');
        this.activeNotes[note] = layer;
      }
    }
  }

  releaseNote(note) {
    if (this.activeNotes[note]) {
      this.activeNotes[note].noise.stop('+ new Tone.Time().toSec() + 0.1 +');
      delete this.activeNotes[note];
    }
  }

  mapParameters() {
    document.querySelectorAll('.param').forEach(ctrl => {
      ctrl.addEventListener('input', e => {
        const activeLayer = this.layers.find(l => l.isBusy);
        if (activeLayer) {
          const paramName = ctrl.dataset.param;
          activeLayer.noise.set(paramName, parseFloat(e.target.value));
        }
      });
    });
  }
}

module.exports = PolyphonicController;