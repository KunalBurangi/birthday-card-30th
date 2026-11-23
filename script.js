// ==============================================================================
// 💖 30TH BIRTHDAY CARD APPLICATION LOGIC (MULTI-PAGE & EARLY MIC)
// ==============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.BIRTHDAY_CONFIG || {};

  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  let currentPage = 1;
  const totalPages = 5;
  const pageTitles = [
    "The Cover",
    "The Birthday Cake",
    "Memory Scrapbook",
    "30 Reasons",
    "The Love Letter"
  ];

  let audioPlaying = false;
  let audioContext = null;
  let blownCandlesCount = 0;
  const totalCandles = 30;
  let revealedReasonsCount = 0;

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
        console.log("Audio fallback to WAV format");
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
        console.log("Audio autoplay prevented, ready on gesture:", err);
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
  async function requestMicPermissionEarly() {
    if (micPermissionRequested) return;
    micPermissionRequested = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Microphone access not supported on this browser.");
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!micAudioContext && AudioCtx) {
      micAudioContext = new AudioCtx();
    }

    const audioConstraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      video: false
    };

    try {
      // Prompt browser permission immediately
      micStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      console.log("Microphone access pre-authorized successfully!");

      // If user is already on Cake page or moves to it, connect immediately
      if (currentPage === 2) {
        setupAndStartMic();
      }
    } catch (err) {
      console.log("Early mic request waiting for interaction or basic constraints:", err);
      // Fallback: try on first user click anywhere
      window.addEventListener("pointerdown", () => {
        if (!micStream) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
            micStream = s;
            if (currentPage === 2) setupAndStartMic();
          }).catch(e => console.warn("Mic denied:", e));
        }
        if (micAudioContext && micAudioContext.state === "suspended") {
          micAudioContext.resume();
        }
      }, { once: true });
    }
  }

  // Request mic permission on page load
  requestMicPermissionEarly();

  // Resume AudioContext on first touch/click anywhere
  window.addEventListener("pointerdown", () => {
    if (micAudioContext && micAudioContext.state === "suspended") {
      micAudioContext.resume();
    }
    startMusic();
  }, { once: true });

  // ---------------------------------------------------------------------------
  // 2. MULTI-PAGE CARD BOOK NAVIGATION (GESTURES, TAPS, ARROWS)
  // ---------------------------------------------------------------------------
  const cardPages = document.querySelectorAll(".card-page");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const pageTitleLabel = document.getElementById("page-title-label");
  const navDots = document.querySelectorAll(".nav-dot");
  const cardBook = document.getElementById("card-book");

  function goToPage(pageIndex) {
    if (pageIndex < 1 || pageIndex > totalPages) return;
    currentPage = pageIndex;

    // Update active page
    cardPages.forEach((page) => {
      const pageNum = parseInt(page.dataset.page, 10);
      if (pageNum === currentPage) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });

    // Update nav label & dots
    if (pageTitleLabel) {
      pageTitleLabel.textContent = `Page ${currentPage} of ${totalPages}: ${pageTitles[currentPage - 1]}`;
    }

    navDots.forEach((dot) => {
      const target = parseInt(dot.dataset.pageTarget, 10);
      if (target === currentPage) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // Update Prev / Next buttons disabled states
    if (prevPageBtn) prevPageBtn.disabled = (currentPage === 1);
    if (nextPageBtn) nextPageBtn.disabled = (currentPage === totalPages);

    // Scroll smoothly to top of card container on mobile
    if (cardBook) {
      const yOffset = -20;
      const y = cardBook.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }

    // Play subtle page turn chime
    playSyntheticChime(400 + currentPage * 40, 0.15);

    // If navigated to Page 2 (Cake), automatically activate microphone listening!
    if (currentPage === 2) {
      if (blownCandlesCount < totalCandles) {
        setupAndStartMic();
      }
    } else {
      // Pause mic processing on other pages to preserve CPU/battery
      pauseMicListening();
    }
  }

  function nextPage() {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  }

  function prevPage() {
    if (currentPage > 1) goToPage(currentPage - 1);
  }

  if (nextPageBtn) nextPageBtn.addEventListener("click", nextPage);
  if (prevPageBtn) prevPageBtn.addEventListener("click", prevPage);

  // Clickable Navigation Dots
  navDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = parseInt(dot.dataset.pageTarget, 10);
      if (target) goToPage(target);
    });
  });

  // "Next Page" in-content action buttons
  document.querySelectorAll(".next-page-trigger").forEach((btn) => {
    btn.addEventListener("click", nextPage);
  });

  // Cover Wax Seal open button
  const coverOpenBtn = document.getElementById("cover-open-btn");
  if (coverOpenBtn) {
    coverOpenBtn.addEventListener("click", () => {
      playCelebrationFanfare();
      if (typeof confetti === "function") {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
      goToPage(2);
    });
  }

  // Final page "Read Again" button
  const backToCoverBtn = document.getElementById("back-to-cover-btn");
  if (backToCoverBtn) {
    backToCoverBtn.addEventListener("click", () => goToPage(1));
  }

  // Keyboard navigation (Arrow keys)
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") nextPage();
    if (e.key === "ArrowLeft" || e.key === "PageUp") prevPage();
  });

  // ---------------------------------------------------------------------------
  // TOUCH / SWIPE GESTURES FOR PAGE TURNING
  // ---------------------------------------------------------------------------
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  if (cardBook) {
    cardBook.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    cardBook.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Horizontal swipe threshold: 45px, dominant over vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0) {
        nextPage(); // Swiped left -> next page
      } else {
        prevPage(); // Swiped right -> prev page
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. PAGE 2: 30-CANDLE CAKE & REAL-TIME BLOW DETECTION
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

  // Setup & connect microphone stream to analyser
  async function setupAndStartMic() {
    if (isListeningToMic) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!micAudioContext && AudioCtx) {
        micAudioContext = new AudioCtx();
      }
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
        micStatusText.innerHTML = "🎙️ Mic Active: <strong>Blow onto your screen/mic now!</strong> 🌬️";
      }

      processMicAudio();
    } catch (err) {
      console.log("Mic activation notice:", err);
      if (micStatusText) {
        micStatusText.innerHTML = "Tap <em>'Or Tap To Blow'</em> below if mic is blocked!";
      }
    }
  }

  function pauseMicListening() {
    isListeningToMic = false;
    if (micAnimId) {
      cancelAnimationFrame(micAnimId);
      micAnimId = null;
    }
    document.querySelectorAll(".candle-flame").forEach((f) => {
      f.classList.remove("fluttering");
      f.style.removeProperty("--blow-angle");
    });
  }

  function processMicAudio() {
    if (!isListeningToMic || !micAnalyser) return;

    // Time domain RMS calculation
    const timeData = new Float32Array(micAnalyser.fftSize);
    micAnalyser.getFloatTimeDomainData(timeData);
    let sumSq = 0;
    for (let i = 0; i < timeData.length; i++) {
      sumSq += timeData[i] * timeData[i];
    }
    const rms = Math.sqrt(sumSq / timeData.length);

    // Low-frequency wind energy calculation
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

    // Real-time flame physics
    if (breathScore > 8) {
      const angle = Math.min(42, breathScore * 1.2);
      flames.forEach((f) => {
        f.classList.add("fluttering");
        f.style.setProperty("--blow-angle", `-${angle}deg`);
      });

      if (breathScore > 20) {
        breathAccumulator += breathScore * 0.12;
      }
    } else {
      flames.forEach((f) => f.classList.remove("fluttering"));
      breathAccumulator = Math.max(0, breathAccumulator - 0.4);
    }

    // Trigger blowout condition
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

    cakeStage.addEventListener("mousemove", (e) => {
      handleCakeTilt(e.clientX, e.clientY);
    });

    cakeStage.addEventListener("mouseleave", () => {
      cake3D.style.transform = "rotateX(10deg) rotateY(0deg)";
    });

    cakeStage.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        handleCakeTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    cakeStage.addEventListener("touchend", () => {
      cake3D.style.transform = "rotateX(10deg) rotateY(0deg)";
    });
  }

  // ---------------------------------------------------------------------------
  // 4. PAGE 3: POLAROID MEMORY LANE
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 5. PAGE 4: 30 REASONS WHY I LOVE YOU
  // ---------------------------------------------------------------------------
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
        }, idx * 45);
      });
    });
  }

  renderReasons();

  // ---------------------------------------------------------------------------
  // 6. PAGE 5: THE SECRET LOVE LETTER & FINALE
  // ---------------------------------------------------------------------------
  function applyPersonalization() {
    const name = cfg.girlfriendName || "My Love";
    const nick = cfg.nickname || name;

    const coverName = document.getElementById("cover-name");
    const salutation = document.getElementById("letter-salutation");
    const letterBody = document.getElementById("letter-body");
    const signoff = document.getElementById("letter-signoff");
    const signature = document.getElementById("letter-signature");

    if (coverName) coverName.textContent = `${nick}!`;
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

  const finalConfettiBtn = document.getElementById("final-confetti-btn");
  if (finalConfettiBtn) {
    finalConfettiBtn.addEventListener("click", () => {
      playCelebrationFanfare();
      if (typeof confetti === "function") {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 }
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. QUICK CUSTOMIZER MODAL
  // ---------------------------------------------------------------------------
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
      if (inputName.value.trim()) cfg.girlfriendName = inputName.value.trim();
      if (inputNickname.value.trim()) cfg.nickname = inputNickname.value.trim();
      applyPersonalization();
      closeModal();
      playCelebrationFanfare();
    });
  }

  // Initialize Lucide Icons
  if (window.lucide) lucide.createIcons();
});
