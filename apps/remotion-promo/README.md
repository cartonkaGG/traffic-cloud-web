# Traffic Cloud — Remotion promo

18s marketing video (1280×720, 30fps) for the homepage.

## Preview

```bash
npm run studio
```

## Re-render assets

```bash
npm install
npm run render
npm run render:webm
npx remotion still TrafficCloudPromo ../marketing/public/promo/traffic-cloud-promo-poster.jpg --frame=45 --scale=0.5
```

## Hide video on the site

Set `heroPromoVideo: false` in `apps/marketing/src/config/features.ts`.
