# MonVoyage

A beautiful, interactive 3D visualization of the Monad ecosystem, showcasing projects organized by categories in an immersive three-dimensional space.

## 🌟 Features

### 3D Visualization

- **Interactive 3D Scene**: Navigate through projects in a three-dimensional space using Three.js
- **Dynamic Positioning**: Projects are intelligently positioned in 3D space based on category and project count
- **Smooth Animations**: GSAP-powered animations for camera movements and transitions
- **Collision Detection**: Automatic collision resolution ensures projects don't overlap

### Background Effects

- **Particle Cloud**: 50,000 animated particles creating a beautiful background atmosphere
- **Bird Flocking**: GPU-accelerated bird flocking simulation that responds to mouse movement
- **Single NFT Background**: Dynamic NFT rendering for selected categories

### User Experience

- **Category Navigation**: Scroll through categories with smooth marquee animations
- **Network Toggle**: Switch between Mainnet and Testnet projects
- **Project Details**: Click on project logos to view detailed information in a modal
- **Hover Tooltips**: Hover over projects to see their names
- **Keyboard Controls**: Navigate and zoom using arrow keys and mouse wheel
- **Dark/Light Mode**: Theme switching with persistent preferences

### Data Management

- **Hybrid Data Sources**: Combines project metadata from individual JSON files with logo/banner images from ecosystem data
- **Category Transformation**: Intelligent category merging and transformation based on project counts
- **Runtime Data Loading**: Dynamic loading of projects with graceful error handling

## 🛠️ Tech Stack

### Core

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Three.js** - 3D graphics and WebGL rendering

### UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Animata** - Animation components

### State Management

- **Zustand** - Lightweight state management with persistence
- **React Hooks** - Custom hooks for 3D scene management

### Animation & Effects

- **GSAP** - Animation library for smooth transitions
- **Custom Shaders** - GLSL shaders for particles and birds
- **GPU Computation** - GPU-accelerated bird flocking simulation

### Web3

- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd monvoyage
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3001`

## 🎮 Usage

### Keyboard Controls

#### Navigation (Projects Screen)

- **Arrow Keys** (↑↓←→): Pan the camera left, right, up, or down
- **Mouse Wheel**: Zoom in/out
- **+ / = / PageUp**: Zoom in
- **- / \_ / PageDown**: Zoom out
- **ESC**: Return to categories screen

#### Categories Screen

- **Scroll**: View scrolling category cards
- **Click**: Select a category to view its projects

### Mouse Controls

- **Click Project Logo**: Open project details modal
- **Hover Project Logo**: Show project name tooltip
- **Mouse Movement**: Affects bird flocking behavior and camera subtle movement

### Network Switching

- Use the **Mainnet/Testnet toggle** in the navbar (visible only on categories screen)
- Switching networks automatically reloads project data and returns to categories screen

## 📁 Project Structure

```
monvoyage/
├── src/
│   ├── components/          # React components
│   │   ├── CategoryButtons.tsx
│   │   ├── ControlsHint.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProjectTooltip.tsx
│   │   └── ScrollingCategories.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useBirdsBackground.ts
│   │   ├── useCategoryNavigation.ts
│   │   ├── useHotspots.ts
│   │   ├── useParticlesBackground.ts
│   │   ├── useSingleNFTBackground.ts
│   │   └── useThreeScene.ts
│   ├── shaders/             # GLSL shaders
│   │   ├── birdFragmentShader.ts
│   │   ├── birdPositionShader.ts
│   │   ├── birdVelocityShader.ts
│   │   ├── birdVertexShader.ts
│   │   ├── particleFragmentShader.ts
│   │   └── particleVertexShader.ts
│   ├── services/            # Business logic
│   │   ├── generateEcoCategories.ts
│   │   └── indexer.ts
│   ├── stores/              # State management
│   │   └── themeStore.ts
│   ├── utils/               # Utility functions
│   │   └── loadProjectData.ts
│   ├── data/                # Project data
│   │   ├── mainnet/         # Mainnet project files
│   │   ├── testnet/         # Testnet project files
│   │   ├── categories.json  # Category reference
│   │   └── monad_ecosystem.json  # Logo/banner metadata
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 📊 Data Structure

### Project Files

Each project in `mainnet/` or `testnet/` is a JSON file with the following structure:

```json
{
  "name": "Project Name",
  "description": "Project description",
  "categories": ["DeFi::DEX", "DeFi::Lending"],
  "live": true,
  "addresses": {
    "ContractName": "0x..."
  },
  "links": {
    "project": "https://...",
    "twitter": "https://...",
    "docs": "https://..."
  }
}
```

### Data Loading

1. **Category Generation**: `generateEcoCategories.ts` reads all project files and generates transformed categories
2. **Project Loading**: `loadProjectData.ts` merges project data with logo/banner from `monad_ecosystem.json`
3. **Runtime**: Data is loaded asynchronously when the app starts or network changes

## 🎨 Customization

### Theme Colors

Edit `src/stores/themeStore.ts` to customize light/dark theme colors:

```typescript
export const themeColors = {
  light: {
    background: 0xf5f5f5,
    navbarBg: '#ffffff',
    // ... more colors
  },
  dark: {
    background: 0x0b0a0f,
    navbarBg: '#141419',
    // ... more colors
  },
}
```

### Particle Settings

Modify `src/hooks/useParticlesBackground.ts`:

- `PARTICLE_COUNT`: Number of particles (default: 50000)
- `SPREAD`: Distribution area (default: 30)
- Color palettes in `colorPalette` array

### Bird Flocking

Adjust `src/hooks/useBirdsBackground.ts`:

- `WIDTH`: Grid size (default: 22, creates 484 birds)
- `BOUNDS`: Flocking area (default: 800)

## 🚀 Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Adding New Projects

1. Create a JSON file in `src/data/mainnet/` or `src/data/testnet/`
2. Follow the project file structure (see Data Structure section)
3. Ensure the project name matches an entry in `monad_ecosystem.json` for logo/banner
4. The app will automatically pick up the new project on next load

### Adding Categories

Categories are automatically generated from project files. To add a new category:

1. Add the category to a project's `categories` array
2. The system will automatically include it in the category list
3. Category transformation rules apply (see Category Transformation section)

## 🐛 Troubleshooting

### Projects Not Showing

- Check that project files are valid JSON
- Ensure `categories` array is present and non-empty
- Verify project name matches `monad_ecosystem.json` for logo/banner

### 3D Scene Not Rendering

- Check browser console for WebGL errors
- Ensure GPU acceleration is enabled
- Try a different browser (Chrome/Firefox recommended)

### Performance Issues

- Reduce `PARTICLE_COUNT` in `useParticlesBackground.ts`
- Reduce `WIDTH` in `useBirdsBackground.ts` (fewer birds)
- Check browser DevTools Performance tab for bottlenecks

---

Built with ❤️ for the Monad ecosystem
