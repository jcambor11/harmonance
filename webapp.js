<script>
const playPauseButton = document.getElementById('playPause');
let isPlaying = false;
let visualizerType = "circle";

const switchButton = document.getElementById('switch');

let visualizerIndex = 0;
const visualizerTypes = ["circle"];

switchButton.addEventListener('click', () => {
  visualizerIndex = (visualizerIndex + 1) % visualizerTypes.length;
  visualizerType = visualizerTypes[visualizerIndex];
});

playPauseButton.addEventListener('click', () => {
  isPlaying = !isPlaying;
  if (isPlaying) {
    activeOscillators.forEach(oscObj => {
      oscObj.gainNode.gain.value = 0.05;
    });
    playPauseButton.textContent = 'Pause';
  } else {
    activeOscillators.forEach(oscObj => {
      oscObj.gainNode.gain.value = 0;
    });
    playPauseButton.textContent = 'Play';
  }
});

const activeOscillators = [];

function getColorForFrequency(frequency) {
    const freqObj = frequencies.find(f => f.freq === frequency);
    if (freqObj) {
        return freqObj.color;
    } else {
        const minFrequency = 50;
        const maxFrequency = 1000;
        const h = ((frequency - minFrequency) / (maxFrequency - minFrequency)) * 330; // Map frequency to hue (0-330)
        const s = 100; // Saturation
        const l = 50; // Lightness
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
}

const frequencies = [
    { freq: 111, desc: 'Angel Number - Manifesting', color: '#FFD700' },
    { freq: 222, desc: 'Angel Number - Balancing', color: '#8B0000' },
    { freq: 333, desc: 'Angel Number - Expansion', color: '#FFA500' },
    { freq: 444, desc: 'Angel Number - Protection', color: '#FFFF00' },
    { freq: 555, desc: 'Angel Number - Transformation', color: '#90EE90' },
    { freq: 666, desc: 'Angel Number - Earthly Matters', color: '#006400' },
    { freq: 777, desc: 'Angel Number - Enlightenment', color: '#87CEEB' },
    { freq: 888, desc: 'Angel Number - Abundance', color: '#FFD700' },
    { freq: 999, desc: 'Angel Number - Completion', color: '#800080' },
    { freq: 174, desc: 'Solfeggio - Pain Relief', color: '#8B0000' },
    { freq: 285, desc: 'Solfeggio - Restoration', color: '#800000' },
    { freq: 396, desc: 'Solfeggio - Liberation', color: '#FF0000' },
    { freq: 417, desc: 'Solfeggio - Cleansing', color: '#FFA500' },
    { freq: 528, desc: 'Solfeggio - Transformation', color: '#FFFF00' },
    { freq: 639, desc: 'Solfeggio - Relationships', color: '#008000' },
    { freq: 741, desc: 'Solfeggio - Detoxification', color: '#87CEEB' },
    { freq: 852, desc: 'Solfeggio - Awakening', color: '#00008B' },
    { freq: 963, desc: 'Solfeggio - Consciousness', color: '#800080' }
];

const angelNumbersContainer = document.querySelector('.angel-numbers');
const solfeggioFrequenciesContainer = document.querySelector('.solfeggio-frequencies');

frequencies.forEach(freqObj => {
    const box = document.createElement('div');
    box.classList.add('frequency-box');
    box.style.backgroundColor = freqObj.color;
    box.innerHTML = `<strong>${freqObj.freq} Hz</strong><p class="description">${freqObj.desc}</p>`;
    box.addEventListener('click', () => {
        if (box.classList.contains('active')) {
            stopTone(freqObj.freq);
            box.classList.remove('active');
            if (!activeOscillators.length) {
                isPlaying = false;
                playPauseButton.textContent = 'Play';
            }
        } else {
            startTone(freqObj.freq);
            box.classList.add('active');
            if (!isPlaying) {
                isPlaying = true;
                playPauseButton.textContent = 'Pause';
            }
        }
    });

    if (!freqObj.desc.startsWith('Solfeggio')) {
        angelNumbersContainer.appendChild(box);
    } else {
        solfeggioFrequenciesContainer.appendChild(box);
    }
});

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

const dataArray = new Uint8Array(analyser.frequencyBinCount);
const bufferLength = dataArray.length;

function drawVisualizer() {
    if (isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeOscillators.forEach((oscObj, index) => {
            const freqObj = frequencies.find(f => f.freq === oscObj.freq) || { color: getColorForFrequency(oscObj.freq) };
            const minPulseDuration = 0.5;
            const maxPulseDuration = 5;
            const pulseDuration = minPulseDuration + (maxPulseDuration - minPulseDuration) * (1 - oscObj.freq / 1000);
            const baseRadius = 50 + (50 * oscObj.freq / 1000);
            const radius = baseRadius + (0.2 * baseRadius * Math.sin(2 * Math.PI * Date.now() / (pulseDuration * 1000)));

            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI);
            ctx.fillStyle = freqObj.color;
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
    requestAnimationFrame(drawVisualizer);
}

drawVisualizer();

function startTone(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.05;

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    oscillator.connect(gainNode);
    gainNode.connect(analyser);

    analyser.connect(audioContext.destination);

    oscillator.start();

    activeOscillators.push({freq: frequency, osc: oscillator, gainNode: gainNode});
}

function stopTone(frequency) {
    const oscObj = activeOscillators.find(oscObj => oscObj.freq === frequency);
    if (oscObj) {
        oscObj.osc.stop();

        oscObj.osc.disconnect();
        oscObj.gainNode.disconnect(analyser);

        activeOscillators.splice(activeOscillators.indexOf(oscObj), 1);
    }
}

analyser.connect(audioContext.destination);

const customFrequencySlider = document.getElementById("custom-frequency");
const customFrequencyInput = document.getElementById("custom-frequency-input");
const customFrequencyDisplay = document.getElementById("custom-freq-display");
const playCustomButton = document.getElementById("playCustom");

customFrequencySlider.addEventListener("input", () => {
  customFrequencyDisplay.textContent = customFrequencySlider.value + " Hz";
  customFrequencyInput.value = customFrequencySlider.value;
});

customFrequencyInput.addEventListener("input", () => {
  customFrequencySlider.value = customFrequencyInput.value;   customFrequencyDisplay.textContent = customFrequencyInput.value + " Hz";
});

const resetButton = document.getElementById('reset');

resetButton.addEventListener('click', () => {
  isPlaying = false;
  playPauseButton.textContent = 'Play';
  activeOscillators.forEach(oscObj => {
    oscObj.osc.stop();
    oscObj.osc.disconnect();
    oscObj.gainNode.disconnect();
  });
  activeOscillators.length = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const frequencyBoxes = document.querySelectorAll('.frequency-box');
  frequencyBoxes.forEach(box => box.classList.remove('active'));
});

playCustomButton.addEventListener('click', () => {
  const freq = Number(customFrequencySlider.value);
  const oscObj = activeOscillators.find(oscObj => oscObj.freq === freq);
  if (oscObj) {
    stopTone(freq);
    playCustomButton.textContent = "Play Custom Frequency";
    if (!activeOscillators.length) {
      isPlaying = false;
    }
  } else {
    startTone(freq);
    const newOscObj = activeOscillators.find(oscObj => oscObj.freq === freq);
    if (newOscObj) {
      newOscObj.gainNode.gain.value = 0.1;
    }
    playCustomButton.textContent = "Stop Custom Frequency";
    isPlaying = true;
  }
});
</script>
