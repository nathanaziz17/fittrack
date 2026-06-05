import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── DATA ────────────────────────────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  Chest: [
    "Bench Press","Incline Bench Press","Decline Bench Press",
    "Incline Dumbbell Press","Dumbbell Fly","Cable Fly","Cable Flys",
    "Pec Deck","Chest Dip","Push-Up",
  ],
  Back: [
    "Deadlift","Pull-Up","Barbell Row","Cable Row","Seated Row",
    "Lat Pulldown","T-Bar Row","Face Pull","Facepulls",
    "Single-Arm Row","Single Arm DB Row",
  ],
  Legs: [
    "Squat","Goblet Squat","Hack Squat","Bulgarian Split Squat",
    "Romanian Deadlift","Leg Press","Leg Curl","Leg Extension",
    "Calf Raise","Lunges",
  ],
  Shoulders: [
    "Overhead Press","DB Shoulder Press","Arnold Press",
    "Single Arm Cable Lat Raise","Lateral Raise","Front Raise","DB 555 Raises",
    "Rear Delt Fly","Rear Delt Fly (Pec Dec)","Cable Shrugs","Upright Row",
  ],
  Arms: [
    "Bicep Curl","Barbell Curl","EZ Bar Curl","Preacher Curl",
    "Incline Dumbbell Curl","Concentration Curl","Cable Curl",
    "Hammer Curl","DB Hammer Curl","Cross-Body Hammer Curl",
    "Reverse Curl","Zottman Curl",
    "Tricep Pushdown","Rope Tricep Pushdown","Tricep Rope Pulldown",
    "Skull Crusher","Overhead Tricep Extension","Tricep Kickback","Dip","Chin-Up",
  ],
  Core: [
    "Plank","Crunch","Leg Raise","Russian Twist",
    "Cable Crunch","Ab Rollout","Hanging Knee Raise","Dragon Flag",
  ],
  Cardio: [
    "Running","Cycling","Rowing","Jump Rope",
    "Stair Climber","Elliptical","Swimming","HIIT",
  ],
};

const DEFAULT_MACRO_TARGETS = { calories: 2500, protein: 180, carbs: 280, fat: 75 };

const DEFAULT_TEMPLATES = [
  { id: 1, name: "Push Day", icon: "💪", exercises: [
    { name: "Bench Press",           sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Incline Dumbbell Press",sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Pec Deck",              sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Overhead Press",        sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Rope Tricep Pushdown",  sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
  ]},
  { id: 2, name: "Pull Day", icon: "🏋️", exercises: [
    { name: "Deadlift",         sets: [{ w: 0, r: 8 }, { w: 0, r: 8 }, { w: 0, r: 8 }] },
    { name: "Single Arm DB Row",sets: [{ w: 0, r: 8 }, { w: 0, r: 8 }, { w: 0, r: 8 }] },
    { name: "Lat Pulldown",     sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Seated Row",       sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Facepulls",        sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "DB Hammer Curl",   sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
  ]},
  { id: 3, name: "Leg Day", icon: "🦵", exercises: [
    { name: "Goblet Squat",   sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
    { name: "Leg Press",      sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
    { name: "Leg Extension",  sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
    { name: "Leg Curl",       sets: [{ w: 0, r: 10 }, { w: 0, r: 10 }, { w: 0, r: 10 }] },
    { name: "Calf Raise",     sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
  ]},
  { id: 4, name: "Shoulders", icon: "⚡", exercises: [
    { name: "DB Shoulder Press",         sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
    { name: "Single Arm Cable Lat Raise",sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }] },
    { name: "DB 555 Raises",             sets: [{ w: 0, r: 5 }, { w: 0, r: 5 }] },
    { name: "Cable Shrugs",              sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
    { name: "Rear Delt Fly (Pec Dec)",   sets: [{ w: 0, r: 12 }, { w: 0, r: 12 }, { w: 0, r: 12 }] },
  ]},
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a;
    --surface: #111111;
    --surface2: #1a1a1a;
    --border: #2a2a2a;
    --accent: #e8ff47;
    --accent2: #ff6b35;
    --text: #f0f0f0;
    --muted: #666;
    --danger: #ff4444;
    --green: #44ff88;
    --radius: 12px;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
  .app { max-width: 480px; margin: 0 auto; padding-bottom: 90px; position: relative; }
  /* NAV */
  .nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: rgba(10,10,10,0.95); backdrop-filter: blur(20px); border-top: 1px solid var(--border); display: flex; z-index: 100; padding: 8px 0 12px; }
  .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; color: var(--muted); cursor: pointer; font-size: 10px; font-family: 'DM Sans', sans-serif; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.2s; padding: 4px; }
  .nav-btn.active { color: var(--accent); }
  .nav-btn svg { width: 22px; height: 22px; }
  /* HEADER */
  .page-header { padding: 24px 20px 8px; display: flex; align-items: center; justify-content: space-between; }
  .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
  .accent-dot { color: var(--accent); }
  /* CARDS */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin: 0 20px 12px; }
  .card-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  /* DASHBOARD */
  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 20px; margin-bottom: 12px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: var(--accent); line-height: 1; }
  .stat-label { font-size: 11px; color: var(--muted); font-weight: 500; margin-top: 2px; }
  .streak-card { background: linear-gradient(135deg, #1a1a00 0%, #111 100%); border-color: var(--accent); }
  .streak-card .stat-val { font-size: 48px; }
  /* BUTTONS */
  .btn { border: none; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.15s; }
  .btn-primary { background: var(--accent); color: #000; padding: 12px 20px; width: 100%; }
  .btn-primary:hover { background: #d4eb3a; transform: translateY(-1px); }
  .btn-secondary { background: var(--surface2); color: var(--text); padding: 10px 16px; border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-danger { background: rgba(255,68,68,0.1); color: var(--danger); border: 1px solid var(--danger); }
  /* WORKOUT */
  .exercise-card { background: var(--surface2); border-radius: 10px; padding: 14px; margin-bottom: 10px; border: 1px solid var(--border); }
  .ex-name { font-weight: 600; font-size: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .sets-grid { display: grid; grid-template-columns: 32px 1fr 1fr 32px; gap: 6px; align-items: center; margin-bottom: 6px; }
  .set-num { font-size: 12px; color: var(--muted); font-weight: 600; text-align: center; }
  .set-input { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 8px; text-align: center; width: 100%; }
  .set-input:focus { outline: none; border-color: var(--accent); }
  .set-check { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .set-check.done { background: var(--accent); border-color: var(--accent); }
  .col-header { font-size: 10px; color: var(--muted); text-align: center; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  /* TIMER */
  .timer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; }
  .timer-modal { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; text-align: center; min-width: 280px; }
  .timer-display { font-family: 'Bebas Neue', sans-serif; font-size: 96px; color: var(--accent); line-height: 1; letter-spacing: 0.05em; }
  .timer-label { color: var(--muted); font-size: 13px; font-weight: 500; margin-bottom: 24px; letter-spacing: 0.1em; text-transform: uppercase; }
  .timer-ring { width: 180px; height: 180px; margin: 0 auto 16px; position: relative; }
  .timer-ring svg { transform: rotate(-90deg); }
  .timer-ring circle { transition: stroke-dashoffset 1s linear; }
  /* CHARTS */
  .chart-wrap { position: relative; height: 120px; margin-top: 8px; }
  .chart-svg { width: 100%; height: 100%; }
  .chart-line { fill: none; stroke: var(--accent); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
  .chart-area { fill: url(#areaGrad); }
  .chart-dot { fill: var(--accent); }
  /* NUTRITION */
  .macro-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .macro-box { flex: 1; background: var(--surface2); border-radius: 8px; padding: 10px; text-align: center; border: 1px solid var(--border); }
  .macro-val { font-family: 'Bebas Neue', sans-serif; font-size: 24px; line-height: 1; }
  .macro-name { font-size: 10px; color: var(--muted); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .macro-bar-wrap { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-top: 12px; }
  .macro-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
  .food-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .food-item:last-child { border-bottom: none; }
  .food-name { font-size: 14px; font-weight: 500; }
  .food-cals { font-size: 13px; color: var(--muted); }
  /* INPUT */
  .input-group { margin-bottom: 12px; }
  .input-label { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .text-input { width: 100%; background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 11px 14px; }
  .text-input:focus { outline: none; border-color: var(--accent); }
  /* PR */
  .pr-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .pr-item:last-child { border-bottom: none; }
  .pr-rank { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--accent); width: 32px; flex-shrink: 0; }
  .pr-info { flex: 1; }
  .pr-ex { font-weight: 600; font-size: 15px; }
  .pr-date { font-size: 12px; color: var(--muted); }
  .pr-weight { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: var(--accent2); }
  /* HISTORY */
  .hist-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .hist-date-block { background: var(--surface2); border-radius: 8px; padding: 6px 10px; text-align: center; min-width: 48px; }
  .hist-day { font-family: 'Bebas Neue', sans-serif; font-size: 24px; line-height: 1; color: var(--accent); }
  .hist-mon { font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; }
  .hist-name { font-weight: 600; font-size: 15px; }
  .hist-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  /* MODALS */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 150; display: flex; align-items: flex-end; }
  .modal { background: var(--surface); border-radius: 20px 20px 0 0; border: 1px solid var(--border); border-bottom: none; padding: 24px 20px; width: 100%; max-height: 80vh; overflow-y: auto; }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin-bottom: 16px; }
  .category-chip { display: inline-block; background: var(--surface2); border: 1px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 13px; font-weight: 500; cursor: pointer; margin: 4px; transition: all 0.15s; }
  .category-chip.active { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 700; }
  .ex-list-item { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--border); font-size: 14px; cursor: pointer; }
  .ex-list-item:hover { color: var(--accent); }
  /* AI */
  .ai-bubble { background: var(--surface2); border-radius: 12px; padding: 14px; margin-bottom: 10px; border-left: 3px solid var(--accent); font-size: 14px; line-height: 1.6; }
  .ai-user { background: rgba(232,255,71,0.08); border-left-color: var(--accent2); }
  .ai-input-row { display: flex; gap: 8px; padding: 0 20px; margin-top: 8px; }
  .ai-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 11px 14px; }
  .ai-input:focus { outline: none; border-color: var(--accent); }
  .typing-dot { display: inline-block; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: typing 1.2s infinite; margin: 0 2px; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
  /* MISC */
  .tag { display: inline-block; background: rgba(232,255,71,0.1); color: var(--accent); border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }
  .section-row { display: flex; justify-content: space-between; align-items: center; padding: 0 20px; margin-bottom: 10px; }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--muted); font-size: 14px; }
  .divider { height: 1px; background: var(--border); margin: 0 20px 16px; }
  select.text-input { appearance: none; }
  .flex-row { display: flex; gap: 10px; }
  .flex-row > * { flex: 1; }
  .active-workout-bar { background: linear-gradient(90deg, var(--accent2), #ff8c5a); color: #000; padding: 10px 20px; margin: 0 20px 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 14px; cursor: pointer; }
  .fab { position: fixed; bottom: 90px; right: max(20px, calc(50vw - 220px)); width: 54px; height: 54px; background: var(--accent); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(232,255,71,0.4); z-index: 90; transition: transform 0.2s; }
  .fab:hover { transform: scale(1.08); }
  .badge { background: var(--accent2); color: #fff; border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 700; }
  /* TEMPLATES */
  .template-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px; margin: 0 20px 10px; display: flex; align-items: center; gap: 12px; transition: border-color 0.15s; }
  .template-card:hover { border-color: var(--accent); }
  .template-icon { width: 44px; height: 44px; background: rgba(232,255,71,0.08); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .template-info { flex: 1; min-width: 0; }
  .template-name { font-weight: 700; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .template-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .tmpl-ex-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .tmpl-ex-row:last-child { border-bottom: none; }
  .tmpl-ex-name { flex: 1; font-size: 14px; font-weight: 500; }
  .tmpl-set-tag { background: var(--surface2); border-radius: 6px; padding: 4px 8px; font-size: 12px; font-weight: 600; color: var(--accent); white-space: nowrap; }
  .prog-bar-outer { height: 4px; background: var(--surface2); border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .prog-bar-inner { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.4s ease; }
  /* SCANNER */
  .scanner-overlay { position: fixed; inset: 0; background: #000; z-index: 300; display: flex; flex-direction: column; }
  .scanner-video { width: 100%; height: 100%; object-fit: cover; }
  .scanner-ui { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
  .scanner-frame { width: 260px; height: 160px; position: relative; }
  .scanner-corner { position: absolute; width: 24px; height: 24px; border-color: var(--accent); border-style: solid; }
  .scanner-corner.tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
  .scanner-corner.tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
  .scanner-corner.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
  .scanner-corner.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
  .scanner-line { position: absolute; left: 10px; right: 10px; height: 2px; background: var(--accent); box-shadow: 0 0 8px var(--accent); animation: scanline 2s ease-in-out infinite; }
  @keyframes scanline { 0%,100% { top: 10px; opacity: 1; } 50% { top: calc(100% - 12px); opacity: 0.8; } }
  .scanner-hint { color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 24px; font-weight: 500; text-align: center; }
  .scanner-close { position: absolute; top: 48px; right: 20px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 44px; height: 44px; color: #fff; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; pointer-events: all; }
  .scanner-manual { position: absolute; bottom: 100px; left: 20px; right: 20px; pointer-events: all; }
  .scanner-manual-input { display: flex; gap: 8px; }
  .product-preview { background: var(--surface2); border: 1px solid var(--accent); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
  .product-preview-name { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
  .product-preview-brand { font-size: 12px; color: var(--muted); margin-bottom: 10px; }
  .product-macros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .product-macro-item { background: var(--surface); border-radius: 6px; padding: 6px; text-align: center; }
  .product-macro-val { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: var(--accent); }
  .product-macro-label { font-size: 9px; color: var(--muted); font-weight: 600; text-transform: uppercase; }
  .serving-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .serving-input { width: 70px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 8px; text-align: center; }
  .serving-input:focus { outline: none; border-color: var(--accent); }
  /* PROGRESS PHOTOS */
  .unit-toggle { display: flex; background: var(--surface2); border-radius: 8px; padding: 3px; border: 1px solid var(--border); }
  .unit-btn { flex: 1; padding: 6px 0; border: none; border-radius: 6px; background: none; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
  .unit-btn.active { background: var(--accent); color: #000; }
  .photo-upload-box { border: 2px dashed var(--border); border-radius: 10px; padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.2s; position: relative; overflow: hidden; }
  .photo-upload-box:hover { border-color: var(--accent); }
  .photo-upload-box input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .photo-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; display: block; }
  .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .photo-entry { position: relative; border-radius: 10px; overflow: hidden; background: var(--surface2); border: 1px solid var(--border); }
  .photo-entry-img { width: 100%; height: 120px; object-fit: cover; display: block; }
  .photo-entry-info { padding: 8px 10px; }
  .photo-entry-date { font-size: 11px; color: var(--muted); font-weight: 600; }
  .photo-entry-weight { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--accent); line-height: 1; }
  .photo-entry-del { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 24px; height: 24px; color: #fff; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .photo-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 400; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
  .photo-lightbox img { max-width: 100%; max-height: 70vh; border-radius: 12px; object-fit: contain; }
  .photo-lightbox-info { margin-top: 16px; text-align: center; }
  .photo-no-img { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: var(--surface2); }
  .change-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
  .change-down { background: rgba(68,255,136,0.12); color: var(--green); }
  .change-up { background: rgba(255,68,68,0.12); color: var(--danger); }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(n) { return n < 10 ? "0" + n : "" + n; }
function fmtTime(s) { return `${fmt(Math.floor(s / 60))}:${fmt(s % 60)}`; }
function today() { return new Date().toISOString().split("T")[0]; }
function monthLabel(d) { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
function calcVolume(ex) { return ex.sets.reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0); }

// ─── MINI CHART ───────────────────────────────────────────────────────────────
function LineChart({ data, color = "#e8ff47", label = "kg" }) {
  if (!data || data.length < 2) return <div className="empty-state">Not enough data yet</div>;
  const vals = data.map(d => d.kg || d.val || 0);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const W = 300, H = 100;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / (max - min)) * H;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = path + ` L${pts[pts.length - 1][0]},${H} L0,${H} Z`;
  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} className="chart-area" />
        <path d={path} className="chart-line" style={{ stroke: color }} />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" className="chart-dot" style={{ fill: color }} />)}
      </svg>
    </div>
  );
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
function RestTimer({ onClose }) {
  const DURATIONS = [60, 90, 120, 180];
  const [selected, setSelected] = useState(90);
  const [remaining, setRemaining] = useState(null);
  const [running, setRunning] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
          return r - 1;
        });
      }, 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const start = () => { setRemaining(selected); setRunning(true); };
  const r = remaining !== null ? remaining : selected;
  const progress = remaining !== null ? (remaining / selected) : 1;
  const circ = 2 * Math.PI * 70;

  return (
    <div className="timer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="timer-modal">
        <div className="timer-label">REST TIMER</div>
        <div className="timer-ring">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="70" fill="none" stroke="#1a1a1a" strokeWidth="8" />
            <circle cx="90" cy="90" r="70" fill="none" stroke="#e8ff47" strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
            <div className="timer-display">{fmtTime(r)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
          {DURATIONS.map(d => (
            <button key={d} className={`btn btn-secondary btn-sm`} style={selected === d ? { borderColor: "#e8ff47", color: "#e8ff47" } : {}}
              onClick={() => { setSelected(d); setRemaining(null); setRunning(false); }}>{d}s</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!running ? <button className="btn btn-primary" style={{ flex: 1 }} onClick={start}>START</button>
            : <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setRunning(false)}>PAUSE</button>}
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── EXERCISE PICKER ──────────────────────────────────────────────────────────
function ExercisePicker({ onAdd, onClose }) {
  const [cat, setCat] = useState("Chest");
  const [custom, setCustom] = useState("");
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">ADD EXERCISE</div>
        <div style={{ marginBottom: 12 }}>
          {Object.keys(EXERCISE_LIBRARY).map(c => (
            <span key={c} className={`category-chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</span>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          {EXERCISE_LIBRARY[cat].map(ex => (
            <div key={ex} className="ex-list-item" onClick={() => { onAdd(ex); onClose(); }}>
              <span>{ex}</span>
              <span style={{ color: "var(--accent)", fontSize: 18 }}>+</span>
            </div>
          ))}
        </div>
        <div className="divider" style={{ margin: "0 0 12px" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <input className="text-input" style={{ flex: 1 }} placeholder="Custom exercise name..." value={custom} onChange={e => setCustom(e.target.value)} />
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => { if (custom.trim()) { onAdd(custom.trim()); onClose(); } }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE BUILDER ────────────────────────────────────────────────────────
function TemplateBuilder({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "💪");
  const [exercises, setExercises] = useState(
    initial?.exercises
      ? initial.exercises.map((e, i) => ({ id: i, name: e.name, sets: e.sets.map(s => ({ w: String(s.w), r: String(s.r) })) }))
      : []
  );
  const [picker, setPicker] = useState(false);
  const ICONS = ["💪","🏋️","🦵","🔥","⚡","🎯","🏃","🤸","🥊","🧠"];

  const addExercise = exName => {
    setExercises(ex => [...ex, { id: Date.now(), name: exName, sets: [{ w: "", r: "" }] }]);
  };
  const addSet = id => setExercises(ex => ex.map(e => e.id === id ? { ...e, sets: [...e.sets, { w: "", r: "" }] } : e));
  const removeSet = (id, si) => setExercises(ex => ex.map(e => e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== si) } : e));
  const updateSet = (id, si, field, val) => setExercises(ex => ex.map(e => e.id === id ? { ...e, sets: e.sets.map((s, i) => i === si ? { ...s, [field]: val } : s) } : e));
  const removeExercise = id => setExercises(ex => ex.filter(e => e.id !== id));

  const save = () => {
    if (!name.trim() || exercises.length === 0) return;
    onSave({
      id: initial?.id || Date.now(),
      name: name.trim(),
      icon,
      exercises: exercises.map(e => ({
        name: e.name,
        sets: e.sets.map(s => ({ w: parseFloat(s.w) || 0, r: parseInt(s.r) || 0 }))
      }))
    });
    onClose();
  };

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="page-header" style={{ paddingBottom: 12 }}>
        <div className="page-title">{initial ? "EDIT" : "NEW"} TEMPLATE<span className="accent-dot">.</span></div>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Icon picker */}
        <div className="input-group">
          <label className="input-label">Icon</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)}
                style={{ width: 40, height: 40, fontSize: 20, background: icon === ic ? "var(--accent)" : "var(--surface2)", border: `1px solid ${icon === ic ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer" }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Template Name</label>
          <input className="text-input" placeholder="e.g. Push Day" value={name} onChange={e => setName(e.target.value)} />
        </div>

        {exercises.map(ex => (
          <div key={ex.id} className="exercise-card">
            <div className="ex-name">
              <span>{ex.name}</span>
              <button className="btn btn-danger btn-sm" onClick={() => removeExercise(ex.id)}>✕</button>
            </div>
            <div className="sets-grid" style={{ marginBottom: 8 }}>
              <div className="col-header">SET</div>
              <div className="col-header">TARGET KG</div>
              <div className="col-header">TARGET REPS</div>
              <div className="col-header"></div>
            </div>
            {ex.sets.map((s, i) => (
              <div key={i} className="sets-grid" style={{ marginBottom: 6 }}>
                <div className="set-num" style={{ cursor: "pointer", color: "var(--danger)" }} onClick={() => removeSet(ex.id, i)}>{i + 1}</div>
                <input className="set-input" type="number" placeholder="0" value={s.w} onChange={e => updateSet(ex.id, i, "w", e.target.value)} />
                <input className="set-input" type="number" placeholder="0" value={s.r} onChange={e => updateSet(ex.id, i, "r", e.target.value)} />
                <div />
              </div>
            ))}
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 4 }} onClick={() => addSet(ex.id)}>+ Set</button>
          </div>
        ))}

        <button className="btn btn-secondary" style={{ width: "100%", marginBottom: 10 }} onClick={() => setPicker(true)}>+ Add Exercise</button>
        <button className="btn btn-primary" style={{ marginBottom: 20 }} onClick={save}>
          {initial ? "Save Changes" : "Create Template"}
        </button>
      </div>

      {picker && <ExercisePicker onAdd={addExercise} onClose={() => setPicker(false)} />}
    </div>
  );
}

// ─── ACTIVE WORKOUT (from template or blank) ──────────────────────────────────
const TEMPLATE_ICONS = ["💪","🏋️","🦵","🔥","⚡","🎯","🏃","🤸","🥊","🧠"];

function ActiveWorkout({ workoutName: initName, initExercises, onFinish, onCancel, isQuickStart }) {
  const [exercises, setExercises] = useState(
    initExercises.map(e => ({
      id: Date.now() + Math.random(),
      name: e.name,
      sets: e.sets.map(s => ({ w: String(s.w || ""), r: String(s.r || ""), done: false, targetW: s.w, targetR: s.r }))
    }))
  );
  const [picker, setPicker] = useState(false);
  const [timer, setTimer] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [workoutName, setWorkoutName] = useState(initName);
  const [saveModal, setSaveModal] = useState(false); // show save-as-template prompt
  const [pendingEntry, setPendingEntry] = useState(null);
  const [tmplName, setTmplName] = useState("");
  const [tmplIcon, setTmplIcon] = useState("💪");
  const ref = useRef();

  useEffect(() => {
    ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(ref.current);
  }, []);

  const addExercise = name => setExercises(ex => [...ex, { id: Date.now(), name, sets: [{ w: "", r: "", done: false, targetW: null, targetR: null }] }]);
  const addSet = id => setExercises(ex => ex.map(e => e.id === id ? { ...e, sets: [...e.sets, { w: "", r: "", done: false, targetW: null, targetR: null }] } : e));
  const removeSet = (id, si) => setExercises(ex => ex.map(e => e.id === id ? { ...e, sets: e.sets.filter((_, i) => i !== si) } : e));
  const updateSet = (id, si, field, val) => setExercises(ex => ex.map(e => e.id === id ? { ...e, sets: e.sets.map((s, i) => i === si ? { ...s, [field]: val } : s) } : e));
  const removeExercise = id => setExercises(ex => ex.filter(e => e.id !== id));

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  const finish = () => {
    const entry = {
      date: today(), name: workoutName,
      exercises: exercises.map(e => ({ name: e.name, sets: e.sets.map(s => ({ w: parseFloat(s.w) || 0, r: parseInt(s.r) || 0 })) })),
      duration: Math.floor(elapsed / 60)
    };
    if (isQuickStart && exercises.length > 0) {
      // Pause and ask if they want to save as template
      setTmplName(workoutName);
      setPendingEntry(entry);
      setSaveModal(true);
    } else {
      onFinish(entry, exercises);
    }
  };

  const confirmSaveTemplate = (save) => {
    setSaveModal(false);
    if (save) {
      const template = {
        id: Date.now(),
        name: tmplName.trim() || workoutName,
        icon: tmplIcon,
        exercises: exercises.map(e => ({
          name: e.name,
          sets: e.sets.map(s => ({ w: parseFloat(s.w) || 0, r: parseInt(s.r) || 0 }))
        }))
      };
      onFinish(pendingEntry, exercises, template);
    } else {
      onFinish(pendingEntry, exercises, null);
    }
  };

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="page-header" style={{ paddingBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div className="page-title">WORKOUT<span className="accent-dot">.</span></div>
          <input className="text-input" style={{ marginTop: 8, fontWeight: 600, fontSize: 15 }} value={workoutName} onChange={e => setWorkoutName(e.target.value)} />
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "var(--accent)", lineHeight: 1 }}>{fmtTime(elapsed)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>ELAPSED</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: "0 20px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
          <span>{doneSets} / {totalSets} sets done</span>
          <span style={{ color: pct === 100 ? "var(--green)" : "var(--accent)", fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="prog-bar-outer"><div className="prog-bar-inner" style={{ width: `${pct}%` }} /></div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {exercises.map(ex => {
          const exDone = ex.sets.filter(s => s.done).length;
          const exTotal = ex.sets.length;
          const exComplete = exDone === exTotal;
          return (
            <div key={ex.id} className="exercise-card" style={exComplete ? { borderColor: "rgba(68,255,136,0.3)" } : {}}>
              <div className="ex-name">
                <span style={exComplete ? { color: "var(--green)" } : {}}>
                  {exComplete && "✓ "}{ex.name}
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => removeExercise(ex.id)}>✕</button>
              </div>
              <div className="sets-grid" style={{ marginBottom: 8 }}>
                <div className="col-header">SET</div>
                <div className="col-header">KG</div>
                <div className="col-header">REPS</div>
                <div className="col-header">✓</div>
              </div>
              {ex.sets.map((s, i) => (
                <div key={i} className="sets-grid" style={{ marginBottom: 6 }}>
                  <div className="set-num" style={{ cursor: "pointer", color: "var(--danger)" }} onClick={() => removeSet(ex.id, i)}>{i + 1}</div>
                  <input className="set-input" type="number"
                    placeholder={s.targetW !== null ? String(s.targetW) : "0"}
                    value={s.w}
                    onChange={e => updateSet(ex.id, i, "w", e.target.value)}
                    style={s.done ? { opacity: 0.5 } : {}} />
                  <input className="set-input" type="number"
                    placeholder={s.targetR !== null ? String(s.targetR) : "0"}
                    value={s.r}
                    onChange={e => updateSet(ex.id, i, "r", e.target.value)}
                    style={s.done ? { opacity: 0.5 } : {}} />
                  <button className={`set-check ${s.done ? "done" : ""}`} onClick={() => {
                    // auto-fill from placeholder if empty
                    const filled = {
                      w: s.w || (s.targetW !== null ? String(s.targetW) : ""),
                      r: s.r || (s.targetR !== null ? String(s.targetR) : ""),
                    };
                    updateSet(ex.id, i, "done", !s.done);
                    if (!s.done) {
                      if (!s.w && s.targetW !== null) updateSet(ex.id, i, "w", String(s.targetW));
                      if (!s.r && s.targetR !== null) updateSet(ex.id, i, "r", String(s.targetR));
                    }
                  }}>
                    {s.done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" /></svg>}
                  </button>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 4 }} onClick={() => addSet(ex.id)}>+ Add Set</button>
            </div>
          );
        })}

        <button className="btn btn-secondary" style={{ width: "100%", marginBottom: 10 }} onClick={() => setPicker(true)}>+ Add Exercise</button>
        <button className="btn btn-secondary" style={{ width: "100%", marginBottom: 10, borderColor: "var(--accent2)", color: "var(--accent2)" }} onClick={() => setTimer(true)}>⏱ Rest Timer</button>
        <button className="btn btn-primary" style={{ marginBottom: 10, ...(pct === 100 ? { background: "var(--green)", color: "#000" } : {}) }} onClick={finish}>
          {pct === 100 ? "✓ FINISH WORKOUT" : `FINISH WORKOUT (${pct}%)`}
        </button>
        <button className="btn btn-secondary" style={{ width: "100%", marginBottom: 20 }} onClick={onCancel}>Cancel</button>
      </div>

      {picker && <ExercisePicker onAdd={addExercise} onClose={() => setPicker(false)} />}
      {timer && <RestTimer onClose={() => setTimer(false)} />}

      {/* Save as template modal */}
      {saveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ textAlign: "center", marginBottom: 6, fontSize: 36 }}>🎉</div>
            <div className="modal-title" style={{ textAlign: "center" }}>Workout Done!</div>
            <div style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", marginBottom: 20 }}>
              Save this as a template so you can load it up next time?
            </div>

            <div className="input-group">
              <label className="input-label">Template Name</label>
              <input className="text-input" value={tmplName} onChange={e => setTmplName(e.target.value)} placeholder="e.g. Push Day" />
            </div>

            <div className="input-group">
              <label className="input-label">Icon</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TEMPLATE_ICONS.map(ic => (
                  <button key={ic} onClick={() => setTmplIcon(ic)}
                    style={{ width: 38, height: 38, fontSize: 18, background: tmplIcon === ic ? "var(--accent)" : "var(--surface2)", border: `1px solid ${tmplIcon === ic ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer" }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              {exercises.length} exercises · {exercises.reduce((a, e) => a + e.sets.length, 0)} sets — weights saved as targets
            </div>

            <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={() => confirmSaveTemplate(true)}>
              ✓ Save as Template
            </button>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => confirmSaveTemplate(false)}>
              No thanks, just finish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WORKOUT PAGE ─────────────────────────────────────────────────────────────
function WorkoutPage({ history, setHistory }) {
  const [view, setView] = useState("home"); // home | active | builder | editTemplate | detail
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [activeConfig, setActiveConfig] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [workoutTab, setWorkoutTab] = useState("templates");
  const [selectedSession, setSelectedSession] = useState(null);

  const startFromTemplate = tmpl => {
    // Deep-copy the template exercises so the live workout is fully isolated
    const exercises = tmpl.exercises.map(e => ({
      name: e.name,
      sets: e.sets.map(s => ({ ...s }))
    }));
    setActiveConfig({ name: tmpl.name, exercises, templateId: tmpl.id });
    setView("active");
  };
  const startBlank = () => {
    setActiveConfig({ name: "My Workout", exercises: [], templateId: null });
    setView("active");
  };
  const saveTemplate = tmpl => {
    setTemplates(ts => {
      const idx = ts.findIndex(t => t.id === tmpl.id);
      if (idx >= 0) { const n = [...ts]; n[idx] = tmpl; return n; }
      return [...ts, tmpl];
    });
  };
  const deleteTemplate = id => setTemplates(ts => ts.filter(t => t.id !== id));
  const onFinish = (entry, loggedExercises, newTemplate) => {
    setHistory(h => [entry, ...h]);
    // If a new template was created from a quick start, add it
    if (newTemplate) {
      setTemplates(ts => [...ts, newTemplate]);
    }
    // If this workout came from a template, write the actual logged
    // weights/reps back into that template so next time the values are current.
    // Each template stores its own values independently — no cross-contamination.
    if (activeConfig?.templateId && loggedExercises) {
      setTemplates(ts => ts.map(t => {
        if (t.id !== activeConfig.templateId) return t; // leave other templates untouched
        return {
          ...t,
          exercises: loggedExercises.map(e => ({
            name: e.name,
            sets: e.sets.map(s => ({
              w: parseFloat(s.w) || 0,
              r: parseInt(s.r) || 0,
            }))
          }))
        };
      }));
    }
    setView("home");
    setActiveConfig(null);
  };

  if (view === "detail" && selectedSession) {
    return <WorkoutDetail session={selectedSession} onBack={() => { setSelectedSession(null); setView("home"); setWorkoutTab("history"); }} />;
  }
  if (view === "active" && activeConfig) {
    return <ActiveWorkout workoutName={activeConfig.name} initExercises={activeConfig.exercises}
      isQuickStart={activeConfig.templateId === null}
      onFinish={onFinish} onCancel={() => { setView("home"); setActiveConfig(null); }} />;
  }
  if (view === "builder") {
    return <TemplateBuilder onSave={saveTemplate} onClose={() => setView("home")} />;
  }
  if (view === "editTemplate" && editingTemplate) {
    return <TemplateBuilder initial={editingTemplate} onSave={saveTemplate} onClose={() => { setEditingTemplate(null); setView("home"); }} />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">WORKOUTS<span className="accent-dot">.</span></div>
        <button className="btn btn-primary btn-sm" onClick={startBlank}>+ Quick Start</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 16 }}>
        {[["templates", "Templates"], ["history", "History"]].map(([t, l]) => (
          <button key={t} className="btn btn-secondary" style={{ flex: 1, ...(workoutTab === t ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }} onClick={() => setWorkoutTab(t)}>{l}</button>
        ))}
      </div>

      {/* ── TEMPLATES TAB ── */}
      {workoutTab === "templates" && (
        <>
          {templates.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              No templates yet. Create one to pre-load your workouts!
            </div>
          )}
          {templates.map(tmpl => {
            const totalSets = tmpl.exercises.reduce((a, e) => a + e.sets.length, 0);
            return (
              <div key={tmpl.id} className="template-card">
                <div className="template-icon">{tmpl.icon}</div>
                <div className="template-info">
                  <div className="template-name">{tmpl.name}</div>
                  <div className="template-meta">{tmpl.exercises.length} exercises · {totalSets} sets</div>
                  {/* Exercise preview */}
                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {tmpl.exercises.slice(0, 3).map((e, i) => (
                      <span key={i} style={{ fontSize: 10, background: "var(--surface2)", color: "var(--muted)", borderRadius: 4, padding: "2px 6px" }}>{e.name}</span>
                    ))}
                    {tmpl.exercises.length > 3 && <span style={{ fontSize: 10, color: "var(--muted)" }}>+{tmpl.exercises.length - 3} more</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => startFromTemplate(tmpl)}>▶ Start</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditingTemplate(tmpl); setView("editTemplate"); }}>Edit</button>
                  <button className="btn btn-sm" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} onClick={() => deleteTemplate(tmpl.id)}>Delete</button>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "4px 20px 12px" }}>
            <button className="btn btn-secondary" style={{ width: "100%", borderStyle: "dashed" }} onClick={() => setView("builder")}>+ Create New Template</button>
          </div>
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {workoutTab === "history" && (
        <div className="card">
          <div className="card-label">Recent Sessions</div>
          {history.length === 0 && <div className="empty-state">No workouts yet — let's go!</div>}
          {history.map((h, i) => {
            const d = new Date(h.date);
            const totalVol = h.exercises.reduce((a, e) => a + calcVolume(e), 0);
            return (
              <div key={i} className="hist-item" style={{ cursor: "pointer" }}
                onClick={() => { setSelectedSession(h); setView("detail"); }}>
                <div className="hist-date-block">
                  <div className="hist-day">{d.getDate()}</div>
                  <div className="hist-mon">{d.toLocaleString("en", { month: "short" })}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="hist-name">{h.name}</div>
                  <div className="hist-meta">{h.exercises.length} exercises · {h.duration} min · {totalVol.toLocaleString()} kg vol</div>
                </div>
                <div style={{ color: "var(--muted)", fontSize: 18, paddingLeft: 4 }}>›</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── WORKOUT DETAIL VIEW ──────────────────────────────────────────────────────
function WorkoutDetail({ session, onBack }) {
  const totalVol = session.exercises.reduce((a, e) => a + calcVolume(e), 0);
  const totalSets = session.exercises.reduce((a, e) => a + e.sets.length, 0);
  const totalReps = session.exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (s.r || 0), 0), 0);
  const d = new Date(session.date);

  return (
    <div className="app">
      <style>{CSS}</style>

      {/* Header */}
      <div className="page-header" style={{ paddingBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 10 }} onClick={onBack}>← Back</button>
          <div className="page-title">{session.name}<span className="accent-dot">.</span></div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
            {d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="dash-grid" style={{ marginBottom: 12 }}>
        <div className="stat-card">
          <div className="stat-val">{totalVol.toLocaleString()}</div>
          <div className="stat-label">Total kg moved</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{session.duration || "—"}</div>
          <div className="stat-label">Minutes</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{totalSets}</div>
          <div className="stat-label">Total sets</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{totalReps}</div>
          <div className="stat-label">Total reps</div>
        </div>
      </div>

      {/* Exercises */}
      <div style={{ padding: "0 20px" }}>
        {session.exercises.map((ex, ei) => {
          const exVol = calcVolume(ex);
          const bestSet = ex.sets.reduce((best, s) => (s.w || 0) > (best.w || 0) ? s : best, ex.sets[0] || {});
          return (
            <div key={ei} className="exercise-card" style={{ marginBottom: 12 }}>
              {/* Exercise header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {ex.sets.length} sets · {exVol.toLocaleString()} kg vol
                    {bestSet.w ? ` · Best: ${bestSet.w}kg × ${bestSet.r}` : ""}
                  </div>
                </div>
                <span className="tag">{exVol.toLocaleString()} kg</span>
              </div>

              {/* Set breakdown */}
              <div className="sets-grid" style={{ marginBottom: 8 }}>
                <div className="col-header">SET</div>
                <div className="col-header">KG</div>
                <div className="col-header">REPS</div>
                <div className="col-header">VOL</div>
              </div>
              {ex.sets.map((s, si) => {
                const setVol = (s.w || 0) * (s.r || 0);
                const isBest = s.w === bestSet.w && s.r === bestSet.r && si === ex.sets.indexOf(bestSet);
                return (
                  <div key={si} className="sets-grid" style={{ marginBottom: 6 }}>
                    <div className="set-num" style={{ color: isBest ? "var(--accent)" : "var(--muted)" }}>{si + 1}</div>
                    <div className="set-input" style={{ background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                      {s.w || 0}
                    </div>
                    <div className="set-input" style={{ background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
                      {s.r || 0}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
                      {setVol > 0 ? setVol.toLocaleString() : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BARCODE SCANNER ─────────────────────────────────────────────────────────
function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef();
  const streamRef = useRef();
  const detectorRef = useRef();
  const rafRef = useRef();
  const [manualCode, setManualCode] = useState("");
  const [status, setStatus] = useState("Initialising camera...");
  const [hasCamera, setHasCamera] = useState(true);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !detectorRef.current) { rafRef.current = requestAnimationFrame(scanFrame); return; }
    detectorRef.current.detect(video).then(codes => {
      if (codes.length > 0) {
        const code = codes[0].rawValue;
        stopCamera();
        onDetected(code);
      } else { rafRef.current = requestAnimationFrame(scanFrame); }
    }).catch(() => { rafRef.current = requestAnimationFrame(scanFrame); });
  }, [onDetected]);

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  useEffect(() => {
    if (!("BarcodeDetector" in window)) {
      setStatus("Camera scanner not supported on this browser. Use manual entry below.");
      setHasCamera(false);
      return;
    }
    detectorRef.current = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setStatus("Point camera at barcode");
        rafRef.current = requestAnimationFrame(scanFrame);
      })
      .catch(() => { setStatus("Camera access denied. Use manual entry below."); setHasCamera(false); });
    return () => stopCamera();
  }, [scanFrame]);

  return (
    <div className="scanner-overlay">
      {hasCamera && <video ref={videoRef} className="scanner-video" playsInline muted />}
      {!hasCamera && <div style={{ flex: 1, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "var(--muted)", textAlign: "center", padding: 40, fontSize: 14 }}>📷<br /><br />{status}</div></div>}
      <div className="scanner-ui">
        {hasCamera && (
          <>
            <div className="scanner-frame">
              <div className="scanner-corner tl" /><div className="scanner-corner tr" />
              <div className="scanner-corner bl" /><div className="scanner-corner br" />
              <div className="scanner-line" />
            </div>
            <div className="scanner-hint">{status}</div>
          </>
        )}
      </div>
      <button className="scanner-close" onClick={() => { stopCamera(); onClose(); }}>✕</button>
      <div className="scanner-manual">
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>Or enter barcode manually</div>
        <div className="scanner-manual-input">
          <input className="text-input" style={{ flex: 1 }} type="number" placeholder="e.g. 5000159407236" value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && manualCode.trim()) { stopCamera(); onDetected(manualCode.trim()); } }} />
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => { if (manualCode.trim()) { stopCamera(); onDetected(manualCode.trim()); } }}>Look up</button>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT CONFIRM MODAL ────────────────────────────────────────────────────
function ProductConfirm({ product, onAdd, onClose }) {
  const [servings, setServings] = useState("1");
  const mult = parseFloat(servings) || 1;
  const scaled = {
    cals: Math.round(product.cals * mult),
    p: Math.round(product.p * mult * 10) / 10,
    c: Math.round(product.c * mult * 10) / 10,
    f: Math.round(product.f * mult * 10) / 10,
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", align: "center", gap: 8, marginBottom: 4 }}>
          <span className="tag">SCANNED</span>
        </div>
        <div className="modal-title" style={{ marginBottom: 4 }}>{product.name}</div>
        {product.brand && <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>{product.brand}</div>}
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Per serving ({product.servingSize})</div>
        <div className="product-macros" style={{ marginBottom: 16 }}>
          {[["Calories", product.cals, "kcal"], ["Protein", product.p, "g"], ["Carbs", product.c, "g"], ["Fat", product.f, "g"]].map(([l, v, u]) => (
            <div key={l} className="product-macro-item">
              <div className="product-macro-val">{Math.round(v * mult * 10) / 10}</div>
              <div className="product-macro-label">{l}</div>
            </div>
          ))}
        </div>
        <div className="serving-row">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Servings:</span>
          <input className="serving-input" type="number" min="0.5" step="0.5" value={servings} onChange={e => setServings(e.target.value)} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>= {scaled.cals} kcal total</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onAdd({ name: product.name, cals: scaled.cals, p: scaled.p, c: scaled.c, f: scaled.f })}>
            Add to Log
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── NUTRITION PAGE ───────────────────────────────────────────────────────────
function NutritionPage({ log, setLog, macroTargets }) {
  const [modal, setModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanState, setScanState] = useState("idle");
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanError, setScanError] = useState("");
  const [form, setForm] = useState({ name: "", cals: "", p: "", c: "", f: "" });

  const totals = log.reduce((a, i) => ({ cals: a.cals + (i.cals || 0), p: a.p + (i.p || 0), c: a.c + (i.c || 0), f: a.f + (i.f || 0) }), { cals: 0, p: 0, c: 0, f: 0 });

  const lookupBarcode = async (code) => {
    setScanning(false);
    setScanState("loading");
    setScanError("");
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status !== 1 || !data.product) { setScanState("error"); setScanError("Product not found in database. Try another barcode or add manually."); return; }
      const p = data.product;
      const n = p.nutriments || {};
      const per = n["energy-kcal_serving"] !== undefined ? "serving" : "100g";
      const suffix = per === "serving" ? "_serving" : "_100g";
      const kcal = Math.round(n[`energy-kcal${suffix}`] || n["energy-kcal"] || (n[`energy${suffix}`] || 0) / 4.184 || 0);
      const servingSize = p.serving_size || (per === "100g" ? "100g" : "1 serving");
      setScannedProduct({
        name: p.product_name || p.abbreviated_product_name || "Unknown Product",
        brand: p.brands || "",
        servingSize,
        cals: kcal,
        p: Math.round((n[`proteins${suffix}`] || n.proteins || 0) * 10) / 10,
        c: Math.round((n[`carbohydrates${suffix}`] || n.carbohydrates || 0) * 10) / 10,
        f: Math.round((n[`fat${suffix}`] || n.fat || 0) * 10) / 10,
      });
      setScanState("found");
    } catch {
      setScanState("error");
      setScanError("Network error — check your connection and try again.");
    }
  };

  const addFood = () => {
    if (!form.name) return;
    setLog(l => [...l, { name: form.name, cals: +form.cals || 0, p: +form.p || 0, c: +form.c || 0, f: +form.f || 0 }]);
    setForm({ name: "", cals: "", p: "", c: "", f: "" }); setModal(false);
  };

  const addScanned = (item) => {
    setLog(l => [...l, item]);
    setScannedProduct(null); setScanState("idle");
  };

  const MacroBar = ({ val, max, color }) => (
    <div className="macro-bar-wrap"><div className="macro-bar" style={{ width: `${Math.min(100, (val / max) * 100)}%`, background: color }} /></div>
  );

  return (
    <div>
      <div className="page-header"><div className="page-title">NUTRITION<span className="accent-dot">.</span></div></div>

      {/* TOTALS */}
      <div className="card">
        <div className="card-label">Today's Calories</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 56, color: "var(--accent)", lineHeight: 1 }}>{totals.cals}</span>
          <span style={{ color: "var(--muted)", fontSize: 14, paddingBottom: 8 }}>/ {macroTargets.calories} kcal</span>
        </div>
        <MacroBar val={totals.cals} max={macroTargets.calories} color="var(--accent)" />
        <div className="macro-row" style={{ marginTop: 16 }}>
          {[["Protein", totals.p, macroTargets.protein, "#44ff88", "g"], ["Carbs", totals.c, macroTargets.carbs, "#47c5ff", "g"], ["Fat", totals.f, macroTargets.fat, "#ff6b35", "g"]].map(([n, v, t, c, u]) => (
            <div key={n} className="macro-box">
              <div className="macro-val" style={{ color: c }}>{v}{u}</div>
              <div className="macro-name">{n}</div>
              <MacroBar val={v} max={t} color={c} />
            </div>
          ))}
        </div>
      </div>

      {/* SCAN LOADING / ERROR STATE */}
      {scanState === "loading" && (
        <div className="card" style={{ textAlign: "center", padding: 24 }}>
          <div style={{ marginBottom: 10 }}>
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Looking up product...</div>
        </div>
      )}
      {scanState === "error" && (
        <div className="card" style={{ borderColor: "var(--danger)" }}>
          <div style={{ color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>Product not found</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{scanError}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setScanning(true)}>Scan Again</button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setScanState("idle"); setModal(true); }}>Add Manually</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setScanState("idle")}>Dismiss</button>
          </div>
        </div>
      )}

      {/* FOOD LOG */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div className="card-label" style={{ margin: 0 }}>Food Log</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" style={{ borderColor: "var(--accent2)", color: "var(--accent2)" }}
              onClick={() => { setScanState("idle"); setScanning(true); }}>
              📷 Scan
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Manual</button>
          </div>
        </div>
        {log.length === 0 && <div className="empty-state">No food logged yet — scan a barcode or add manually!</div>}
        {log.map((item, i) => (
          <div key={i} className="food-item">
            <div>
              <div className="food-name">{item.name}</div>
              <div className="food-cals">P: {item.p}g · C: {item.c}g · F: {item.f}g</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="food-cals" style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{item.cals} kcal</span>
              <button className="btn btn-sm" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 16 }} onClick={() => setLog(l => l.filter((_, j) => j !== i))}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* SCANNER */}
      {scanning && <BarcodeScanner onDetected={lookupBarcode} onClose={() => setScanning(false)} />}

      {/* PRODUCT CONFIRM */}
      {scanState === "found" && scannedProduct && (
        <ProductConfirm product={scannedProduct} onAdd={addScanned} onClose={() => { setScannedProduct(null); setScanState("idle"); }} />
      )}

      {/* MANUAL ADD MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-title">ADD FOOD</div>
            <div className="input-group"><label className="input-label">Name</label><input className="text-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chicken & Rice" /></div>
            <div className="flex-row">
              <div className="input-group"><label className="input-label">Calories</label><input className="text-input" type="number" value={form.cals} onChange={e => setForm(f => ({ ...f, cals: e.target.value }))} placeholder="0" /></div>
              <div className="input-group"><label className="input-label">Protein (g)</label><input className="text-input" type="number" value={form.p} onChange={e => setForm(f => ({ ...f, p: e.target.value }))} placeholder="0" /></div>
            </div>
            <div className="flex-row">
              <div className="input-group"><label className="input-label">Carbs (g)</label><input className="text-input" type="number" value={form.c} onChange={e => setForm(f => ({ ...f, c: e.target.value }))} placeholder="0" /></div>
              <div className="input-group"><label className="input-label">Fat (g)</label><input className="text-input" type="number" value={form.f} onChange={e => setForm(f => ({ ...f, f: e.target.value }))} placeholder="0" /></div>
            </div>
            <button className="btn btn-primary" onClick={addFood}>Save Food</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS PAGE ────────────────────────────────────────────────────────────
const KG_TO_LBS = 2.20462;

function ProgressPage({ weights, setWeights, prs, setPRs }) {
  const [unit, setUnit] = useState("kg");
  const [form, setForm] = useState({ val: "", date: today(), photo: null, photoURL: null });
  const [prForm, setPRForm] = useState({ exercise: "", weight: "", reps: "1", date: today() });
  const [tab, setTab] = useState("weight");
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  // convert display value → kg for storage
  const toKg = v => unit === "lbs" ? parseFloat(v) / KG_TO_LBS : parseFloat(v);
  // convert kg → display
  const fromKg = kg => unit === "lbs" ? Math.round(kg * KG_TO_LBS * 10) / 10 : kg;
  const unitLabel = unit === "lbs" ? "lbs" : "kg";

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, photo: file, photoURL: url }));
  };

  const addWeight = () => {
    if (!form.val) return;
    const kg = Math.round(toKg(form.val) * 10) / 10;
    setWeights(w => [...w, { date: form.date, kg, photoURL: form.photoURL || null }]
      .sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ val: "", date: today(), photo: null, photoURL: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const addPR = () => {
    if (!prForm.exercise || !prForm.weight) return;
    const kg = Math.round(toKg(prForm.weight) * 10) / 10;
    setPRs(p => [...p, { exercise: prForm.exercise, weight: kg, reps: parseInt(prForm.reps), date: prForm.date }]);
    setPRForm({ exercise: "", weight: "", reps: "1", date: today() });
  };

  // chart data in current unit
  const chartData = weights.map(w => ({ ...w, kg: fromKg(w.kg) }));

  // overall change
  const firstW = weights[0]?.kg;
  const lastW = weights[weights.length - 1]?.kg;
  const totalChange = firstW && lastW ? Math.round((lastW - firstW) * 10) / 10 : null;
  const changeDisplay = totalChange !== null ? fromKg(Math.abs(totalChange)) : null;

  return (
    <div>
      {/* LIGHTBOX */}
      {lightbox && (
        <div className="photo-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.url} alt="Progress" />
          <div className="photo-lightbox-info">
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 32, color: "var(--accent)" }}>
              {fromKg(lightbox.weight)} {unitLabel}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{monthLabel(lightbox.date)}</div>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => setLightbox(null)}>Close</button>
        </div>
      )}

      <div className="page-header">
        <div className="page-title">PROGRESS<span className="accent-dot">.</span></div>
        {/* Unit toggle */}
        <div className="unit-toggle" style={{ width: 100 }}>
          <button className={`unit-btn ${unit === "kg" ? "active" : ""}`} onClick={() => setUnit("kg")}>KG</button>
          <button className={`unit-btn ${unit === "lbs" ? "active" : ""}`} onClick={() => setUnit("lbs")}>LBS</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px", marginBottom: 12 }}>
        {[["weight", "Body Weight"], ["photos", "Photos"], ["prs", "PRs"]].map(([t, l]) => (
          <button key={t} className="btn btn-secondary" style={{ flex: 1, fontSize: 12, padding: "8px 4px", ...(tab === t ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}) }} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {/* ── WEIGHT TAB ── */}
      {tab === "weight" && (
        <>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div className="card-label" style={{ margin: 0 }}>Weight Trend</div>
              {changeDisplay !== null && (
                <span className={`change-badge ${totalChange < 0 ? "change-down" : "change-up"}`}>
                  {totalChange < 0 ? "▼" : "▲"} {changeDisplay} {unitLabel}
                </span>
              )}
            </div>
            <LineChart data={chartData} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {weights.slice(-4).map((w, i) => (
                <div key={i} style={{ textAlign: "center", cursor: w.photoURL ? "pointer" : "default" }}
                  onClick={() => w.photoURL && setLightbox({ url: w.photoURL, date: w.date, weight: w.kg })}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: "var(--accent)" }}>{fromKg(w.kg)}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>{monthLabel(w.date)}</div>
                  {w.photoURL && <div style={{ fontSize: 9, color: "var(--accent2)", marginTop: 2 }}>📷</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-label">Log Weight</div>
            <div className="flex-row">
              <div className="input-group">
                <label className="input-label">Weight ({unitLabel})</label>
                <input className="text-input" type="number" step={unit === "lbs" ? "0.1" : "0.1"}
                  placeholder={unit === "lbs" ? "181.4" : "82.5"}
                  value={form.val} onChange={e => setForm(f => ({ ...f, val: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="text-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>

            {/* Photo upload */}
            <div className="input-group">
              <label className="input-label">Progress Photo (optional)</label>
              {form.photoURL ? (
                <div style={{ position: "relative" }}>
                  <img src={form.photoURL} alt="Preview" className="photo-preview" />
                  <button className="photo-entry-del" style={{ top: 8, right: 8, width: 28, height: 28, fontSize: 14 }}
                    onClick={() => { setForm(f => ({ ...f, photo: null, photoURL: null })); if (fileRef.current) fileRef.current.value = ""; }}>✕</button>
                </div>
              ) : (
                <div className="photo-upload-box">
                  <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handlePhotoChange} />
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>Tap to add a photo</div>
                  <div style={{ fontSize: 11, color: "var(--border)", marginTop: 4 }}>Camera or gallery</div>
                </div>
              )}
            </div>

            <button className="btn btn-primary" onClick={addWeight}>Save Entry</button>
          </div>
        </>
      )}

      {/* ── PHOTOS TAB ── */}
      {tab === "photos" && (
        <>
          <div className="card">
            <div className="card-label" style={{ marginBottom: 14 }}>Progress Photos</div>
            {weights.filter(w => w.photoURL).length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                No photos yet. Add one when you log your weight!
              </div>
            ) : (
              <div className="photo-grid">
                {weights.filter(w => w.photoURL).map((w, i) => (
                  <div key={i} className="photo-entry" onClick={() => setLightbox({ url: w.photoURL, date: w.date, weight: w.kg })}>
                    <img src={w.photoURL} alt="Progress" className="photo-entry-img" />
                    <div className="photo-entry-info">
                      <div className="photo-entry-date">{monthLabel(w.date)}</div>
                      <div className="photo-entry-weight">{fromKg(w.kg)} {unitLabel}</div>
                    </div>
                    <button className="photo-entry-del" onClick={e => {
                      e.stopPropagation();
                      setWeights(ws => ws.map(x => x === w ? { ...x, photoURL: null } : x));
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-side comparison if 2+ photos */}
          {weights.filter(w => w.photoURL).length >= 2 && (() => {
            const photos = weights.filter(w => w.photoURL);
            const first = photos[0];
            const last = photos[photos.length - 1];
            const diff = Math.round((last.kg - first.kg) * 10) / 10;
            return (
              <div className="card">
                <div className="card-label">Before vs Now</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[first, last].map((w, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <img src={w.photoURL} alt="" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: i === 0 ? "var(--muted)" : "var(--accent)", marginTop: 4 }}>
                        {fromKg(w.kg)} {unitLabel}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{monthLabel(w.date)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <span className={`change-badge ${diff < 0 ? "change-down" : "change-up"}`} style={{ fontSize: 14, padding: "4px 14px" }}>
                    {diff < 0 ? "▼" : "▲"} {fromKg(Math.abs(diff))} {unitLabel} total
                  </span>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ── PRs TAB ── */}
      {tab === "prs" && (
        <>
          <div className="card">
            <div className="card-label">Personal Records</div>
            {prs.length === 0 && <div className="empty-state">No PRs yet — start logging!</div>}
            {prs.map((pr, i) => (
              <div key={i} className="pr-item">
                <div className="pr-rank">{i + 1}</div>
                <div className="pr-info">
                  <div className="pr-ex">{pr.exercise}</div>
                  <div className="pr-date">{pr.reps} rep{pr.reps > 1 ? "s" : ""} · {monthLabel(pr.date)}</div>
                </div>
                <div className="pr-weight">{fromKg(pr.weight)}{unitLabel}</div>
                <button className="btn btn-sm" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }} onClick={() => setPRs(p => p.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-label">Log a PR</div>
            <div className="input-group"><label className="input-label">Exercise</label><input className="text-input" placeholder="e.g. Bench Press" value={prForm.exercise} onChange={e => setPRForm(f => ({ ...f, exercise: e.target.value }))} /></div>
            <div className="flex-row">
              <div className="input-group">
                <label className="input-label">Weight ({unitLabel})</label>
                <input className="text-input" type="number" placeholder={unit === "lbs" ? "225" : "100"} value={prForm.weight} onChange={e => setPRForm(f => ({ ...f, weight: e.target.value }))} />
              </div>
              <div className="input-group"><label className="input-label">Reps</label><input className="text-input" type="number" placeholder="1" value={prForm.reps} onChange={e => setPRForm(f => ({ ...f, reps: e.target.value }))} /></div>
            </div>
            <button className="btn btn-primary" onClick={addPR}>Save PR</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── AI PAGE ─────────────────────────────────────────────────────────────────
const AI_OWNER = "nathan"; // lowercase — only this username gets AI access

function AIPage({ userName }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! I'm your AI fitness coach. Ask me anything — training splits, nutrition, recovery, form tips, or just tell me your goals and I'll build you a plan." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const isOwner = (userName || "").toLowerCase().trim() === AI_OWNER;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // ── Coming soon screen for everyone else ──
  if (!isOwner) return (
    <div>
      <div className="page-header"><div className="page-title">AI COACH<span className="accent-dot">.</span></div></div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 30px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, marginBottom: 12, letterSpacing: "0.02em" }}>
          COMING SOON<span className="accent-dot">.</span>
        </div>
        <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, maxWidth: 280 }}>
          AI-powered coaching is on its way. Check back soon for personalised training and nutrition advice.
        </div>
        <div style={{ marginTop: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 24px", fontSize: 13, color: "var(--muted)" }}>
          In the meantime, check out the<br />
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>Templates</span> tab to plan your workouts
        </div>
      </div>
    </div>
  );

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    const newMsgs = [...messages, { role: "user", text: q }];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert personal trainer and sports nutritionist. Give concise, practical, evidence-based advice. Be direct and motivating. Keep responses focused — use short paragraphs or brief bullet points. No fluff. The user is an intermediate-level gym-goer.",
          messages: newMsgs.map(m => ({ role: m.role, content: m.text }))
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, couldn't get a response.";
      setMessages(m => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "Connection error — try again." }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">AI COACH<span className="accent-dot">.</span></div></div>
      <div style={{ padding: "0 20px", paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-bubble ${m.role === "user" ? "ai-user" : ""}`}>
            {m.role === "assistant" && <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}>AI COACH</div>}
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="ai-bubble">
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}>AI COACH</div>
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="ai-input-row">
        <input className="ai-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask your coach anything..." />
        <button className="btn btn-primary btn-sm" style={{ width: "auto", padding: "10px 16px" }} onClick={send}>↑</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ setPage, history, weights, prs, macroTargets, todayLog, userName, onOpenSettings }) {
  // Streak — count consecutive days with at least one workout going backwards from today
  const streak = (() => {
    if (!history.length) return 0;
    const dates = [...new Set(history.map(h => h.date))].sort().reverse();
    let count = 0;
    let cursor = new Date(); cursor.setHours(0,0,0,0);
    for (const d of dates) {
      const day = new Date(d); day.setHours(0,0,0,0);
      const diff = Math.round((cursor - day) / 86400000);
      if (diff === 0 || diff === 1) { count++; cursor = day; }
      else break;
    }
    return count;
  })();

  const sessionsThisWeek = (() => {
    const now = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
    return history.filter(h => new Date(h.date) >= startOfWeek).length;
  })();

  const latestWeight = weights.length ? weights[weights.length - 1].kg : null;
  const topPR = prs.length ? prs.reduce((a, b) => calcVolume(b) > calcVolume(a) ? b : b.weight > a.weight ? b : a, prs[0]) : null;
  const todayCalories = todayLog.reduce((a, i) => a + (i.cals || 0), 0);
  const nextMilestone = streak < 7 ? 7 : streak < 30 ? 30 : streak < 100 ? 100 : streak + 10;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Good work,</div>
          <div className="page-title">{(userName || "ATHLETE").toUpperCase()}<span className="accent-dot">.</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, color: "var(--muted)", letterSpacing: "0.1em" }}>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</div>
          <button className="btn btn-secondary btn-sm" onClick={onOpenSettings} style={{ fontSize: 11 }}>⚙ Settings</button>
        </div>
      </div>

      <div className="dash-grid">
        <div className="stat-card streak-card" style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div className="stat-val" style={{ fontSize: 64 }}>{streak}</div>
            <div className="stat-label">DAY STREAK 🔥</div>
          </div>
          <div style={{ flex: 1, textAlign: "right", color: "var(--muted)", fontSize: 13 }}>
            {streak === 0 ? "Log a workout to start your streak!" : `Next milestone: ${nextMilestone} days`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{latestWeight !== null ? latestWeight : "—"}</div>
          <div className="stat-label">Body weight (kg)</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{topPR ? `${topPR.weight}` : "—"}</div>
          <div className="stat-label">{topPR ? `${topPR.exercise} PR` : "No PRs yet"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: todayCalories > macroTargets.calories ? "var(--danger)" : "var(--accent)" }}>
            {todayCalories.toLocaleString()}
          </div>
          <div className="stat-label">Calories today</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{sessionsThisWeek}</div>
          <div className="stat-label">Sessions this week</div>
        </div>
      </div>

      {weights.length >= 2 ? (
        <div className="card">
          <div className="card-label">Weight Trend</div>
          <LineChart data={weights} />
          {(() => {
            const diff = Math.round((weights[weights.length-1].kg - weights[0].kg) * 10) / 10;
            return <div style={{ textAlign: "right", fontSize: 12, color: diff <= 0 ? "var(--green)" : "var(--danger)", marginTop: 6, fontWeight: 600 }}>
              {diff <= 0 ? "▼" : "▲"} {Math.abs(diff)}kg since {monthLabel(weights[0].date)}
            </div>;
          })()}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "24px 16px" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Log your weight in Progress to see your trend here</div>
        </div>
      )}

      <div style={{ padding: "0 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Quick Actions</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPage("workout")}>🏋️ Train</button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPage("nutrition")}>🥗 Food</button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPage("ai")}>🤖 Coach</button>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
function SettingsModal({ userName, macroTargets, onSave, onClose }) {
  const [name, setName] = useState(userName || "");
  const [macros, setMacros] = useState({ ...macroTargets });
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">SETTINGS</div>
        <div className="input-group">
          <label className="input-label">Your Name</label>
          <input className="text-input" placeholder="e.g. Nathan" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Daily Macro Targets</div>
        <div className="flex-row">
          <div className="input-group"><label className="input-label">Calories</label><input className="text-input" type="number" value={macros.calories} onChange={e => setMacros(m => ({ ...m, calories: +e.target.value }))} /></div>
          <div className="input-group"><label className="input-label">Protein (g)</label><input className="text-input" type="number" value={macros.protein} onChange={e => setMacros(m => ({ ...m, protein: +e.target.value }))} /></div>
        </div>
        <div className="flex-row">
          <div className="input-group"><label className="input-label">Carbs (g)</label><input className="text-input" type="number" value={macros.carbs} onChange={e => setMacros(m => ({ ...m, carbs: +e.target.value }))} /></div>
          <div className="input-group"><label className="input-label">Fat (g)</label><input className="text-input" type="number" value={macros.fat} onChange={e => setMacros(m => ({ ...m, fat: +e.target.value }))} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginBottom: 10 }} onClick={() => { onSave(name, macros); onClose(); }}>Save</button>
        <button className="btn btn-secondary" style={{ width: "100%" }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",      label: "Home",      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: "workout",   label: "Train",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 8l2 4-2 4M22 8l-2 4 2 4"/></svg> },
  { id: "nutrition", label: "Nutrition", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg> },
  { id: "progress",  label: "Progress",  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { id: "ai",        label: "Coach",     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

export default function App() {
  const [page, setPage] = useState("home");

  // ── Shared state lifted to root so Dashboard can read real data ──
  const [userName, setUserName] = useState("Nathan");
  const [macroTargets, setMacroTargets] = useState(DEFAULT_MACRO_TARGETS);
  const [history, setHistory] = useState([]);       // workout history
  const [weights, setWeights] = useState([]);       // bodyweight entries
  const [prs, setPRs] = useState([]);               // personal records
  const [todayLog, setTodayLog] = useState([]);     // today's food log
  const [settingsOpen, setSettingsOpen] = useState(false);

  const saveSettings = (name, macros) => {
    setUserName(name);
    setMacroTargets(macros);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {page === "home" && (
          <Dashboard
            setPage={setPage}
            history={history}
            weights={weights}
            prs={prs}
            macroTargets={macroTargets}
            todayLog={todayLog}
            userName={userName}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {page === "workout" && (
          <WorkoutPage history={history} setHistory={setHistory} />
        )}
        {page === "nutrition" && (
          <NutritionPage
            log={todayLog}
            setLog={setTodayLog}
            macroTargets={macroTargets}
          />
        )}
        {page === "progress" && (
          <ProgressPage
            weights={weights}
            setWeights={setWeights}
            prs={prs}
            setPRs={setPRs}
          />
        )}
        {page === "ai" && <AIPage userName={userName} />}
      </div>

      <nav className="nav">
        {NAV.map(n => (
          <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
            {n.icon}{n.label}
          </button>
        ))}
      </nav>

      {settingsOpen && (
        <SettingsModal
          userName={userName}
          macroTargets={macroTargets}
          onSave={saveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}
