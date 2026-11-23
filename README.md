# 🎂 30th Birthday Multi-Page Interactive Greeting Card

A handcrafted, interactive multi-page greeting card book celebrating her milestone 30th birthday on November 30!

---

## ✨ Features Included
1. **Interactive Multi-Page Card (Card Book)**:
   - **Page 1: The Card Cover** (Airmail wax seal unsealing, Chapter 30 milestones).
   - **Page 2: The 30-Candle Cake** (Blow out 30 candles with real microphone breath detection!).
   - **Page 3: Polaroid Scrapbook** (6 flip polaroids with memories & dates).
   - **Page 4: 30 Reasons Why I Love You** (30 interactive unlockable cards).
   - **Page 5: The Secret Love Letter** (Parchment letter & finale confetti).
2. **Gesture Page Turning**:
   - Swipe left / right on mobile screens.
   - Click `< Prev` / `Next >` buttons or direct page dots.
   - Use keyboard Arrow keys (`←` and `→`).
3. **Instant Microphone Permission**:
   - Asks for microphone permission right upon opening the card.
   - When she turns to **Page 2 (The Cake)**, the microphone is already armed and listening! She can blow directly onto her phone/laptop screen without pressing any button!
4. **Romantic Soundtrack**:
   - Soft acoustic piano background music with a spinning vinyl record player widget.

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
