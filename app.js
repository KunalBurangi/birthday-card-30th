(() => {
  const root = document.getElementById('pink-birthday-premiere');
  const photos = [
  {
    "label": "First birthday with Papa",
    "image": "photos/memory-01.webp"
  },
  {
    "label": "First birthday",
    "image": "photos/memory-02.webp"
  },
  {
    "label": "Turning four",
    "image": "photos/memory-03.webp"
  },
  {
    "label": "School annual function",
    "image": "photos/memory-04.webp"
  },
  {
    "label": "Turning eighteen",
    "image": "photos/memory-05.webp"
  },
  {
    "label": "Birthday with friends",
    "image": "photos/memory-06.webp"
  },
  {
    "label": "Birthday in the hostel",
    "image": "photos/memory-07.webp"
  },
  {
    "label": "The pink-hair era",
    "image": "photos/memory-08.webp"
  },
  {
    "label": "First day at work",
    "image": "photos/memory-09.webp"
  },
  {
    "label": "Finishing your master’s",
    "image": "photos/memory-10.webp"
  },
  {
    "label": "Turning twenty-five",
    "image": "photos/memory-11.webp"
  },
  {
    "label": "Birthday in 2025",
    "image": "photos/memory-12.webp"
  }
];
  const art = root.querySelector('.premiere-art');
  const eyebrow = root.querySelector('.premiere-eyebrow');
  const title = root.querySelector('h1');
  const caption = root.querySelector('.premiere-caption');
  const action = root.querySelector('.premiere-action');
  const photoNext = root.querySelector('.photo-next');
  const sound = root.querySelector('.sound');
  const card = root.querySelector('.premiere');
  const micButton = root.querySelector('.mic-action');
  const micStatus = root.querySelector('.mic-status');
  const note = root.querySelector('.book-note');
  const notePanel = root.querySelector('.note-panel');
  const back = root.querySelector('.book-back');
  const place = root.querySelector('.book-place');
  const sky = document.querySelector('.glitter-sky');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [
    { label:'A birthday scrapbook', title:'Happy birthday, love.', text:'For the little girl in the photos and the woman I get to love today.', action:'Open the scrapbook', place:'The cover' },
    { label:'The early years', title:'Little you.', text:'Before I knew you, there were birthdays with Papa and school stages to dress up for.', action:'Turn the page', photos:[[0,1],[2,3]], note:'I think little you would be so proud if she could see you now.', place:'Childhood' },
    { label:'Growing up', title:'Look at you go.', text:'Birthdays with friends, hostel celebrations, and a very good pink-hair era.', action:'Turn the page', photos:[[4,5],[6,7]], note:'For the record, I’m a fan of the pink hair.', place:'Growing up' },
    { label:'All the things you became', title:'And here you are.', text:'Your first day at work, finishing your master’s, and every reason to celebrate you today.', action:'Bring out the cake', photos:[[8,9],[10,11]], note:'I hope you take a moment today to be proud of yourself. I’m proud of you.', place:'Today' },
    { label:'A birthday wish', title:'Make a wish, love.', text:'Blow gently toward your phone’s mic, or tap to make your wish.', action:'Tap to blow out candles', place:'The cake' },
    { label:'A little surprise', title:'Come here, you.', text:'In case I can’t squeeze you right this second.', action:'Open your hug', place:'A hug' },
    { label:'With all my love', title:'P.S. I love you.', text:'Happy birthday, love. I’m so glad there are still so many pages to fill with you.', action:'Read it again', place:'The last page' }
  ];
  let stage = 0;
  let pair = 0;
  let candlesOut = false;
  let hugged = false;
  let noteOpen = false;
  let muted = false;
  let audio;
  let melodyGain;
  let microphone;
  let micRequest = 0;
  let micFrame = 0;
  let earlyStream = null;
  let micPermRequested = false;

  const bgMusic = document.getElementById('bg-music');

  function startBackgroundMusic() {
    if (muted || !bgMusic) return;
    bgMusic.volume = 0.42;
    bgMusic.play().catch(() => {});
  }

  function stopBackgroundMusic() {
    if (bgMusic) bgMusic.pause();
  }

  async function requestMicEarly() {
    if (micPermRequested || !navigator.mediaDevices?.getUserMedia) return;
    micPermRequested = true;
    try {
      earlyStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
    } catch (_) {
      // Permission rejected or not allowed yet
    }
  }

  // Pre-request mic early on first touch / click or load
  window.addEventListener('load', () => {
    requestMicEarly();
  });
  window.addEventListener('pointerdown', () => {
    requestMicEarly();
    startBackgroundMusic();
  }, { once: true });
  window.addEventListener('touchstart', () => {
    requestMicEarly();
    startBackgroundMusic();
  }, { once: true });
  const tune = [
    [67,1],[67,1],[69,2],[67,2],[72,2],[71,3],
    [67,1],[67,1],[69,2],[67,2],[74,2],[72,3],
    [67,1],[67,1],[79,2],[76,2],[72,2],[71,2],[69,3],
    [77,1],[77,1],[76,2],[72,2],[74,2],[72,4]
  ];

  function playBirthday() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (muted || !Audio) return;
    try {
      audio ||= new Audio();
      audio.resume().catch(() => {});
      melodyGain?.disconnect();
      melodyGain = audio.createGain();
      melodyGain.gain.value = .42;
      melodyGain.connect(audio.destination);
      let time = audio.currentTime + .06;
      for (const [note, beats] of tune) {
        const duration = beats * .23;
        const oscillator = audio.createOscillator();
        const volume = audio.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
        volume.gain.setValueAtTime(0, time);
        volume.gain.linearRampToValueAtTime(.18, time + .018);
        volume.gain.exponentialRampToValueAtTime(.001, time + duration * .9);
        oscillator.connect(volume).connect(melodyGain);
        oscillator.start(time);
        oscillator.stop(time + duration);
        time += duration;
      }
    } catch (_) {
      // The card remains usable when audio is unavailable.
    }
  }

  function scatterGlitter() {
    const stars = document.createDocumentFragment();
    for (let i = 0; i < 44; i++) {
      const star = document.createElement('i');
      star.className = i % 4 === 0 ? 'ambient-star flare' : 'ambient-star';
      star.style.setProperty('--star-x', ((i * 37.79 + 4) % 97 + 1) + '%');
      star.style.setProperty('--star-y', ((i * 61.83 + 9) % 95 + 2) + '%');
      star.style.setProperty('--star-size', (2 + (i % 6) * 2) + 'px');
      star.style.setProperty('--star-time', (3.6 + (i % 7) * .54) + 's');
      star.style.animationDelay = -(i % 11) * .57 + 's';
      stars.append(star);
    }
    sky.append(stars);
  }

  function burst(kind = 'hearts') {
    if (reducedMotion.matches) return;
    const count = kind === 'wish' ? 40 : kind === 'note' ? 10 : 24;
    const flurry = document.createElement('div');
    flurry.className = 'flurry flurry-' + kind;
    flurry.setAttribute('aria-hidden', 'true');
    const symbols = kind === 'wish' ? ['✦', '♥', '▪', '✧'] : ['♥', '✧', '✦'];
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = symbols[i % symbols.length];
      const angle = i * 2.39996;
      const radius = (kind === 'wish' ? 105 : 59) + (i % 8) * 14;
      particle.style.setProperty('--travel-x', (Math.cos(angle) * radius).toFixed(1) + 'px');
      particle.style.setProperty('--travel-y', (-50 + Math.sin(angle) * radius).toFixed(1) + 'px');
      particle.style.setProperty('--tilt', ((i % 12 - 5) * 27) + 'deg');
      particle.style.setProperty('--particle-size', (10 + i % 17) + 'px');
      particle.style.animationDelay = (i % 6) * 35 + 'ms';
      flurry.append(particle);
    }
    art.append(flurry);
    setTimeout(() => flurry.remove(), 1740);
  }

  function describeMic(message) {
    micStatus.hidden = !message;
    micStatus.textContent = message;
  }

  function stopMicrophone() {
    micRequest++;
    cancelAnimationFrame(micFrame);
    if (microphone) {
      microphone.stream.getTracks().forEach(track => track.stop());
      microphone.input.disconnect();
      microphone.analyser.disconnect();
      microphone.silentOutput.disconnect();
      microphone = undefined;
    }
    micButton.disabled = false;
    micButton.textContent = 'Enable microphone';
    describeMic('');
  }

  function extinguish() {
    if (stage !== 4 || candlesOut) return;
    candlesOut = true;
    stopMicrophone();
    render(false);
    burst('wish');
  }

  async function listenForBlow() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !Audio) {
      describeMic('Microphone access is unavailable here. Tap to make your wish.');
      return;
    }
    const request = ++micRequest;
    let stream;
    micButton.disabled = true;
    describeMic('Waiting for microphone…');
    try {
      audio ||= new Audio();
      const ready = audio.resume();
      ready.catch(() => {});
      if (earlyStream && earlyStream.active && earlyStream.getAudioTracks().some(t => t.readyState === 'live')) {
        stream = earlyStream;
        earlyStream = null;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
      }
      await ready;
      if (request !== micRequest || stage !== 4 || candlesOut) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      const input = audio.createMediaStreamSource(stream);
      const analyser = audio.createAnalyser();
      const silentOutput = audio.createGain();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = .12;
      silentOutput.gain.value = 0;
      input.connect(analyser);
      analyser.connect(silentOutput);
      silentOutput.connect(audio.destination);
      microphone = { stream, input, analyser, silentOutput };
      micButton.textContent = 'Turn microphone off';
      micButton.disabled = false;
      describeMic('Listening. Blow toward your phone or laptop mic now…');
      const waveform = new Float32Array(analyser.fftSize);
      const spectrum = new Uint8Array(analyser.frequencyBinCount);
      const openedAt = performance.now();
      let background = .008;
      let firstBlowAt = null;
      function sample(now) {
        if (now - openedAt > 60000) {
          stopMicrophone();
          describeMic('Microphone turned off. Tap the cake or button to make your wish.');
          return;
        }
        analyser.getFloatTimeDomainData(waveform);
        let power = 0;
        for (const value of waveform) power += value * value;
        const volume = Math.sqrt(power / waveform.length);
        if (now - openedAt < 600) {
          background = background * .9 + volume * .1;
        } else {
          if (micStatus.textContent !== 'Listening. Blow toward your mic now…' && micStatus.textContent !== 'Listening. Blow toward your phone or laptop mic now…') {
            describeMic('Listening. Blow toward your mic now…');
          }
          analyser.getByteFrequencyData(spectrum);
          const binWidth = audio.sampleRate / analyser.fftSize;
          let spread = 0;
          for (let hz = 450; hz <= 4300; hz += 310) {
            if (spectrum[Math.round(hz / binWidth)] > 60) spread++;
          }
          let lowFreq = 0;
          for (let hz = 80; hz <= 900; hz += 50) {
            lowFreq += spectrum[Math.round(hz / binWidth)] || 0;
          }
          const avgLow = lowFreq / 17;
          const blow = (volume > Math.max(.022, background * 2.5) && spread >= 4) || (avgLow > 55 && volume > .018);
          if (blow) {
            firstBlowAt ??= now;
            if (now - firstBlowAt > 120) {
              extinguish();
              return;
            }
          } else {
            firstBlowAt = null;
            background = background * .99 + Math.min(volume, background * 1.3) * .01;
          }
        }
        micFrame = requestAnimationFrame(sample);
      }
      micFrame = requestAnimationFrame(sample);
    } catch (_) {
      stream?.getTracks().forEach(track => track.stop());
      if (request !== micRequest) return;
      stopMicrophone();
      describeMic('Tap the cake or button to make your wish!');
    }
  }

  function render(animate = true) {
    const scene = scenes[stage];
    card.dataset.scene = stage;
    card.dataset.wish = stage === 4 && candlesOut ? 'made' : 'waiting';
    micButton.hidden = stage !== 4 || candlesOut;
    back.hidden = stage === 0;
    place.textContent = scene.place;
    note.hidden = !scene.note;
    note.textContent = noteOpen ? 'Fold the note' : 'Open a little note';
    note.setAttribute('aria-expanded', String(noteOpen));
    notePanel.hidden = !scene.note || !noteOpen;
    notePanel.textContent = scene.note || '';
    const motion = animate ? ' enter' : '';
    title.textContent = scene.title;
    eyebrow.textContent = scene.label;
    caption.textContent = stage === 4 && candlesOut ? 'Wish made. One last surprise is waiting.' : stage === 5 && hugged ? 'Hug delivered. Save me a real one later.' : scene.text;
    action.textContent = stage === 4 && candlesOut ? 'Open your surprise' : stage === 5 && hugged ? 'Read my birthday note' : scene.action;
    photoNext.hidden = !scene.photos;
    if (scene.photos) {
      photoNext.textContent = pair === 0 ? 'See more photos' : 'Back to the first photos';
      art.innerHTML = '<div class="photo-stack' + motion + '"></div>';
      const stack = art.firstElementChild;
      for (const index of scene.photos[pair]) {
        const photo = photos[index];
        const frame = document.createElement('figure');
        const image = document.createElement('img');
        const name = document.createElement('figcaption');
        const tape = document.createElement('span');
        tape.className = 'tape';
        tape.setAttribute('aria-hidden', 'true');
        image.src = photo.image;
        image.alt = photo.label;
        name.textContent = photo.label;
        frame.append(tape, image, name);
        stack.append(frame);
      }
    } else if (stage === 0) {
      art.innerHTML = '<div class="cover' + motion + '"><figure><span class="tape" aria-hidden="true"></span><img src="photos/memory-12.webp" alt="Birthday portrait from 2025" fetchpriority="high"><figcaption>My favorite person.</figcaption></figure><span class="stamp" aria-hidden="true">♡</span></div>';
    } else if (stage === 4) {
      const candleTop = candlesOut ? '<span class="smoke"></span>' : '<span class="flame"></span>';
      art.innerHTML = '<div class="cake' + motion + '" role="img" aria-label="' + (candlesOut ? 'Birthday cake with extinguished candles' : 'Birthday cake with three lit candles') + '"><div class="candles">' + ('<span class="candle">' + candleTop + '</span>').repeat(3) + '</div><div class="cake-top"></div><div class="cake-base"></div><div class="plate"></div></div>';
    } else {
      art.innerHTML = '<div class="heart-card' + motion + '" aria-hidden="true">' + (hugged ? '♥' : '♡') + '</div>';
    }
  }

  function openPage(next) {
    if (stage === 4) stopMicrophone();
    stage = next;
    pair = 0;
    noteOpen = false;
    if (stage === 0) {
      candlesOut = false;
      hugged = false;
      melodyGain?.disconnect();
      melodyGain = null;
    }
    render();
    if (!reducedMotion.matches && art.animate) {
      art.animate([
        { clipPath:'inset(0 0 0 18% round 10px)' },
        { clipPath:'inset(0 -15% 0 -15% round 10px)' }
      ], { duration:430, easing:'cubic-bezier(.22,.82,.25,1)' });
    }
    window.scrollTo(0, 0);

    if (stage === 4 && !candlesOut) {
      setTimeout(() => {
        listenForBlow();
      }, 300);
    }
  }

  // Allow tapping on the cake artwork directly to make a wish / extinguish
  art.addEventListener('click', () => {
    if (stage === 4 && !candlesOut) {
      extinguish();
    }
  });

  action.addEventListener('click', () => {
    startBackgroundMusic();
    if (stage === 4 && !candlesOut) {
      extinguish();
      return;
    }
    if (stage === 5 && !hugged) {
      hugged = true;
      render();
      burst();
      return;
    }
    openPage((stage + 1) % scenes.length);
    if (stage === 1 || stage === 6) burst();
    if (stage === 4) playBirthday();
  });
  back.addEventListener('click', () => {
    if (stage === 4) {
      melodyGain?.disconnect();
      melodyGain = null;
    }
    openPage(Math.max(0, stage - 1));
  });
  note.addEventListener('click', () => {
    noteOpen = !noteOpen;
    render(false);
    if (noteOpen) {
      burst('note');
      notePanel.scrollIntoView({ block:'nearest' });
    }
  });
  photoNext.addEventListener('click', () => {
    pair = 1 - pair;
    render();
  });
  sound.addEventListener('click', () => {
    muted = !muted;
    sound.textContent = muted ? 'Sound off' : 'Sound on';
    sound.setAttribute('aria-pressed', String(!muted));
    if (muted) {
      stopBackgroundMusic();
      if (melodyGain) melodyGain.gain.value = 0;
    } else {
      startBackgroundMusic();
      if (melodyGain) melodyGain.gain.value = 0.42;
      else if (stage === 4) playBirthday();
    }
  });
  micButton.addEventListener('click', () => {
    if (microphone) stopMicrophone();
    else listenForBlow();
  });

  // Swipe / gesture navigation
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  window.addEventListener('touchstart', (e) => {
    requestMicEarly();
    startBackgroundMusic();
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = performance.now();
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const elapsed = performance.now() - touchStartTime;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && elapsed < 750) {
      if (deltaX < 0) {
        if (stage < scenes.length - 1) openPage(stage + 1);
      } else {
        if (stage > 0) openPage(stage - 1);
      }
    }
    touchStartX = 0;
    touchStartY = 0;
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    startBackgroundMusic();
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (e.target.tagName !== 'BUTTON' && stage < scenes.length - 1) {
        openPage(stage + 1);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (e.target.tagName !== 'BUTTON' && stage > 0) {
        openPage(stage - 1);
      }
    }
  });
  window.addEventListener('pagehide', stopMicrophone);
  scatterGlitter();
  render(false);
})();
