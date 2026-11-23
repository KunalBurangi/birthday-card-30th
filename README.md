# 🎂 30th Birthday Scrapbook & Interactive E-Card

A handcrafted, interactive Polaroid & Scrapbook web experience celebrating her milestone 30th birthday on November 30!

---

## ✨ Features Included
1. **Interactive Wax Seal Envelope Unwrapping**: Tap the vintage 3D wax seal to unwrap the card with a sound fanfare and sparkling confetti.
2. **Interactive 30-Candle Cake with Real Breath Detection**:
   - 30 individual glowing, flickering candles.
   - **Real Microphone Blow Detection 🎙️**: Tap **"Blow Into Your Mic! 🎙️💨"** and physically blow onto your phone or laptop microphone!
   - Real-time wind feedback: the candle flames bend and flicker violently in response to breath volume!
   - Once blown, realistic smoke puff animations rise from the wicks, celebratory fanfare plays, and a grand multi-burst confetti celebration triggers!
   - Also includes a manual **"Tap To Blow"** button as an instant fallback.
3. **Polaroid Scrapbook Memory Wall**:
   - 6 Polaroid photos pinned with washi tape and realistic drop-shadows.
   - Click any Polaroid to flip it and read the memory, date, and sweet story behind it.
4. **"30 Reasons Why I Love You" Flip Cards**:
   - 30 numbered interactive cards (#1 to #30) with thoughtful, romantic reasons.
   - Interactive progress bar tracking how many she's opened + "Reveal All" button.
5. **The Secret Parchment Love Letter**:
   - Beautiful lined letter celebrating entering Chapter 30 with deep affection and pride.
6. **Background Music Soundtrack**:
   - Soft romantic acoustic piano track with a retro vinyl player widget (Play/Pause/Mute).
   - Built-in Web Audio API fallback synthesizer so sound works anywhere, even offline.

---

## 🚀 How to Preview & Open

You can view it right now by simply opening `index.html` in your browser:

### Option A: Open directly in your browser
Double-click `index.html`, or run in terminal:
```bash
open /Users/kunal/.gemini/antigravity/scratch/birthday-card-30th/index.html
```

### Option B: Local web server
```bash
cd /Users/kunal/.gemini/antigravity/scratch/birthday-card-30th
python3 -m http.server 3000
```
Then visit: `http://localhost:3000`

---

## 🎨 How to Personalize for Her

Everything is centralized inside `config.js`:

1. **Her Name & Nickname**:
   Open `config.js` and edit `girlfriendName: "Sarah"` and `nickname: "My Sunshine"`.
   *(Or click the "Personalize Card" button directly on the website to preview live).*

2. **Your Own Photos**:
   Simply place your photos inside the `images/` directory:
   - `images/photo1.jpg`
   - `images/photo2.jpg`
   - `images/photo3.jpg`
   - `images/photo4.jpg`
   - `images/photo5.jpg`
   - `images/photo6.jpg`
   *(If a local photo is not found, it seamlessly uses high-resolution romantic placeholder photography).*
   You can also customize the captions, dates, and memory notes in `config.js`.

3. **30 Reasons & Love Letter**:
   Edit or add your own personal inside jokes and memories inside the `reasons` list and `letter` object in `config.js`.

---

## 🎁 How to Share It With Her on Nov 30

- **Send as a Link (Free & Easy)**:
  - You can drag & drop this folder onto **[Netlify Drop](https://app.netlify.com/drop)** or **Vercel** to get an instant free URL like `https://sarah-turns-30.netlify.app` that she can open on her phone or laptop!
  - Or host it via GitHub Pages.
- **Or open it in full screen** on her birthday morning on an iPad or laptop next to breakfast!
