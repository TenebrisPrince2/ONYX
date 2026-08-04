// src/lib/icons.tsx
import React from 'react';
const P: Record<string, React.ReactNode> = {
  close: <path d="M6 6l12 12M18 6L6 18" />, plus: <path d="M12 5v14M5 12h14" />, minus: <path d="M5 12h14" />,
  back: <path d="M14 6l-6 6 6 6" />, chevR: <path d="M10 6l6 6-6 6" />, chevD: <path d="M6 10l6 6 6-6" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></>,
  pie: <><path d="M12 3a9 9 0 1 0 9 9h-9V3z" /><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z" /></>,
  chart: <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" />,
  coins: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8l1.5 2.6 3-.6 1 2.8 2.9 1 -.3 3 2.1 2.4-2.1 2.4.3 3-2.9 1-1 2.8-3-.6L12 21.2l-1.5-2.6-3 .6-1-2.8-2.9-1 .3-3L2.8 12l2.1-2.4-.3-3 2.9-1 1-2.8 3 .6z" /></>,
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h13v3" /><rect x="3" y="7" width="18" height="12" rx="2.5" /><path d="M16 12.5h5v3h-5a1.5 1.5 0 0 1 0-3z" /></>,
  bank: <path d="M3 9l9-5 9 5M4 9v10m4-10v10m4-10v10m4-10v10m4-10v10M2 21h20" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4m8-4v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
  grip: <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  arrowUR: <path d="M7 17L17 7M9 7h8v8" />, arrowDL: <path d="M17 7L7 17M15 17H7V9" />,
  swap: <path d="M4 8h13l-3-3m6 10H7l3 3" />, plusminus: <path d="M8 5v6M5 8h6M5 17h14M12 14v6" />,
  flame: <path d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0C7 9 9 7 9 7s0 3 1.5 3S12 3 12 3z" />,
  umbrella: <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9zm0 9v7a2 2 0 0 0 4 0" />,
  bag: <path d="M6 8h12l1.5 12h-15L6 8zm3 0a3 3 0 0 1 6 0" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  trash: <path d="M4 7h16M9 7V4h6v3m-9 0l1 13h10l1-13M10 11v6m4-6v6" />,
  pencil: <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z" />,
  sort: <path d="M7 4v12m0 4l-3-4m3 4l3-4M17 20V8m0-4l3 4m-3-4l-3 4" />,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  download: <path d="M12 3v11m0 0l-4-4m4 4l4-4M4 20h16" />, upload: <path d="M12 14V3m0 0L8 7m4-4l4 4M4 20h16" />,
  database: <><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5M4 12v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V12" /></>,
  heart: <path d="M12 20s-7.5-4.7-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 11c-1.8 4.3-9.3 9-9.3 9z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 7l9 6 9-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.2 3.8 8.5s-1.3 6.2-3.8 8.5c-2.5-2.3-3.8-5.2-3.8-8.5s1.3-6.2 3.8-8.5z" /></>,
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6m4 9a2.2 2.2 0 0 0 4 0" />,
  palette: <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.4-2-.8-1.4.2-3 2-3H17a4 4 0 0 0 4-4c0-5-4-9-9-9zM7.5 11h.01M11 7.5h.01M15.5 8.5h.01" />,
  voice: <path d="M4 13a8 8 0 0 1 16 0M4 13v4m16-4v4M9 13h6" />,
  calc: <><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M8.5 7h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 12v0" /></>,
  dots: <path d="M12 6h.01M12 12h.01M12 18h.01" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4" />,
  star: <path d="M12 4l2.4 5 5.6.7-4 3.9 1 5.4-5-2.7-5 2.7 1-5.4-4-3.9L9.6 9z" />,
  slash: <><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" transform="rotate(90 12 12)" /></>,
  home: <path d="M4 11l8-7 8 7v9a1.5 1.5 0 0 1-1.5 1.5H14v-7h-4v7H5.5A1.5 1.5 0 0 1 4 20v-9z" />,
  car: <path d="M4 16l1.5-5.5A2 2 0 0 1 7.4 9h9.2a2 2 0 0 1 1.9 1.5L20 16m-16 0h16m-16 0v3m16-3v3M7 16h.01M17 16h.01" />,
  plane: <path d="M10 21l2-6-6-2 12-8-3 12 6 2" transform="rotate(8 12 12)" />,
  train: <><rect x="5" y="4" width="14" height="13" rx="3" /><path d="M5 11h14M9 21l-1.5-4m9 4L15 17M9.5 14.5h.01m5 0h.01" /></>,
  bus: <><rect x="4" y="4" width="16" height="13" rx="2.5" /><path d="M4 11h16M8 20v-3m8 3v-3M8 14h.01m8 0h.01" /></>,
  fuel: <path d="M5 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15m-10 0h10m0-8l3-2v7a1.5 1.5 0 0 1-3 0M8 8h4" />,
  parking: <><circle cx="12" cy="12" r="8.5" /><path d="M10 16v-8h3a2.5 2.5 0 0 1 0 5h-3" /></>,
  bike: <><circle cx="6" cy="16" r="3.2" /><circle cx="18" cy="16" r="3.2" /><path d="M6 16l3-7h6m3 7l-3.5-7M12 16l-1.5-4" /></>,
  bolt: <path d="M13 2L5 13h5l-1 9 8-11h-5l1-9z" />,
  key: <><circle cx="8" cy="14" r="4" /><path d="M11 11l9-9m-3 3l3 3" /></>,
  bulb: <path d="M9 18a7 7 0 1 1 6 0v2H9v-2zm0 4h6" />,
  sofa: <path d="M5 10V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2m-16 0a2 2 0 0 0-2 2v4h20v-4a2 2 0 0 0-2-2m-14 0v3h14v-3" />,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  heartPulse: <path d="M12 20s-7.5-4.7-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 11c-1.8 4.3-9.3 9-9.3 9zM7 12h3l1.5-2.5 2 4L15 11h2" />,
  pill: <><rect x="3" y="9" width="18" height="7" rx="3.5" transform="rotate(-40 12 12.5)" /><path d="M8.5 8l7 7" /></>,
  steth: <path d="M6 3v6a4 4 0 0 0 8 0V3m4 10a2.5 2.5 0 0 0-5 0v3a4 4 0 0 1-8 0v-2m13-1h.01" />,
  gamepad: <path d="M7 8h10a4 4 0 0 1 4 4v3a3 3 0 0 1-5.5 1.7L14 15h-4l-1.5 1.7A3 3 0 0 1 3 15v-3a4 4 0 0 1 4-4zm1 3v4m-2-2h4m7-1h.01m3 2h.01" />,
  film: <><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M8 4v16m8-16v16M4 9h4m8 0h4M4 15h4m8 0h4" /></>,
  music: <path d="M9 18V6l10-2v11.5M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm10-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />,
  ticket: <path d="M4 7h16v3.5a2 2 0 0 0 0 3V17H4v-3.5a2 2 0 0 0 0-3V7zm10 0v10" />,
  book: <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zm0 0v13m4 4v-4" />,
  cap: <path d="M2 9l10-4 10 4-10 4L2 9zm4 3v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5m4-3v6" />,
  map: <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zm0 0v14m6-12v14" />,
  hotel: <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16m-16 0h16M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />,
  cart: <path d="M4 5h2l2.2 10.5A2 2 0 0 0 10.2 17H18a2 2 0 0 0 2-1.6L21 9H7m3 11h.01M18 20h.01" />,
  tag: <path d="M3 11V4h7l10 10-7 7L3 11zm5-3h.01" />,
  gift: <path d="M4 10h16v10H4V10zm8 0v10M12 10H7.5a2.5 2.5 0 0 1 0-5C11 5 12 10 12 10zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 5 12 10 12 10z" />,
  shirt: <path d="M8 4l-5 4 2.5 3L8 9v11h8V9l2.5 2L21 8l-5-4a4 4 0 0 1-8 0z" />,
  phone: <><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></>,
  paw: <path d="M12 12c2.8 0 5.5 2.2 5.5 5 0 1.7-1.2 3-3 3-1 0-1.7-.4-2.5-.4s-1.5.4-2.5.4c-1.8 0-3-1.3-3-3 0-2.8 2.7-5 5.5-5zM7 9h.01M12 7h.01M17 9h.01" />,
  leaf: <path d="M5 19C5 9 13 4 20 4c0 8-4 15-13 15m-2 1c2-4 5-8 9-10" />,
  wrench: <path d="M14 6a4.5 4.5 0 0 1 6 4.2L17 13l-3-3 2.8-3A4.5 4.5 0 0 1 14 6zM14 10L4 20" />,
  cloud: <path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.2 10 4 4 0 0 1 17.5 18H7z" />,
  apple: <path d="M12 7c1-2.5 3-3 4.5-3 0 0 .5 2-1.5 3M12 7c-1-2.5-3-3-4.5-3 0 0-.5 2 1.5 3M12 7v1m0 0c-3-1.5-6 .5-6 4.5S9 21 12 21s6-4.5 6-8.5-3-6-6-4.5z" />,
  bottle: <path d="M10 3h4v3l1.5 2.5V21h-7V8.5L10 6V3zm-1.5 9h7" />,
  candy: <path d="M9 9a4.5 4.5 0 1 0 6 6 4.5 4.5 0 0 0-6-6zM9 9l-2-2m2 4H5m10-2l2-2m-2 4h4" />,
  chef: <path d="M8 8a3.5 3.5 0 0 1 .5-7c1 0 2 .5 2.5 1a3.5 3.5 0 0 1 6 2.5A3 3 0 0 1 16 8v6H8V8zm0 6v6h8v-6M8 17h8" />,
  coffee: <path d="M5 8h11v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8zm11 1h2a2.5 2.5 0 0 1 0 5h-2M8 4v1.5m4-1.5v1.5" />,
  meat: <path d="M15 4a5 5 0 0 1 5 5c0 3-2.5 4-5 4l-6 6a2.2 2.2 0 0 1-4-1 2.2 2.2 0 0 1 1-4l6-6c0-2.5 1-4 3-4z" />,
  skewer: <path d="M4 20L20 4m-3-1l1 1m-6 3l3 3m-6 0l3 3m-6 0l3 3" />,
  salad: <path d="M4 12h16a8 8 0 0 1-16 0zm4-2c0-3 2-5 4-6m0 6c0-2 1.5-4 4-5" />,
  cutlery: <path d="M7 3v7a2 2 0 0 1-2 2m2-9v18M5 3v4m4-4v4M15 3c2 0 3 2.5 3 5s-1 4-3 4v9m0-18v9" />,
  eggFried: <path d="M12 5a7 7 0 0 1 7 7c0 4-3 7-7 7s-7-3-7-7c0-2 1-4 2.5-5M12 10a2.5 2.5 0 1 0 .01 0z" />,
  noodles: <path d="M4 11h16a8 8 0 0 1-16 0zm3-2c1-3 3-5 5-6m1 6c1-2 2.5-4 5-5m-8 5l6-8" />,
  cherry: <path d="M9 14a3 3 0 1 0 .01 0zm8 1a3 3 0 1 0 .01 0zM9 14c0-5 3-8 7-10m1 11c0-4-1-7-4-9" />,
  egg: <path d="M12 3c4 4.5 6 8.5 6 12a6 6 0 0 1-12 0c0-3.5 2-7.5 6-12z" />,
  burger: <path d="M4 10a8 4.5 0 0 1 16 0H4zm0 4h16m-16 0a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3M7 7h.01M12 6h.01M16 7h.01" />,
  chili: <path d="M14 6c0-2 2-3 3-3m-3 3c0 2 1 3 3 3m-3-3c-6 0-9 5-9 9 0 3 2 5 5 5 5 0 8-6 8-11" />,
  sandwich: <path d="M4 8h16v4H4V8zm0 8h16l-2 4H6l-2-4zm3-4v4m10-4v4" />,
  wine: <path d="M8 3h8c0 5-1.5 8-4 8s-4-3-4-8zm4 8v9m-4 0h8" />,
  banana: <path d="M5 5c0 8 5 13 14 13-1 2-4 3-7 3C6 21 3 14 3 8c0-2 1-3 2-3z" />,
  cake: <path d="M5 12h14v8H5v-8zm2 0V9m10 3V9M12 12V8m0-2v2m-7 6h14M12 6h.01" />,
  carrot: <path d="M14 10L4 20m10-10l6-6m-6 6c-2-2-4-2-5-1m5 1c2 2 2 4 1 5m-1-6l-3-3m6 6l-3-3" />,
  cup: <path d="M6 4h12l-1.5 16h-9L6 4zm-1 5h14" />,
  cloche: <path d="M4 16a8 8 0 0 1 16 0H4zm8-8v-2m0 0h.01M2 19h20" />,
  pot: <path d="M5 10h14v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-6zm-3 0h20M9 6c0-1.5 1.5-2 3-2s3 .5 3 2" />,
  basket: <path d="M4 10h16l-1.5 10h-13L4 10zm4 0l3-6m5 6l-3-6M9 13v4m6-4v4" />,
  beer: <path d="M6 8h10v13H6V8zm10 3h3v6h-3M9 8V5m4 3V4M9 12v5m4-5v5" />,
  slice: <path d="M5 12h14v8H5v-8zm3 3h.01m4 0h.01m4 0h.01M4 12c2-3 5-4 8-4s6 1 8 4" />,
  cheese: <path d="M3 10l14-5c2.5 0 4 2 4 4v10H3V10zm6 3h.01m6 2h.01" />,
  croissant: <path d="M8 8c-3 1-5 4-5 7l3 1c1-3 2-5 4-6m6-2c3 1 5 4 5 7l-3 1c-1-3-2-5-4-6m-4-2a5 5 0 0 1 8 4c0 3-2 6-4 6s-4-3-4-6a5 5 0 0 1 0-4z" />,
  grapes: <path d="M12 7c1-2 3-3 4-3m-4 3a2.5 2.5 0 1 0-3 3m3-3a2.5 2.5 0 1 1 3 3m-6 0a2.5 2.5 0 1 0 3 3m0-3a2.5 2.5 0 1 1 3 3m-3 0a2.5 2.5 0 1 0 3 3" />,
  icecream: <path d="M8 11a4 4 0 1 1 8 0v1H8v-1zm0 1l4 9 4-9" />,
  pizza: <path d="M12 21L4 5a16 16 0 0 1 16 0l-8 16zm-2-8h.01m3-3h.01m-1 6h.01" />,
  strawberry: <path d="M12 8c4 0 7 2 7 5 0 4-4 8-7 8s-7-4-7-8c0-3 3-5 7-5zm0 0V5m-3 1c1 1 2 2 3 2s2-1 3-2m-5 7h.01m4 1h.01m-4 3h.01" />,
  banknote: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6.5 9.5h.01m11 5h.01" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18M7 15h4" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  backspace: <path d="M8 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 19H8l-5.5-7L8 5zm4 4l5 6m0-6l-5 6" />,
  divide: <path d="M5 12h14M12 8h.01M12 16h.01" />, multiply: <path d="M7 7l10 10M17 7L7 17" />,
  laptop: <path d="M5 6h14v9H5V6zm-3 13h20l-1.5-4h-17L2 19z" />,
  moon: <path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5V5m0 14v2.5M2.5 12H5m14 0h2.5M5 5l1.8 1.8M17.2 17.2L19 19M19 5l-1.8 1.8M6.8 17.2L5 19" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5m0-8h.01" /></>,
  chevL: <path d="M14 6l-6 6 6 6" />, chevUp: <path d="M6 14l6-6 6 6" />
};
export function Icon({ n, s = 20, c = '', w = 1.8 }: { n: string; s?: number; c?: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden>
      {P[n] ?? P.slash}
    </svg>
  );
}
export const ICON_SECTIONS: { title: string; icons: string[] }[] = [
  { title: 'Еда', icons: ['apple','bottle','candy','chef','coffee','meat','skewer','salad','cutlery','eggFried','noodles','cherry','egg','burger','chili','sandwich','wine','banana','cake','carrot','cup','cloche','pot','basket','beer','slice','cheese','croissant','grapes','icecream','pizza','strawberry'] },
  { title: 'Транспорт', icons: ['car','bus','plane','train','fuel','parking','bike','bolt'] },
  { title: 'Дом', icons: ['home','bulb','key','sofa','drop','wrench'] },
  { title: 'Здоровье', icons: ['heartPulse','pill','steth','heart','leaf'] },
  { title: 'Спорт', icons: ['dumbbell','trophy','bike','target'] },
  { title: 'Развлечения', icons: ['gamepad','film','music','ticket','star'] },
  { title: 'Покупки', icons: ['bag','cart','tag','gift','shirt'] },
  { title: 'Образование', icons: ['book','cap','laptop'] },
  { title: 'Путешествия', icons: ['plane','map','hotel'] },
  { title: 'Финансы', icons: ['wallet','banknote','card','coins','bank','trend'] },
  { title: 'Прочее', icons: ['slash','star','paw','cloud','phone','moon','sun','info'] }
];
// недостающие простые иконки
P.dumbbell = <path d="M7 8v8m10-8v8M4 10v4m16-4v4M7 12h10M4 12h3m10 0h3" />;
P.trophy = <path d="M8 4h8v5a4 4 0 0 1-8 0V4zm8 1h4a3 3 0 0 1-3 4M8 5H4a3 3 0 0 0 3 4m5 4v4m-4 3h8m-6-3h4" />;
P.scan = <path d="M4 8V6a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 8v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M4 12h16" />;
P.camera = <path d="M4 8h3l2-3h6l2 3h3v11H4V8zm8 3a3.5 3.5 0 1 0 .01 0z" />;
P.watch = <><circle cx="12" cy="12" r="6" /><path d="M12 9.5V12l2 2M9.5 3h5M9.5 21h5" /></>;
P.headphones = <path d="M4 14a8 8 0 0 1 16 0m-16 0v4a2 2 0 0 0 2 2h1v-6H4zm16 0v4a2 2 0 0 1-2 2h-1v-6h3z" />;
P.dice = <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01" /></>;
P.flower = <path d="M12 11a3 3 0 1 0-3 3m3-3a3 3 0 1 1-3 3m3-3V4m-5 6a3 3 0 1 0 3 3m5-2a3 3 0 1 1-3 3m3-3v8" />;
P.tree = <path d="M12 3l5 6h-3l4 5h-4l3 5H7l3-5H6l4-5H7l5-6zm0 16v2" />;
P.taxi = <path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16m-14 0h14m-14 0v3m14-3v3M10 6h4M7.5 13h.01M16.5 13h.01" />;
P.truck = <path d="M3 6h11v10H3V6zm11 3h4l3 3v4h-7V9zM7.5 18.5a1.8 1.8 0 1 0 .01 0zm10 0a1.8 1.8 0 1 0 .01 0z" />;
P.ship = <path d="M4 15l8-2 8 2-2 5H6l-2-5zm8-2V6M8 9h8m-4-6v3" />;
P.rocket = <path d="M12 3c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10zm0 8h.01M9 16l-2 5m8-5l2 5" />;
P.cookie = <path d="M20 12a8 8 0 1 1-8-8c0 2 1 3 3 3 0 2 1 3 3 3 1 0 2 1 2 2zM9 12h.01M12 16h.01M14 13h.01" />;
P.tea = <path d="M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V8zm12 1h2a2.5 2.5 0 0 1 0 5h-2M8 4c0 1 1 1 1 2m3-2c0 1 1 1 1 2" />;
P.tooth = <path d="M7 3c2 0 3 1 5 1s3-1 5-1c2 0 3 2 3 4 0 3-2 4-2 7s-1 7-3 7c-1.5 0-1-4-3-4s-1.5 4-3 4c-2 0-3-4-3-7S4 10 4 7c0-2 1-4 3-4z" />;
P.scissors = <><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5L20 18M8 16.5L20 6" /></>;
P.baby = <><circle cx="12" cy="13" r="7" /><path d="M9 13h.01M15 13h.01M10 16.5a3 3 0 0 0 4 0M12 6c0-1.5 1-2.5 2-3" /></>;
P.bone = <path d="M9.5 9.5l5 5M9 9a2.2 2.2 0 1 1-3-3 2.2 2.2 0 1 1 3 3zm6 6a2.2 2.2 0 1 0 3 3 2.2 2.2 0 1 0-3-3z" />;
P.briefcase = <><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></>;
P.shield = <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zm-3 9l2.5 2.5L16 10" />;
P.percent = <><path d="M19 5L5 19" /><circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="16" r="2.5" /></>;
P.sparkle = <path d="M12 4l1.6 4.6L18 10l-4.4 1.4L12 16l-1.6-4.6L6 10l4.4-1.4zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />;