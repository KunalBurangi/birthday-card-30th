// ==============================================================================
// 💖 30TH BIRTHDAY CARD APPLICATION LOGIC
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.BIRTHDAY_CONFIG || {};

  // State
  let audioPlaying = false;
  let audioContext = null;
  let blownCandlesCount = 0;
  const totalCandles = 30;
  let revealedReasonsCount = 0;

  // Audio Elements
  const bgAudio = document.getElementById("bg-audio");
  const toggleMusicBtn = document.getElementById("toggle-music-btn");
  const musicIcon = document.getElementById("music-icon");
  const vinylDisc = document.getElementById("vinyl-disc");
  const musicTitleEl = document.getElementById("music-title");

  if (cfg.musicUrl) {
    bgAudio.src = cfg.musicUrl;
  }
  if (cfg.musicTitle && musicTitleEl) {
    musicTitleEl.textContent = cfg.musicTitle;
  }

  // Web Audio Chime Generator (Guaranteed sound even if remote MP3 is blocked)
  function playSyntheticChime(freq = 523.25, duration = 0.8) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === "suspended") audioContext.resume();

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(0.15, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.warn("Audio chime unsupported:", e);
    }
  }

  function playCelebrationFanfare() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
    notes.forEach((freq, idx) => {
      setTimeout(() => playSyntheticChime(freq, 1.2), idx * 120);
    });
  }

  // Audio Play/Pause Controller
  function startMusic() {
    if (!audioPlaying) {
      bgAudio.play().then(() => {
        audioPlaying = true;
        vinylDisc.classList.add("spinning");
        updateMusicIcon(true);
      }).catch(err => {
        console.log("Audio autoplay prevented, ready on click:", err);
      });
    }
  }

  function toggleMusic() {
    if (audioPlaying) {
      bgAudio.pause();
      audioPlaying = false;
      vinylDisc.classList.remove("spinning");
      updateMusicIcon(false);
    } else {
      bgAudio.play().then(() => {
        audioPlaying = true;
        vinylDisc.classList.add("spinning");
        updateMusicIcon(true);
      }).catch(err => {
        console.warn("Playback error:", err);
      });
    }
  }

  function updateMusicIcon(isPlaying) {
    if (musicIcon) {
      musicIcon.setAttribute("data-lucide", isPlaying ? "volume-2" : "volume-x");
      if (window.lucide) lucide.createIcons();
    }
  }

  if (toggleMusicBtn) {
    toggleMusicBtn.addEventListener("click", toggleMusic);
  }

  // ===========================================================================
  // 1. POPULATE INITIAL CONTENT FROM CONFIG
  // ===========================================================================
  function applyPersonalization() {
    const name = cfg.girlfriendName || "My Love";
    const nick = cfg.nickname || name;

    const gateName = document.getElementById("gate-recipient-name");
    const heroName = document.getElementById("hero-name");
    const salutation = document.getElementById("letter-salutation");
    const letterBody = document.getElementById("letter-body");
    const signoff = document.getElementById("letter-signoff");
    const signature = document.getElementById("letter-signature");

    if (gateName) gateName.textContent = `${name} ✨`;
    if (heroName) heroName.textContent = `${nick}!`;

    // Love Letter
    if (salutation) {
      salutation.textContent = cfg.letter?.salutation || `To My Dearest ${name},`;
    }
    if (letterBody && cfg.letter?.paragraphs) {
      letterBody.innerHTML = cfg.letter.paragraphs
        .map(p => `<p>${p}</p>`)
        .join("");
    }
    if (signoff) {
      signoff.textContent = cfg.letter?.signoff || "All my love, forever and always,";
    }
    if (signature) {
      signature.textContent = cfg.letter?.signature || "Yours ❤️";
    }
  }

  applyPersonalization();

  // ===========================================================================
  // 2. ENVELOPE GATE UNSEALING
  // ===========================================================================
  const breakSealBtn = document.getElementById("break-seal-btn");
  const envelopeGate = document.getElementById("envelope-gate");

  if (breakSealBtn && envelopeGate) {
    breakSealBtn.addEventListener("click", () => {
      // Sound chime
      playCelebrationFanfare();

      // Confetti burst
      if (typeof confetti === "function") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Try autoplay music
      startMusic();

      // Animate gate removal
      envelopeGate.classList.add("opened");
    });
  }

  // ===========================================================================
  // 3. INTERACTIVE 30 CANDLES CAKE (WITH REAL MIC BLOW DETECTION)
  // ===========================================================================
  const candlesRack = document.getElementById("candles-rack");
  const blowAllBtn = document.getElementById("blow-all-candles-btn");
  const startMicBlowBtn = document.getElementById("start-mic-blow-btn");
  const relightBtn = document.getElementById("relight-candles-btn");
  const wishBanner = document.getElementById("wish-banner");
  const micStatusContainer = document.getElementById("mic-status-container");
  const micStatusText = document.getElementById("mic-status-text");
  const micLevelBar = document.getElementById("mic-level-bar");

  let micStream = null;
  let micAudioContext = null;
  let micAnalyser = null;
  let micAnimId = null;
  let isListeningToMic = false;
  let breathAccumulator = 0;

  function renderCandles() {
    if (!candlesRack) return;
    candlesRack.innerHTML = "";
    blownCandlesCount = 0;
    breathAccumulator = 0;

    for (let i = 1; i <= totalCandles; i++) {
      const candle = document.createElement("div");
      candle.className = "single-candle";
      candle.dataset.index = i;
      candle.title = `Candle #${i} - Click to blow out!`;

      candle.innerHTML = `
        <div class="candle-flame"></div>
        <div class="smoke-puff"></div>
      `;

      candle.addEventListener("click", () => blowSingleCandle(candle));
      candlesRack.appendChild(candle);
    }
  }

  function blowSingleCandle(candle) {
    if (!candle.classList.contains("blown")) {
      candle.classList.add("blown");
      blownCandlesCount++;
      playSyntheticChime(440 + blownCandlesCount * 15, 0.3);

      if (blownCandlesCount === totalCandles) {
        onAllCandlesBlown();
      }
    }
  }

  function blowAllCandlesProgression() {
    stopMicListening();
    const candles = document.querySelectorAll(".single-candle:not(.blown)");
    candles.forEach((c, idx) => {
      setTimeout(() => {
        c.classList.add("blown");
        blownCandlesCount++;
        if (idx === candles.length - 1) {
          onAllCandlesBlown();
        }
      }, idx * 35);
    });
  }

  function onAllCandlesBlown() {
    stopMicListening();
    playCelebrationFanfare();

    // Spectacular celebration confetti
    if (typeof confetti === "function") {
      const duration = 3.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }

    if (wishBanner) wishBanner.classList.remove("hidden");
    if (blowAllBtn) blowAllBtn.classList.add("hidden");
    if (startMicBlowBtn) startMicBlowBtn.classList.add("hidden");
    if (relightBtn) relightBtn.classList.remove("hidden");
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Real Microphone Blow Detector
  async function startMicListening() {
    if (isListeningToMic) {
      stopMicListening();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Microphone access is not supported by this browser. You can still use the 'Tap To Blow' button!");
      return;
    }

    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      micAudioContext = new AudioCtx();
      if (micAudioContext.state === "suspended") {
        await micAudioContext.resume();
      }

      micAnalyser = micAudioContext.createAnalyser();
      micAnalyser.fftSize = 512;
      micAnalyser.smoothingTimeConstant = 0.2;

      const source = micAudioContext.createMediaStreamSource(micStream);
      source.connect(micAnalyser);

      isListeningToMic = true;
      breathAccumulator = 0;

      if (micStatusContainer) micStatusContainer.classList.remove("hidden");
      if (micStatusText) micStatusText.textContent = "Listening... Blow gently into your mic now! 🌬️";
      if (startMicBlowBtn) {
        startMicBlowBtn.innerHTML = `
          <i data-lucide="mic-off" class="w-5 h-5"></i>
          <span>Stop Listening</span>
        `;
        if (window.lucide) lucide.createIcons();
      }

      processMicAudio();
    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      if (micStatusContainer) micStatusContainer.classList.remove("hidden");
      if (micStatusText) micStatusText.textContent = "Mic access blocked. You can still tap the button to blow!";
    }
  }

  function stopMicListening() {
    isListeningToMic = false;
    if (micAnimId) {
      cancelAnimationFrame(micAnimId);
      micAnimId = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    if (micAudioContext && micAudioContext.state !== "closed") {
      micAudioContext.close().catch(() => {});
      micAudioContext = null;
    }

    // Reset flame flutter
    document.querySelectorAll(".candle-flame").forEach(f => f.classList.remove("fluttering"));

    if (micStatusContainer) micStatusContainer.classList.add("hidden");
    if (startMicBlowBtn) {
      startMicBlowBtn.innerHTML = `
        <i data-lucide="mic" class="w-5 h-5"></i>
        <span>Blow Into Your Mic! 🎙️💨</span>
      `;
      if (window.lucide) lucide.createIcons();
    }
  }

  function processMicAudio() {
    if (!isListeningToMic || !micAnalyser) return;

    const freqData = new Uint8Array(micAnalyser.frequencyBinCount);
    micAnalyser.getByteFrequencyData(freqData);

    // Wind turbulence / breath is concentrated in low frequencies (< 250Hz)
    let lowFreqSum = 0;
    const lowBins = 14;
    for (let i = 1; i <= lowBins; i++) {
      lowFreqSum += freqData[i];
    }
    const lowAvg = lowFreqSum / lowBins;

    // Time domain RMS volume
    const timeData = new Uint8Array(micAnalyser.fftSize);
    micAnalyser.getByteTimeDomainData(timeData);
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i++) {
      const norm = (timeData[i] - 128) / 128;
      sumSquares += norm * norm;
    }
    const rms = Math.sqrt(sumSquares / timeData.length);

    // Dynamic wind/breath calculation
    const breathScore = Math.min(100, Math.max(0, (lowAvg * 0.75) + (rms * 160)));

    if (micLevelBar) {
      micLevelBar.style.width = `${breathScore}%`;
    }

    const flames = document.querySelectorAll(".candle-flame");

    // Real-time visual feedback: candles flicker and bend in wind!
    if (breathScore > 18) {
      const angle = Math.min(45, (breathScore - 18) * 1.2);
      flames.forEach(f => {
        f.classList.add("fluttering");
        f.style.setProperty("--blow-angle", `-${angle}deg`);
      });

      // Accumulate sustained blowing
      if (breathScore > 35) {
        breathAccumulator += breathScore * 0.08;
      }
    } else {
      flames.forEach(f => f.classList.remove("fluttering"));
      breathAccumulator = Math.max(0, breathAccumulator - 0.5);
    }

    // Trigger blowout when strong or sustained breath is achieved
    if (breathAccumulator >= 12 || breathScore >= 85) {
      if (micStatusText) micStatusText.textContent = "POOF! Wish made! ✨🎂";
      blowAllCandlesProgression();
      return;
    }

    micAnimId = requestAnimationFrame(processMicAudio);
  }

  if (startMicBlowBtn) {
    startMicBlowBtn.addEventListener("click", startMicListening);
  }

  if (blowAllBtn) {
    blowAllBtn.addEventListener("click", blowAllCandlesProgression);
  }

  if (relightBtn) {
    relightBtn.addEventListener("click", () => {
      renderCandles();
      if (wishBanner) wishBanner.classList.add("hidden");
      if (blowAllBtn) blowAllBtn.classList.remove("hidden");
      if (startMicBlowBtn) startMicBlowBtn.classList.remove("hidden");
      if (relightBtn) relightBtn.classList.add("hidden");
    });
  }

  renderCandles();

  // ===========================================================================
  // 4. POLAROID MEMORY LANE
  // ===========================================================================
  const polaroidGrid = document.getElementById("polaroid-grid");

  function renderPolaroids() {
    if (!polaroidGrid || !cfg.polaroids) return;
    polaroidGrid.innerHTML = "";

    const tapeStyles = ["tape-top-center", "tape-top-left", "tape-top-right"];

    cfg.polaroids.forEach((item, index) => {
      const tapeClass = tapeStyles[index % tapeStyles.length];
      const rotation = item.rotation || (index % 2 === 0 ? -2.5 : 2.5);

      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.style.transform = `rotate(${rotation}deg)`;

      card.innerHTML = `
        <div class="polaroid-inner">
          <div class="washi-tape ${tapeClass}"></div>
          
          <!-- FRONT -->
          <div class="polaroid-front">
            <div class="polaroid-img-wrapper">
              <img src="${item.src}" alt="${item.caption}" onerror="this.onerror=null; this.src='${item.fallback}';">
            </div>
            <div class="mt-3 text-center">
              <p class="font-note text-xl font-bold text-stone-800 leading-snug">${item.caption}</p>
              <div class="flex items-center justify-between text-xs text-stone-400 font-mono mt-1">
                <span>📸 #${index + 1}</span>
                <span>${item.date}</span>
              </div>
            </div>
          </div>

          <!-- BACK -->
          <div class="polaroid-back">
            <div class="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-3 shadow-inner">
              <i data-lucide="heart" class="w-4 h-4 fill-rose-400 text-rose-500"></i>
            </div>
            <h4 class="font-serif-title font-bold text-stone-800 text-base mb-2">${item.caption}</h4>
            <p class="font-note text-lg text-stone-600 leading-relaxed italic mb-4">"${item.note}"</p>
            <div class="mt-auto border-t border-dashed border-stone-200 pt-2 w-full text-xs font-mono text-stone-400 flex justify-between">
              <span>Memory Lane</span>
              <span>Tap to flip back</span>
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        card.classList.toggle("flipped");
        playSyntheticChime(600, 0.15);
      });

      polaroidGrid.appendChild(card);
    });
  }

  renderPolaroids();

  // ===========================================================================
  // 5. 30 REASONS WHY I LOVE YOU
  // ===========================================================================
  const reasonsGrid = document.getElementById("reasons-grid");
  const revealedCountEl = document.getElementById("revealed-count");
  const reasonsProgressBar = document.getElementById("reasons-progress-bar");
  const revealAllBtn = document.getElementById("reveal-all-reasons-btn");

  function renderReasons() {
    if (!reasonsGrid || !cfg.reasons) return;
    reasonsGrid.innerHTML = "";
    revealedReasonsCount = 0;
    updateReasonsProgress();

    cfg.reasons.forEach((reasonText, idx) => {
      const card = document.createElement("div");
      card.className = "reason-card";

      card.innerHTML = `
        <div class="reason-card-inner">
          <!-- FRONT -->
          <div class="reason-front">
            <div class="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold font-mono mb-1">
              ${idx + 1}
            </div>
            <span class="font-handwriting text-lg text-rose-600 font-bold">Open Me</span>
            <span class="text-[10px] text-stone-400 mt-1">Tap card</span>
          </div>

          <!-- BACK -->
          <div class="reason-back font-note">
            <p class="font-semibold text-rose-700 text-xs mb-1">#${idx + 1}</p>
            <p class="text-stone-700 text-sm leading-tight">${reasonText}</p>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        if (!card.classList.contains("revealed")) {
          card.classList.add("revealed");
          revealedReasonsCount++;
          updateReasonsProgress();
          playSyntheticChime(500 + revealedReasonsCount * 15, 0.2);

          if (revealedReasonsCount === cfg.reasons.length) {
            playCelebrationFanfare();
            if (typeof confetti === "function") {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
            }
          }
        } else {
          card.classList.remove("revealed");
          revealedReasonsCount = Math.max(0, revealedReasonsCount - 1);
          updateReasonsProgress();
        }
      });

      reasonsGrid.appendChild(card);
    });
  }

  function updateReasonsProgress() {
    if (revealedCountEl) revealedCountEl.textContent = revealedReasonsCount;
    if (reasonsProgressBar && cfg.reasons) {
      const pct = (revealedReasonsCount / cfg.reasons.length) * 100;
      reasonsProgressBar.style.width = `${pct}%`;
    }
  }

  if (revealAllBtn) {
    revealAllBtn.addEventListener("click", () => {
      const cards = document.querySelectorAll(".reason-card:not(.revealed)");
      cards.forEach((c, idx) => {
        setTimeout(() => {
          c.classList.add("revealed");
          revealedReasonsCount++;
          updateReasonsProgress();
          if (idx === cards.length - 1) {
            playCelebrationFanfare();
            if (typeof confetti === "function") {
              confetti({ particleCount: 120, spread: 90 });
            }
          }
        }, idx * 50);
      });
    });
  }

  renderReasons();

  // ===========================================================================
  // 6. QUICK CUSTOMIZER MODAL
  // ===========================================================================
  const openCustomizerBtn = document.getElementById("open-customizer-btn");
  const closeCustomizerBtn = document.getElementById("close-customizer-btn");
  const cancelCustomBtn = document.getElementById("cancel-custom-btn");
  const customizerModal = document.getElementById("customizer-modal");
  const quickCustomForm = document.getElementById("quick-custom-form");
  const inputName = document.getElementById("input-name");
  const inputNickname = document.getElementById("input-nickname");

  function openModal() {
    if (inputName) inputName.value = cfg.girlfriendName || "";
    if (inputNickname) inputNickname.value = cfg.nickname || "";
    if (customizerModal) customizerModal.classList.remove("hidden");
  }

  function closeModal() {
    if (customizerModal) customizerModal.classList.add("hidden");
  }

  if (openCustomizerBtn) openCustomizerBtn.addEventListener("click", openModal);
  if (closeCustomizerBtn) closeCustomizerBtn.addEventListener("click", closeModal);
  if (cancelCustomBtn) cancelCustomBtn.addEventListener("click", closeModal);

  if (quickCustomForm) {
    quickCustomForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (inputName.value.trim()) {
        cfg.girlfriendName = inputName.value.trim();
      }
      if (inputNickname.value.trim()) {
        cfg.nickname = inputNickname.value.trim();
      }
      applyPersonalization();
      closeModal();
      playCelebrationFanfare();
    });
  }

  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }
});
