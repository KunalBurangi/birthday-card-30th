// ==============================================================================
// 💖 30TH BIRTHDAY CARD CONFIGURATION
// Customize her name, photos, 30 reasons, and love letter right here!
// ==============================================================================

window.BIRTHDAY_CONFIG = {
  // --- Personal Details ---
  girlfriendName: "Birthday Queen", // Change to her actual name (e.g. "Sarah", "Emily", "Priya")
  nickname: "My Sunshine",           // Cute pet name used in the letter & scrapbook
  birthDate: "1996-11-30",          // 30th Birthday on Nov 30!
  turningAge: 30,
  
  // --- Background Music ---
  // Charming Music Box & Piano rendition of "Happy Birthday to You"
  musicUrl: "happy-birthday.m4a",
  musicFallbackUrl: "happy-birthday.wav",
  musicTitle: "Happy Birthday to You 🎂🎵",

  // --- Photo Memories (Polaroids) ---
  // To use your own photos: drop photos in the `images/` folder as photo1.jpg, photo2.jpg, etc.
  // If local file isn't found, it seamlessly falls back to high-res aesthetic placeholders.
  polaroids: [
    {
      src: "images/photo1.jpg",
      fallback: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80",
      caption: "That unforgettable sunset together ✨",
      note: "The day I realized my favorite view is always looking at you.",
      date: "Summer Getaway",
      rotation: -3
    },
    {
      src: "images/photo2.jpg",
      fallback: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
      caption: "Our coffee & long conversation dates ☕",
      note: "Hours fly by like seconds whenever we are talking.",
      date: "Our Favorite Sunday",
      rotation: 2.5
    },
    {
      src: "images/photo3.jpg",
      fallback: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      caption: "That radiant smile of yours 💖",
      note: "Lighting up every room you ever step into.",
      date: "Golden Hour Magic",
      rotation: -2
    },
    {
      src: "images/photo4.jpg",
      fallback: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      caption: "Adventures & spontaneous road trips 🚗",
      note: "Anywhere with you is my favorite destination.",
      date: "Weekend Escape",
      rotation: 3
    },
    {
      src: "images/photo5.jpg",
      fallback: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&q=80",
      caption: "Celebrating your glow & elegance ✨",
      note: "Stepping into 30 more gorgeous, confident, and magnetic than ever.",
      date: "Sweet Moments",
      rotation: -1.5
    },
    {
      src: "images/photo6.jpg",
      fallback: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
      caption: "Forever my favorite person to laugh with 🥂",
      note: "Cheers to you, to us, and to the best decade ahead!",
      date: "Here's to Chapter 30",
      rotation: 2
    }
  ],

  // --- 30 Reasons Why I Love You ---
  // Thoughtfully curated for turning 30!
  reasons: [
    "The way your eyes crinkle with pure joy when you genuinely laugh.",
    "Your fierce kindness and how deeply you care for the people you love.",
    "How safe and completely at peace I feel every time you hold my hand.",
    "Your passionate energy when talking about things that excite you.",
    "The way you make even a boring grocery run feel like a fun date.",
    "Your radiant smile that can turn my worst days completely around.",
    "How incredibly smart, driven, and capable you are in everything you do.",
    "The cute silly dances you do when delicious food arrives.",
    "How you always remember the tiniest details about everyone.",
    "The way you look in oversized hoodies with a warm cup of coffee.",
    "Your endless patience and the emotional warmth you bring into my world.",
    "The way you sing your heart out in the car like nobody's watching.",
    "Your intuition and emotional intelligence—you understand me without words.",
    "The soft, gentle way you wake up in the morning.",
    "How brave you are when facing new challenges and stepping outside your comfort zone.",
    "Our midnight conversations that meander from deep philosophy to goofy memes.",
    "The little forehead kisses and spontaneous hugs out of nowhere.",
    "How stunning and magnetic you look, whether dressed up or in pajamas.",
    "The way you support my wildest dreams and believe in me even when I doubt myself.",
    "Your sense of style, elegance, and effortless grace.",
    "How you turn any space into a cozy, warm, and loving home.",
    "The funny faces and secret glances we exchange across a crowded room.",
    "Your sense of humor and the silly inside jokes only the two of us understand.",
    "How passionate you are about justice, empathy, and doing the right thing.",
    "The comforting warmth of resting my head on your shoulder.",
    "How you inspire me every single day to be a better partner and human.",
    "The way you celebrate the small wins in life with genuine excitement.",
    "Your infectious optimism that reminds me there's always something to look forward to.",
    "How beautiful it is watching you grow into this confident, breathtaking woman.",
    "That of all the 8 billion people on this planet, I get to love and be loved by you."
  ],

  // --- The Secret Love Letter ---
  letter: {
    salutation: "To My Dearest,",
    paragraphs: [
      "Happy 30th Birthday! 🎂✨",
      "They say your thirties are the golden decade—the years where you truly know your worth, embrace your magic, and bloom into your fullest power. Looking at the woman you are today, I already know this decade is going to be your most extraordinary yet.",
      "Thank you for being my anchor, my greatest adventure, and my favorite reason to smile. Every single day with you is a gift I never take for granted. You bring so much light, laughter, and grace to my world.",
      "As you blow out your 30 candles today, know that I am right beside you—cheering for every dream of yours, holding your hand through every chapter, and falling deeper in love with you with each passing year.",
      "Here is to leaving your twenties with pride, stepping into 30 with pure confidence, and writing the most magical story together."
    ],
    signoff: "All my love, forever and always,",
    signature: "Yours ❤️"
  }
};
