# Altar artwork provenance

`altar-scene-original.jpg` is the unmodified master from audit commit
`cf8600244327aa4c09e141378d0cf3e15a772b39`. It is preserved outside `public/`
because it contains seven painted plus buttons and a painted question bar.

`public/altar-clean.webp` is an AI-assisted edit of that master using the built-in
ImageGen tool. The edit removes the seven plus controls and bottom question bar,
retains the altar composition and lighting, and replaces the small orange pitcher
beside the lower-tier decorative bottle with a modest unlit glass of water.
This is conceptual artwork, not a documentary photograph. No external imagery
was used. The original portrait and principal offerings remain recognizable.

Edit prompt: remove all seven circular plus-sign overlays and all bottom UI,
restore underlying textures, floor and petals; preserve the portrait, tiers,
flowers, candles, bread, paper, copal/smoke, skulls, pottery, church, atmosphere
and composition; replace only the small orange pitcher immediately right of the
lower-tier clear decorative bottle with a clear half-full water glass; no text,
symbols, UI, watermark or extra decoration.

The clean master is 1147 × 1371. Detail WebP crops use these pixel bounds
`(left, top, right, bottom)`; they are displayed with `object-fit: contain`.

| Offering | Bounds |
| --- | --- |
| Marigolds | 190, 40, 855, 310 |
| Portrait | 435, 235, 645, 495 |
| Candles | 600, 585, 802, 765 |
| Bread | 260, 620, 510, 775 |
| Paper | 805, 777, 1045, 902 |
| Copal | 397, 745, 665, 1090 |
| Water | 688, 903, 848, 1093 |

The browser tests annotate object regions independently and compare the rendered
clean image with reviewed screenshot baselines. Bitmap content still requires
human review whenever those baselines or the artwork change.
