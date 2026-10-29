// Crops from altar-clean.webp, reviewed individually; no embedded image data.
export const illustrations = Object.fromEntries(
  ["flowers", "photo", "candles", "bread", "paper", "copal", "water"].map((id) => [
    id, `<img class="offering-art" src="/crop-${id}.webp" alt="" decoding="async">`
  ])
);
