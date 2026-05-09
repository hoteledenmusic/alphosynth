// Alphosynth script
let synth = new Tone.Synth({
    oscillator: {type: "triangle"},
    envelope: {attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5}
}).toDestination();

// Drum sounds
const kick = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 10,
    envelope: {attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4}
}).toDestination();

const snare = new Tone.NoiseSynth({
    noise: {type: "white"},
    envelope: {attack: 0.001, decay: 0.2, sustain: 0}
}).toDestination();

const hatClosed = new Tone.NoiseSynth({
    noise: {type: "white"},
    envelope: {attack: 0.001, decay: 0.1, sustain: 0}
}).toDestination();

const hatOpen = new Tone.NoiseSynth({
    noise: {type: "white"},
    envelope: {attack: 0.001, decay: 0.5, sustain: 0}
}).toDestination();

const lowTom = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    envelope: {attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4}
}).toDestination();

const highTom = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 4,
    envelope: {attack: 0.001, decay: 0.3, sustain: 0.01, release: 1.2}
}).toDestination();

const clap = new Tone.NoiseSynth({
    noise: {type: "white"},
    envelope: {attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.2}
}).toDestination();

const cowbell = new Tone.MetalSynth({
    frequency: 200,
    envelope: {attack: 0.001, decay: 0.2, sustain: 0},
    harmonicity: 2.5,
    modulationIndex: 10,
    resonance: 4000
}).toDestination();

const rimshot = new Tone.NoiseSynth({
    noise: {type: "white"},
    envelope: {attack: 0.001, decay: 0.15, sustain: 0}
}).toDestination();

const tambourine = new Tone.NoiseSynth({
    noise: {type: "white"},
    envelope: {attack: 0.001, decay: 0.3, sustain: 0.0}
}).toDestination();

// Map keys to functions
const noteMap = {
    a: "C4", b: "D4", c: "E4", d: "F4", e: "G4", f: "A4", g: "B4",
    A: "C5", B: "D5", C: "E5", D: "F5", E: "G5", F: "A5", G: "B5"
};

const drumMap = {
    "0": () => kick.triggerAttackRelease("C2", "8n"),
    "1": () => snare.triggerAttackRelease("8n"),
    "2": () => hatClosed.triggerAttackRelease("32n"),
    "3": () => hatOpen.triggerAttackRelease("8n"),
    "4": () => lowTom.triggerAttackRelease("C2", "8n"),
    "5": () => highTom.triggerAttackRelease("C2", "8n"),
    "6": () => clap.triggerAttackRelease("8n"),
    "7": () => cowbell.triggerAttackRelease("8n"),
    "8": () => rimshot.triggerAttackRelease("8n"),
    "9": () => tambourine.triggerAttackRelease("8n")
};

// Sequencer storage
let events = []; // each event: {time, type, noteOrKey}
let isRecording = false;
let startTime = 0;
let scheduledTimeout = null;

// Helper to schedule a sound at a given Transport time
function scheduleSoundAt(time, fn) {
    Tone.Transport.scheduleRepeat((timeArg) => {
        fn();
    }, "1n", time); // repeat once? Actually scheduleOnce: use scheduleOnce
    // Tone.Transport.scheduleOnce((timeArg) => { fn(); }, time);
}

// Actually use scheduleOnce
function scheduleSoundOnce(time, fn) {
    Tone.Transport.scheduleOnce((timeArg) => { fn(); }, time);
}

// Convert keypress to scheduled event
function handleKey(key) {
    const now = Tone.Transport.now();
    const quantize = Tone.Transport.timeToQuantize(now, "16n"); // next 16th note
    const eventTime = quantize; // schedule at next 16th note
    let fn;
    if (noteMap[key]) {
        const note = noteMap[key];
        fn = () => synth.triggerAttackRelease(note, "8n", eventTime);
        events.push({time: eventTime, type: "note", note});
    } else if (drumMap[key]) {
        fn = drumMap[key];
        events.push({time: eventTime, type: "drum", key});
    } else if (key === " ") {
        // rest: just store as rest event
        events.push({time: eventTime, type: "rest"});
        return;
    } else {
        return; // ignore
    }
    // Schedule the sound
    if (fn) scheduleSoundOnce(eventTime, fn);
}

// UI elements
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const clearBtn = document.getElementById('clear');
const tempoInput = document.getElementById('tempo');
const statusText = document.getElementById('status-text');
const eventCount = document.getElementById('event-count');

playBtn.addEventListener('click', () => {
    if (Tone.Transport.state === "started") return;
    Tone.Transport.bpm.value = parseInt(tempoInput.value) || 120;
    Tone.Transport.start();
    // Schedule all stored events relative to transport start
    events.forEach(ev => {
        if (ev.type === "note") {
            scheduleSoundOnce(ev.time, () => synth.triggerAttackRelease(ev.note, "8n"));
        } else if (ev.type === "drum") {
            // need mapping again; we can store fn but for simplicity re-eval
            const fn = drumMap[ev.key];
            scheduleSoundOnce(ev.time, fn);
        }
        // rest does nothing
    });
    statusText.textContent = "Playing";
});

stopBtn.addEventListener('click', () => {
    Tone.Transport.stop();
    statusText.textContent = "Stopped";
});

clearBtn.addEventListener('click', () => {
    events = [];
    eventCount.textContent = "0";
    statusText.textContent = "Cleared";
});

tempoInput.addEventListener('change', () => {
    if (Tone.Transport.state === "started") {
        Tone.Transport.bpm.value = parseInt(tempoInput.value) || 120;
    }
});

// Keyboard input
document.addEventListener('keydown', (e) => {
    // Prevent default for space/page scroll etc.
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const key = e.key;
    if (noteMap[key] || drumMap[key] || key === " ") {
        e.preventDefault(); // prevent scrolling on space
        handleKey(key);
        eventCount.textContent = events.length;
        // visual feedback? could flash but skip for simplicity
    }
});

// Enter key toggles recording mode indicator (not strictly needed)
document.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === "Enter") {
        e.preventDefault();
        isRecording = !isRecording;
        statusText.textContent = isRecording ? "Recording..." : "Idle";
    }
});

// Initialize
Tone.start();
statusText.textContent = "Ready";