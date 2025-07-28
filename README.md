# JaxFluids Frontend

A modern, interactive web application for running and visualizing scientific fluid dynamics simulations using ONNX models, built with React, Vite, Zustand, and Tailwind CSS.

## Overview

JaxFluids provides a user-friendly interface to select, run, and visualize results from various scientific models (e.g., linear advection, Sod shock tube) powered by ONNX models. The app supports dynamic model selection, real-time simulation controls, and rich charting for scientific data.

## Features

- **Model Selection:** Choose from multiple pre-configured scientific models and datasets.
- **Simulation Controls:** Start, pause, resume, and stop simulations. Adjust time step interactively.
- **Real-Time Visualization:** View simulation results with responsive charts for each model channel.
- **Progress Feedback:** See initialization and simulation progress with loading indicators.
- **Extensible Architecture:** Easily add new models and adapters.

## Tech Stack

- **ONNX Runtime Web** for running models in-browser
- **npyjs** for loading NumPy data
- **Recharts** for charting

## Project Structure

```
frontend/
  ├── public/models/           # ONNX models and data
  ├── src/
  │   ├── components/         # UI components (ModelSelector, SimulationControls, etc.)
  │   ├── hooks/              # Custom hooks for simulation and chart logic
  │   ├── models/             # Model registry and adapters
  │   ├── config/             # Model configuration
  │   ├── types/              # TypeScript types
  │   └── App.tsx             # Main application entry
  ├── index.html
  ├── package.json
  └── vite.config.ts
```

## Available Models

- **Linear Advection v1 & v2**
  - Models: `model.onnx`, `model_slim.onnx`
  - Data: `data.npy`
- **Sod Shock Tube**
  - Variants: WENO3-JS, WENO5-JS, WENO5-Z
  - Models: `model.onnx`, `model_slim.onnx`
  - Data: `data_v1.npy` ... `data_v5.npy`

See `src/config/models.ts` for full configuration and how to add new models.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Bun](https://bun.sh/) (for package management and running scripts)

### Install Dependencies

```bash
bun run install
```

### Run in Development

```bash
bun run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Build for Production

```bash
bun run build
```

## Main Components

- **ModelSelector:** Selects model and dataset
- **SimulationControls:** Run, pause, resume, stop, and adjust time step
- **SimulationResults:** Displays simulation output charts
- **SimulationChart:** Renders data for each channel
- **LoadingSpinner:** Shows loading/progress state

## Adding New Models

1. Place your ONNX model and data files in `public/models/`.
2. Add a new entry in `src/config/models.ts` with the appropriate configuration.
3. (Optional) Implement a new adapter in `src/models/adapterTypes/` if needed.

## Development Notes

- Uses Zustand for global state management.
- All simulation logic is handled via custom hooks in `src/hooks/simulation/`.
- Charting is handled by Recharts in `SimulationChart`.
- Styling is via Tailwind CSS (see `src/index.css`).
- Vite is used for fast builds and HMR.

# TODO

- Resolution buttons 4 button for each maybe (It should restart it with the new resolution)
