<div align="center">

<img src="public/images/helios-logo-placeholder.png" alt="Helios Solar" width="72" height="72" />

# Helios Solar Calculator

**An immersive solar energy calculator with real-time 3D visualization**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=threedotjs)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Live Demo](#) · [Report a Bug](https://github.com/hamzak2k17/Helios-Solar-Calcualtor/issues) · [Request Feature](https://github.com/hamzak2k17/Helios-Solar-Calcualtor/issues)

</div>

---

## Overview

Helios is a premium solar energy calculator that goes far beyond spreadsheets. Input your energy bill and location, and get a full financial breakdown — 25-year savings projections, payback period, CO₂ offset — all backed by real NREL irradiance data for 35 US cities.

Then step into `/v2`: a fully interactive 3D scene where you can orbit around a house, click individual solar panels, watch energy flow from sun to panels to grid in real time, and toggle between day and night.

> Built as a personal project to explore what a modern, design-forward solar tool could look like.

---

## Screenshots

> **Add your screenshots here.** Replace the placeholder paths below with actual images after running the app.

### Main Calculator

![Calculator Hero](public/images/screenshot-hero.png)
*Hero section with animated background orbs and stats*

![Calculator Wizard](public/images/screenshot-wizard.png)
*4-step guided wizard — bill, location, roof, lifestyle*

![Results Dashboard](public/images/screenshot-results.png)
*Results: 25-year savings chart, production vs. usage, environmental impact, live mode*

### 3D Experience (`/v2`)

![3D Scene Day](public/images/screenshot-3d-day.png)
*Daytime — solar panels glowing, energy particles flowing sun → panels → home → grid*

![3D Scene Night](public/images/screenshot-3d-night.png)
*Night mode — stars, moonlight, house windows warmly lit*

![3D HUD](public/images/screenshot-hud.png)
*Tesla-style HUD overlay — live kW output, efficiency, simulated time, energy flow bar*

---

## Features

### Calculator (`/`)
- **4-step wizard** — monthly bill, location, roof size, lifestyle (EV, pool, WFH, AC)
- **35-city irradiance database** — real NREL peak sun-hour data per US region
- **Full financial model** — gross cost, federal ITC (30%), net cost, payback period, 25-year NPV
- **Interactive charts** — cumulative cash flow area chart with break-even line, annual production vs. usage bar chart
- **Animated metric cards** — spring-physics number animations, scroll-triggered reveals
- **Live Mode** — real-time solar production simulation with bell-curve irradiance and sparkline history
- **Energy flow diagram** — SVG animation of sun → panels → home → grid with flowing particles
- **3D card tilt** — mouse-tracking perspective tilt on result cards

### 3D Experience (`/v2`)
- **React Three Fiber scene** — procedural house, flat roof, wing extension, driveway, lawn
- **6 interactive solar panels** — hover glow, click to select, per-panel output shown in popup
- **Dynamic sky** — Drei `<Sky>` with turbidity/rayleigh tuned per time of day; `<Stars>` at night
- **Golden hour atmosphere** — warm directional light at sunrise/sunset, cool moonlight at night
- **Particle energy streams** — `InstancedMesh` particles along Catmull-Rom curves (sun→panels, panels→house, house→grid)
- **Simulated day clock** — auto-advancing hour with solar factor driving light intensity and particle speed
- **Day/Night toggle** — instant atmospheric switch with fog and hemisphere light changes
- **Tesla-style HUD** — glass-morphism overlay with live kW, efficiency bar, time arc, energy flow nodes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| 3D Engine | React Three Fiber + Drei + Three.js |
| Charts | Recharts |
| State | Zustand v5 (persisted) |
| UI Components | ShadCN UI |
| Font | Inter (next/font) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/hamzak2k17/Helios-Solar-Calcualtor.git
cd Helios-Solar-Calcualtor

# Install dependencies
npm install --legacy-peer-deps

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the calculator.
Open [http://localhost:3000/v2](http://localhost:3000/v2) for the 3D experience.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
helios-solar/
├── app/
│   ├── layout.tsx              # Root layout, Inter font, dark theme
│   ├── page.tsx                # Landing page
│   └── v2/
│       ├── page.tsx            # /v2 server component + metadata
│       ├── ClientEntry.tsx     # Dynamic import wrapper (SSR off)
│       └── components/
│           ├── SolarExperience.tsx   # Canvas + UI orchestrator
│           ├── SolarScene.tsx        # Sky, lighting, ground, OrbitControls
│           ├── HouseModel.tsx        # Procedural house + solar panels
│           ├── EnergyFlow.tsx        # Particle stream system
│           └── UIOverlay.tsx         # Glass HUD components
├── components/
│   ├── hero/
│   │   └── HeroSection.tsx           # Animated hero with parallax orbs
│   ├── calculator/
│   │   ├── CalculatorWizard.tsx      # Step orchestration
│   │   ├── ResultsView.tsx           # Full results dashboard
│   │   ├── LivePreviewPanel.tsx      # Live preview sidebar
│   │   └── steps/                    # Step1–Step4 form screens
│   ├── charts/
│   │   ├── SavingsLineChart.tsx      # 25-year cumulative cash flow
│   │   └── ProductionBarChart.tsx    # Annual production vs. usage
│   ├── visualizations/
│   │   ├── EnergyFlowDiagram.tsx     # SVG animated flow diagram
│   │   └── LiveModePanel.tsx         # Real-time production panel
│   └── ui/                           # ShadCN components + AnimatedNumber
├── hooks/
│   └── useLiveProduction.ts          # Bell-curve solar simulation hook
├── lib/
│   └── solarCalculations.ts          # 6-stage pure calculation engine
└── store/
    └── calculatorStore.ts            # Zustand persisted store
```

---

## Solar Calculation Engine

The engine in `lib/solarCalculations.ts` is a pure-function pipeline with 6 stages:

1. **Irradiance lookup** — matches location to NREL peak sun hours (35-city DB)
2. **System sizing** — panels from roof size, watt-peak, usable area ratio
3. **Annual production** — kWh from system size × peak hours × performance ratio
4. **Financial model** — gross cost → federal ITC → net cost → monthly savings → payback
5. **25-year projection** — cumulative cash flow with 2.5% utility inflation, 0.5% panel degradation
6. **Environmental impact** — CO₂ offset, cars equivalent, trees equivalent

No external API calls. All calculations run client-side.

---

## Environment Variables

This project requires **no environment variables** to run. Everything is client-side with no external API dependencies.

If you extend it with a backend (e.g. utility rate API, weather data), create a `.env.local` file — it is already excluded from git via `.gitignore`.

---

## Roadmap

- [ ] Roof orientation + tilt angle input
- [ ] Battery storage (home battery) sizing
- [ ] Real utility rate lookup by zip code
- [ ] PDF/share export for results
- [ ] Mobile-optimized 3D view
- [ ] Dark/light theme toggle on main calculator

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## Author

<div align="center">

**Shaikh Hamza**

*Designer & Developer*

[![Website](https://img.shields.io/badge/shaikhhamza.com-000?style=for-the-badge&logo=google-chrome&logoColor=white)](https://shaikhhamza.com)
[![Email](https://img.shields.io/badge/hi@shaikhhamza.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:hi@shaikhhamza.com)
[![GitHub](https://img.shields.io/badge/hamzak2k17-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hamzak2k17)

</div>

---

<div align="center">

Built with care · Powered by real NREL irradiance data · No tracking, no API keys, no backend

</div>
