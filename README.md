# Target Illumination by Clinical Trial Analytics & Citations (TICTAC) UI

TICTAC is a web-based research platform designed to illuminate drug targets through clinical evidence. It aggregates and scores disease-target associations from over 500K+ clinical trials, allowing researchers to explore validated targets and trace their provenance back to source publications and trials.

This project is the frontend mapping to the TICTAC-API, built using modern web development standards to provide an intuitive, responsive, and performance-driven experience.

## Features

- **Evidence Landscape Exploration**: Search for specific diseases or gene targets to view ranked associations based on clinical evidence. Uncover detailed studies on drug and biological targets.
- **Target Development Levels (TDL)**: Targets are classified into four key categories representing drug discovery maturity: `Tclin` (Approved drugs), `Tchem` (Active compounds), `Tbio` (Biological annotation), and `Tdark` (Understudied).
- **Comprehensive Dashboard**: Visualizes data through interactive scatter plots and evidence tables to quickly identify high-potential targets filtering by disease or gene symbol.
- **Detailed Evidence Trail**: Drill down into specific disease-target associations to view reference weights (`RESULT`, `BACKGROUND`, `DERIVED`), publication counts, newness percentage, and direct links to ClinicalTrials.gov (NCT IDs) and PubMed (PMIDs).

## Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI) + [Lucide Icons](https://lucide.dev/)
- **Data Fetching & State**: [React Query (v5)](https://tanstack.com/query/latest)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)

## Local Setup

### Prerequisites

- Node.js (v18+ recommended)
- The TICTAC backend API running locally for data population.

### Development Environment

1. **Setup TICTAC-API**: Ensure the backend API is running in development mode. Follow the [TICTAC-API development setup instructions](https://github.com/unmtransinfo/TICTAC-API?tab=readme-ov-file#development-setup). By default, the frontend proxies API requests to `http://localhost:8000`.

2. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**:
   If your API runs on a different host or port, you can configure the target base proxy variable before running:
   ```bash
   VITE_API_PROXY_TARGET=http://your-custom-api-url npm run dev
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the App**:
   Navigate to [http://localhost:5173/tictac/](http://localhost:5173/tictac/) in your browser. 
   *(Note: The vite config sets a base URL of `/tictac/`)*

## Project Structure

```text
src/
├── components/          # Reusable UI elements (SearchBar, EvidenceTable, scatter plots, etc.)
│   └── ui/              # Base shadcn/ui components (buttons, badges, toaster)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions (tailwind merge) and API integration logic (fetchCounts, fetchAssociationSummary, etc.)
├── pages/               # Top-level page components (Index, Dashboard, EvidenceDetail, NotFound)
├── types/               # TypeScript interfaces and type definitions (Evidence, ReferenceType, TDL, DiseaseTargetAssociation)
└── App.tsx              # Main application root, query clients, toaster setup, and routing declaration
```

## Available Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the application for production mode.
- `npm run preview` - Locally preview the production build.
- `npm run lint` - Run ESLint across the codebase.
- `npm run test` - Run Vitest testing suite.
- `npm run knip` - Find unused files, dependencies, and exports.

## Methodology

This application serves as the frontend for the TICTAC research platform. To understand the underlying algorithms, evidence weighting mechanisms, scoring processes, and target development levels, reference the published peer-reviewed methodology paper: 

[Target Illumination by Clinical Trial Analytics & Citations (TICTAC) methodology](https://www.frontiersin.org/journals/bioinformatics/articles/10.3389/fbinf.2025.1579865/full).
