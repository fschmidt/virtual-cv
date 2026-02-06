# Virtual CV UI

React frontend for the Virtual CV application -- an interactive, graph-based CV viewer.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7
- @xyflow/react 12 (graph canvas)
- react-markdown (content rendering)
- lucide-react (icons)

## Development

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build (tsc + vite, outputs to dist/)
npm run lint         # ESLint
npm run preview      # Preview production build
npm run generate-api # Regenerate API client from OpenAPI spec
```

## Components

| Component | Lines | Description |
|-----------|-------|-------------|
| `InspectorPanel.tsx` | 696 | Side panel showing node details, edit form, markdown content |
| `CreateNodeDialog.tsx` | 327 | Modal for creating new nodes (type-specific fields) |
| `SearchDialog.tsx` | 221 | Cmd+K search dialog with keyboard navigation |
| `GraphNode.tsx` | 152 | Unified node component with 3 visual states |
| `StandardCVView.tsx` | 143 | Traditional linear CV view (alternative to graph) |
| `FeatureTogglePopup.tsx` | 110 | Dev feature flag toggle UI (Ctrl+Shift+D) |
| `DeleteConfirmDialog.tsx` | 104 | Delete confirmation with cascade warning |
| `ViewToggle.tsx` | 100 | Graph/CV view and edit mode toggle |
| `Toast.tsx` | 99 | Toast notification system (success/error/info) |
| `SectionIcon.tsx` | 66 | SVG icon renderer for category sections |
| `LoadingSkeleton.tsx` | 36 | Loading placeholder during API fetch |

## Services

| Service | Description |
|---------|-------------|
| `cv.service.ts` | API wrapper with in-memory caching and type mapping (API DTO -> frontend types) |
| `cv.mapper.ts` | Transforms CVData into React Flow nodes/edges with state computation |
| `content.service.ts` | Parses `cv-content.md` into per-node markdown sections |
| `layout.service.ts` | Node size calculations for graph layout |

## State Management

`App.tsx` (408 lines) serves as the application shell. State is managed via React hooks (`useState`, `useRef`, `useCallback`) with no external state library. The `cvService` singleton provides a manual cache layer over the generated API client.

Key state:
- `cvData` -- full CV graph data from the API
- `selectedId` -- currently selected node (synced to URL hash for deep linking)
- `viewMode` -- graph or standard CV view
- `editMode` -- feature-flagged edit mode (Ctrl+Shift+D to toggle)
- `contentMap` -- markdown content mapped by node ID

## Styling

All styles live in `App.css` (2,431 lines) -- a single monolithic stylesheet with no CSS modules. Dark theme with:
- Background: `#0d0d14`
- Node background: `#1a1a2e`
- Accent: `#667eea` -> `#764ba2` gradient
- Draft nodes: dashed border, amber color

## API Integration

```
generated.ts (Orval, auto-generated)  ->  fetcher.ts (custom fetch wrapper)  ->  cv.service.ts
```

The API client is generated from the backend's OpenAPI spec via Orval. **Never edit `generated.ts` manually** -- regenerate with `npm run generate-api`.

Environment variable `VITE_API_URL` overrides the API base URL (default: `http://localhost:9823`).
