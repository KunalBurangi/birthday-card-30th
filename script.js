// ==============================================================================
// 💖 LUXURY KEEPSAKE BOOK LOGIC (FIGMA MATCHING SPEC)
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.BIRTHDAY_CONFIG || {};

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  let currentSpread = 1;
  const totalSpreads = 4;
  const spreadLabels = [
    "COVER • 1 OF 4",
    "MEMORIES • 2 OF 4",
    "SURPRISES & SCRATCH • 3 OF 4",
    "GRAND FINALE • 4 OF 4"
  ];

  let audioPlaying = false;
  let audioContext = null;
  let blownCandlesCount = 0;
  const totalCandles = 30;

  // Microphone state
  let micStream = null;
  let micAudioContext = null;
  let micAnalyser = null;
  let micAnimId = null;
  let isListeningToMic = false;
  let breathAccumulator = 0;
  let micPermissionRequested = false;

  // ---------------------------------------------------------------------------
  // AUDIO & SYNTHESIZER
  // ---------------------------------------------------------------------------
  const bgAudio = document.getElementById("bg-audio");
  const toggleMusicBtn = document.getElementById("toggle-music-btn");
  const musicIcon = document.getElementById("music-icon");
  const vinylDisc = document.getElementById("vinyl-disc");
  const musicTitleEl = document.getElementById("music-title");

  if (cfg.musicUrl) {
    bgAudio.src = cfg.musicUrl;
    bgAudio.addEventListener("error", () => {
      if (cfg.musicFallbackUrl) {
        bgAudio.src = cfg.musicFallbackUrl;
        bgAudio.load();
      }
    }, { once: true });
  }
  if (cfg.musicTitle && musicTitleEl) musicTitleEl.textContent = cfg.musicTitle;

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

      gain.gain.setValueAtTime(0.12, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  function playCelebrationFanfare() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => playSyntheticChime(freq, 1.2), idx * 120);
    });
  }

  function startMusic() {
    if (!audioPlaying) {
      bgAudio.play().then(() => {
        audioPlaying = true;
        if (vinylDisc) vinylDisc.classList.add("spinning");
        updateMusicIcon(true);
      }).catch(err => {
        console.log("Autoplay waiting for touch:", err);
      });
    }
  }

  function toggleMusic() {
    if (audioPlaying) {
      bgAudio.pause();
      audioPlaying = false;
      if (vinylDisc) vinylDisc.classList.remove("spinning");
      updateMusicIcon(false);
    } else {
      bgAudio.play().then(() => {
        audioPlaying = true;
        if (vinylDisc) vinylDisc.classList.add("spinning");
        updateMusicIcon(true);
      }).catch(err => console.warn(err));
    }
  }

  function updateMusicIcon(isPlaying) {
    if (musicIcon) {
      musicIcon.setAttribute("data-lucide", isPlaying ? "volume-2" : "volume-x");
      if (window.lucide) lucide.createIcons();
    }
  }

  if (toggleMusicBtn) toggleMusicBtn.addEventListener("click", toggleMusic);

  // ---------------------------------------------------------------------------
  // 1. EARLY MICROPHONE PERMISSION REQUEST (UPON WEBSITE OPEN)
  // ---------------------------------------------------------------------------
  async function requestMicEarly() {
    if (micPermissionRequested) return;
    micPermissionRequested = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!micAudioContext && AudioCtx) micAudioContext = new AudioCtx();

    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        video: false
      });
      console.log("Microphone pre-authorized!");
      if (currentSpread === 4) setupAndStartMic();
    } catch (err) {
      console.log("Early mic permission waiting for gesture:", err);
      window.addEventListener("pointerdown", () => {
        if (!micStream) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
            micStream = s;
            if (currentSpread === 4) setupAndStartMic();
          }).catch(e => console.warn(e));
        }
        if (micAudioContext && micAudioContext.state === "suspended") {
          micAudioContext.resume();
        }
      }, { once: true });
    }
  }

  requestMicEarly();

  // Resume Audio on first touch/click anywhere
  window.addEventListener("pointerdown", () => {
    if (micAudioContext && micAudioContext.state === "suspended") {
      micAudioContext.resume();
    }
    startMusic();
  }, { once: true });

  // ---------------------------------------------------------------------------
  // 2. 4-SPREAD BOOK NAVIGATION
  // ---------------------------------------------------------------------------
  const spreads = document.querySelectorAll(".book-spread");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageTitleLabel = document.getElementById("page-title-label");
  const navDots = document.querySelectorAll(".nav-dot");

  function goToSpread(spreadNum) {
    if (spreadNum < 1 || spreadNum > totalSpreads) return;
    currentSpread = spreadNum;

    spreads.forEach(s => {
      const num = parseInt(s.dataset.spread, 10);
      if (num === currentSpread) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });

    if (pageTitleLabel) {
      pageTitleLabel.textContent = spreadLabels[currentSpread - 1];
    }

    navDots.forEach(dot => {
      const target = parseInt(dot.dataset.spreadTarget, 10);
      if (target === currentSpread) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    if (prevPageBtn) prevPageBtn.disabled = (currentSpread === 1);
    if (nextPageBtn) nextPageBtn.disabled = (currentSpread === totalSpreads);

    // Smooth scroll to top of book
    const bookEl = document.querySelector(".book-wrapper");
    if (bookEl) {
      const y = bookEl.getBoundingClientRect().top + window.pageYOffset - 15;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }

    playSyntheticChime(420 + currentSpread * 40, 0.15);

    // Spread 4: The Birthday Cake (Auto start mic)
    if (currentSpread === 4) {
      if (blownCandlesCount < totalCandles) setupAndStartMic();
    } else {
      pauseMicListening();
    }

    // Spread 3: Initialize Scratch Cards when navigated to
    if (currentSpread === 3) {
      initScratchCards();
    }
  }

  function nextSpread() {
    if (currentSpread < totalSpreads) goToSpread(currentSpread + 1);
  }

  function prevSpread() {
    if (currentSpread > 1) goToSpread(currentSpread - 1);
  }

  if (nextPageBtn) nextPageBtn.addEventListener("click", nextSpread);
  if (prevPageBtn) prevPageBtn.addEventListener("click", prevSpread);

  navDots.forEach(dot => {
    dot.addEventListener("click", () => {
      const t = parseInt(dot.dataset.spreadTarget, 10);
      if (t) goToSpread(t);
    });
  });

  // Break Cover Wax Seal
  const breakCoverSealBtn = document.getElementById("break-cover-seal-btn");
  if (breakCoverSealBtn) {
    breakCoverSealBtn.addEventListener("click", () => {
      playCelebrationFanfare();
      if (typeof confetti === "function") {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      goToSpread(2);
    });
  }

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") nextSpread();
    if (e.key === "ArrowLeft" || e.key === "PageUp") prevSpread();
  });

  // Touch Swipe Gestures
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0) nextSpread();
      else prevSpread();
    }
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // 3. SPREAD 2: INTERACTIVE FILMSTRIP MEMORY SWAPPER
  // ---------------------------------------------------------------------------
  const filmThumbs = document.querySelectorAll(".film-thumb");
  const presentPhotoImg = document.getElementById("present-photo-img");
  const presentPhotoCaption = document.getElementById("present-photo-caption");
  const presentPhotoNote = document.getElementById("present-photo-note");

  filmThumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      filmThumbs.forEach(t => {
        t.classList.remove("active", "border-[#7b1e28]");
        t.classList.add("border-stone-300");
      });
      thumb.classList.add("active", "border-[#7b1e28]");
      thumb.classList.remove("border-stone-300");

      const newSrc = thumb.dataset.img;
      const newCap = thumb.dataset.caption;
      const newNote = thumb.dataset.note;

      if (presentPhotoImg) {
        presentPhotoImg.style.opacity = "0.3";
        setTimeout(() => {
          presentPhotoImg.src = newSrc;
          presentPhotoImg.style.opacity = "1";
        }, 150);
      }
      if (presentPhotoCaption) presentPhotoCaption.textContent = newCap;
      if (presentPhotoNote) presentPhotoNote.textContent = `"${newNote}"`;

      playSyntheticChime(550, 0.12);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. SPREAD 3: SURPRISE MINI ENVELOPES & LUCKY SCRATCH-OFFS
  // ---------------------------------------------------------------------------
  // Mini Envelopes
  document.querySelectorAll(".open-env-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.env;
      const textEl = document.getElementById(`env-text-${id}`);
      if (textEl) {
        textEl.classList.remove("line-clamp-2");
      }
      btn.textContent = "Unfolded 💌";
      btn.disabled = true;
      btn.classList.add("opacity-60");
      playCelebrationFanfare();
      if (typeof confetti === "function") {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    });
  });

  // Interactive Scratch Cards (Gold & Rose Gold Foil Canvas)
  let scratchInitialized = false;

  function initScratchCards() {
    if (scratchInitialized) return;
    scratchInitialized = true;

    setupScratchCanvas("scratch-canvas-1", "gold");
    setupScratchCanvas("scratch-canvas-2", "rosegold");
  }

  function setupScratchCanvas(canvasId, foilType) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const width = canvas.offsetWidth || 300;
    const height = canvas.offsetHeight || 120;
    canvas.width = width;
    canvas.height = height;

    // Draw shimmering foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (foilType === "gold") {
      grad.addColorStop(0, "#c5a059");
      grad.addColorStop(0.3, "#fef3c7");
      grad.addColorStop(0.6, "#d4af37");
      grad.addColorStop(1, "#b89228");
    } else {
      grad.addColorStop(0, "#c47a86");
      grad.addColorStop(0.3, "#fed7aa");
      grad.addColorStop(0.6, "#f497a7");
      grad.addColorStop(1, "#9e364a");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Overlay text & sparkle dots
    ctx.fillStyle = "#5a131e";
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ SCRATCH TO UNLOCK SURPRISE ✦", width / 2, height / 2 - 8);

    ctx.fillStyle = "rgba(90, 19, 30, 0.65)";
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("• Rub gently with cursor or finger •", width / 2, height / 2 + 14);

    let isScratching = false;
    let scratchedPixels = 0;
    const totalPixels = width * height;

    function scratch(e) {
      if (!isScratching) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();

      scratchedPixels += 80;
      if (scratchedPixels > totalPixels * 0.4) {
        canvas.style.opacity = "0";
        setTimeout(() => {
          canvas.style.display = "none";
        }, 500);
        playCelebrationFanfare();
        if (typeof confetti === "function") {
          confetti({ particleCount: 70, spread: 70 });
        }
      }
    }

    canvas.addEventListener("mousedown", (e) => { isScratching = true; scratch(e); });
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => { isScratching = false; });

    canvas.addEventListener("touchstart", (e) => { isScratching = true; scratch(e); }, { passive: true });
    canvas.addEventListener("touchmove", scratch, { passive: true });
    window.addEventListener("touchend", () => { isScratching = false; });
  }

  // ---------------------------------------------------------------------------
  // 5. SPREAD 4: 3D CYLINDRICAL CAKE & REAL-TIME BLOW DETECTION
  // ---------------------------------------------------------------------------
  const candlesRack = document.getElementById("candles-rack");
  const blowAllBtn = document.getElementById("blow-all-candles-btn");
  const relightBtn = document.getElementById("relight-candles-btn");
  const wishBanner = document.getElementById("wish-banner");
  const micStatusText = document.getElementById("mic-status-text");
  const micLevelBar = document.getElementById("mic-level-bar");
  const breathValEl = document.getElementById("breath-val");

  function renderCandles() {
    if (!candlesRack) return;
    candlesRack.innerHTML = "";
    blownCandlesCount = 0;
    breathAccumulator = 0;

    for (let i = 1; i <= totalCandles; i++) {
      const candle = document.createElement("div");
      candle.className = "single-candle";
      candle.dataset.index = i;
      candle.title = `Candle #${i} - Click or blow to extinguish!`;

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
    pauseMicListening();
    const candles = document.querySelectorAll(".single-candle:not(.blown)");
    candles.forEach((c, idx) => {
      setTimeout(() => {
        c.classList.add("blown");
        blownCandlesCount++;
        if (idx === candles.length - 1) {
          onAllCandlesBlown();
        }
      }, idx * 30);
    });
  }

  function onAllCandlesBlown() {
    pauseMicListening();
    playCelebrationFanfare();

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
    if (relightBtn) relightBtn.classList.remove("hidden");
    if (micStatusText) micStatusText.innerHTML = "🎉 <strong>POOF! All 30 candles blown!</strong> Wish sent! ✨";
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Connect microphone stream
  async function setupAndStartMic() {
    if (isListeningToMic) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!micAudioContext && AudioCtx) micAudioContext = new AudioCtx();
      if (micAudioContext && micAudioContext.state === "suspended") {
        await micAudioContext.resume();
      }

      if (!micStream) {
        const audioConstraints = {
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
          video: false
        };
        try {
          micStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        } catch (e) {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
      }

      if (micAudioContext && !micAnalyser) {
        micAnalyser = micAudioContext.createAnalyser();
        micAnalyser.fftSize = 512;
        micAnalyser.smoothingTimeConstant = 0.15;
        const source = micAudioContext.createMediaStreamSource(micStream);
        source.connect(micAnalyser);
      }

      isListeningToMic = true;
      breathAccumulator = 0;

      if (micStatusText) {
        micStatusText.innerHTML = "🎙️ Mic Active: <strong>Blow onto your mic now!</strong> 🌬️";
      }

      processMicAudio();
    } catch (err) {
      console.log("Mic activation notice:", err);
      if (micStatusText) {
        micStatusText.innerHTML = "Tap <em>'Tap Gentle Breeze'</em> below if mic is blocked!";
      }
    }
  }

  function pauseMicListening() {
    isListeningToMic = false;
    if (micAnimId) {
      cancelAnimationFrame(micAnimId);
      micAnimId = null;
    }
    document.querySelectorAll(".candle-flame").forEach(f => {
      f.classList.remove("fluttering");
      f.style.removeProperty("--blow-angle");
    });
  }

  function processMicAudio() {
    if (!isListeningToMic || !micAnalyser) return;

    const timeData = new Float32Array(micAnalyser.fftSize);
    micAnalyser.getFloatTimeDomainData(timeData);
    let sumSq = 0;
    for (let i = 0; i < timeData.length; i++) {
      sumSq += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSq / timeData.length);

    const freqData = new Uint8Array(micAnalyser.frequencyBinCount);
    micAnalyser.getByteFrequencyData(freqData);
    let lowFreqSum = 0;
    const lowBins = 10;
    for (let i = 1; i <= lowBins; i++) {
      lowFreqSum += freqData[i];
    }
    const lowAvg = lowFreqSum / lowBins;

    const volumeScore = Math.min(100, Math.round(rms * 280));
    const lowScore = Math.min(100, Math.round((lowAvg / 255) * 100));
    const breathScore = Math.max(volumeScore, lowScore);

    if (micLevelBar) {
      micLevelBar.style.width = `${Math.min(100, breathScore * 1.4)}%`;
    }
    if (breathValEl) {
      breathValEl.textContent = `${Math.min(100, Math.round(breathScore))}%`;
    }

    const flames = document.querySelectorAll(".candle-flame");

    if (breathScore > 8) {
      const angle = Math.min(42, breathScore * 1.2);
      flames.forEach(f => {
        f.classList.add("fluttering");
        f.style.setProperty("--blow-angle", `-${angle}deg`);
      });

      if (breathScore > 20) {
        breathAccumulator += breathScore * 0.12;
      }
    } else {
      flames.forEach(f => f.classList.remove("fluttering"));
      breathAccumulator = Math.max(0, breathAccumulator - 0.4);
    }

    if (breathScore >= 45 || breathAccumulator >= 8) {
      blowAllCandlesProgression();
      return;
    }

    micAnimId = requestAnimationFrame(processMicAudio);
  }

  if (blowAllBtn) blowAllBtn.addEventListener("click", blowAllCandlesProgression);

  if (relightBtn) {
    relightBtn.addEventListener("click", () => {
      renderCandles();
      if (wishBanner) wishBanner.classList.add("hidden");
      if (blowAllBtn) blowAllBtn.classList.remove("hidden");
      if (relightBtn) relightBtn.classList.add("hidden");
      setupAndStartMic();
    });
  }

  renderCandles();

  // ---------------------------------------------------------------------------
  // 3D CAKE PERSPECTIVE TILT
  // ---------------------------------------------------------------------------
  const cakeStage = document.getElementById("cake-stage");
  const cake3D = document.getElementById("cake-3d");

  if (cakeStage && cake3D) {
    function handleCakeTilt(clientX, clientY) {
      const rect = cakeStage.getBoundingClientRect();
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      const rotY = (x / (rect.width / 2)) * 14;
      const rotX = 10 - (y / (rect.height / 2)) * 8;
      cake3D.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    cakeStage.addEventListener("mousemove", (e) => handleCakeTilt(e.clientX, e.clientY));
    cakeStage.addEventListener("mouseleave", () => {
      cake3D.style.transform = "rotateX(10deg) rotateY(0deg)";
    });
    cakeStage.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) handleCakeTilt(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    cakeStage.addEventListener("touchend", () => {
      cake3D.style.transform = "rotateX(10deg) rotateY(0deg)";
    });
  }

  // ---------------------------------------------------------------------------
  // 6. QUICK CUSTOMIZER MODAL
  // ---------------------------------------------------------------------------
  const openCustomizerBtn = document.getElementById("open-customizer-btn");
  const closeCustomizerBtn = document.getElementById("close-customizer-btn");
  const cancelCustomBtn = document.getElementById("cancel-custom-btn");
  const customizerModal = document.getElementById("customizer-modal");
  const quickCustomForm = document.getElementById("quick-custom-form");
  const inputName = document.getElementById("input-name");

  function openModal() {
    if (inputName) inputName.value = cfg.girlfriendName || "";
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
        cfg.nickname = inputName.value.trim();
      }
      closeModal();
      playCelebrationFanfare();
    });
  }

  if (window.lucide) lucide.createIcons();
});
