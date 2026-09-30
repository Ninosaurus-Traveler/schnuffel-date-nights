// =========================
// DEMO-MODUS (nur zum Testen des Designs, ohne Supabase)
//   index.html?demo      → tut so, als wäre heute der 8. Dezember
//   index.html?demo=17   → als wäre heute der 17. Dezember
//   index.html?demo=0    → vor dem 1. Dezember (Countdown-Ansicht)
// Die Platzhalter-Inhalte hier sind absichtlich generisch –
// echte Texte und Medien gehören NUR in Supabase.
// =========================

const demoParam = new URLSearchParams(location.search).get("demo");

const demoApi = demoParam === null ? null : (() => {
  const demoDay = Math.max(0, Math.min(26, parseInt(demoParam || "8", 10) || 0));

  // Mitternacht Sri Lanka (UTC+5:30) am jeweiligen Dezembertag
  const unlockAt = day => new Date(Date.UTC(2026, 11, day, 0, 0) - 5.5 * 3600 * 1000);

  const fakeNow = demoDay === 0
    ? new Date(unlockAt(1).getTime() - 3 * 86400 * 1000 - 5 * 3600 * 1000)
    : new Date(unlockAt(demoDay).getTime() + 12 * 3600 * 1000);

  // Zeit läuft im Demo ab dem Laden weiter
  const offset = fakeNow.getTime() - Date.now();
  const now = () => new Date(Date.now() + offset);

  const EMOJI = ["🎄", "⛄", "🍪", "🦌", "🎁", "☕", "🧦", "🌟", "🕯️", "🍊", "🧸", "❄️"];
  const COLORS = [["#C8363D", "#EC7A2E"], ["#F4B942", "#EC7A2E"], ["#962430", "#C8363D"], ["#EC7A2E", "#F4B942"]];

  function placeholder(day, i, portrait) {
    const [a, b] = COLORS[(day + i) % COLORS.length];
    const [w, h] = portrait ? [720, 1280] : [1280, 960];
    const emoji = EMOJI[(day * 3 + i) % EMOJI.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="46%" font-size="${w / 4}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      <text x="50%" y="72%" font-size="${w / 14}" fill="#FFF6E9" text-anchor="middle" font-family="sans-serif">Platzhalter ${day}.${i + 1}</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function fakeDoor(day) {
    const count = 1 + (day % 3);
    const media = Array.from({ length: count }, (_, i) => ({
      type: "image",
      path: placeholder(day, i, i % 2 === 0)
    }));
    return {
      day,
      title: day === 24 ? "Frohe Weihnachten!" : "Grüße aus der Heimat",
      sender: "Platzhalter-Absender",
      message: "Hier steht später eine liebe Nachricht von Freunden oder Familie.\nMit Zeilenumbrüchen und ganz viel Herz 💛",
      media
    };
  }

  return {
    storageKey: "advent-opened-demo",

    async states() {
      const serverNow = now();
      return Array.from({ length: 24 }, (_, i) => {
        const day = i + 1;
        const at = unlockAt(day);
        return { day, unlock_at: at.toISOString(), is_open: at <= serverNow, server_now: serverNow.toISOString() };
      });
    },

    async openDoors() {
      const serverNow = now();
      return Array.from({ length: 24 }, (_, i) => i + 1)
        .filter(day => unlockAt(day) <= serverNow)
        .map(fakeDoor);
    },

    // Platzhalter sind bereits data-URLs
    async sign(paths) {
      return Object.fromEntries(paths.map(p => [p, p]));
    }
  };
})();
