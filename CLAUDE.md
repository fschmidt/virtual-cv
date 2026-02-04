# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zoomable CV Graph - an interactive, graph-based CV website that serves as both a virtual CV and a portfolio project. Users explore professional information through a zoomable canvas with progressive disclosure (overview → details).

## Current State

**Phase 1 (UI Prototype) - Near Complete**

The frontend prototype is functional with:
- Interactive mind-map style graph using React Flow
- Three-state node system (detailed, quickview, dormant)
- Business card profile node with photo
- Dark theme with purple accent colors
- Deployed to GitHub Pages via GitHub Actions
- **Clean data architecture** with virtual API service pattern
- **Markdown content rendering** in detailed views
- **Real CV data** extracted from actual resume

**Live URL:** https://fschmidt.github.io/virtual-cv/

## Monorepo Structure

```
virtual-cv/
├── virtual-cv-ui/          # React + Vite + TypeScript frontend
│   └── src/
│       ├── components/
│       │   └── GraphNode.tsx   # Unified node component with markdown
│       ├── types/              # TypeScript interfaces
│       │   ├── cv.types.ts     # Domain model (CVNode, CVProfileNode, etc.)
│       │   └── graph.types.ts  # UI types (NodeState, GraphNodeData)
│       ├── data/
│       │   └── cv-content.ts   # CV structure data (nodes, positions)
│       ├── content/
│       │   └── cv-content.md   # Markdown content by node ID
│       ├── services/
│       │   ├── cv.service.ts   # Virtual API service
│       │   ├── cv.mapper.ts    # Data → React Flow transformation
│       │   └── content.service.ts  # Markdown parser
│       ├── App.tsx             # Main app (simplified)
│       └── App.css             # All styling
├── virtual-cv-api/         # Java Spring Boot backend (future)
├── docs/                   # Project documentation
│   └── initial-roadmap.md  # Full project roadmap
└── .github/workflows/
    └── deploy.yml          # GitHub Pages deployment
```

## Commands

### Frontend (virtual-cv-ui)

```bash
cd virtual-cv-ui
npm install          # install dependencies
npm run dev          # start dev server (http://localhost:5173)
npm run build        # production build (outputs to dist/)
npm run lint         # run ESLint
npm run preview      # preview production build
```

## Architecture Details

### Node System

All nodes use a single `GraphNode` component with three states:

| State | Appearance | When |
|-------|------------|------|
| **detailed** | Full content, large | Node is selected |
| **quickview** | Circular, 5rem, label visible | Child of selected OR ancestor of selected |
| **dormant** | Small dot (10px) | Everything else |

### Node Types

- `profile` - Business card with photo, title, experience, contact
- `category` - Top-level groups (Work, Skills, Projects, Education)
- `item` - Individual entries (jobs, projects, degrees)
- `skill-group` - Skill categories (Frontend, Backend, DevOps)
- `skill` - Individual skills (React, Java, Docker)

### Data Architecture

**Domain types** (`types/cv.types.ts`):
```typescript
type CVNodeType = 'profile' | 'category' | 'item' | 'skill-group' | 'skill';

interface CVNodeBase {
  id: string;
  type: CVNodeType;
  parentId: string | null;
  label: string;
}
// Extended by: CVProfileNode, CVItemNode, CVSkillNode, etc.
```

**Content** (`content/cv-content.md`):
- Markdown file with sections delimited by `# node-id`
- Parsed at build time into per-node content map
- Rendered with react-markdown in detailed views

**Service pattern** (`services/`):
- `cvService.getCVData()` - returns all CV data (mock API)
- `buildNodes()` / `buildEdges()` - transform to React Flow format
- `getAllContent()` - returns parsed markdown by node ID

Edges auto-generated from parent-child relationships.

### Styling

- Dark theme: `#0d0d14` background, `#1a1a2e` nodes
- Purple accent: `#667eea` → `#764ba2` gradient
- All sizes in `rem` for quickview nodes
- Edges: straight lines, connect to node centers, render behind nodes

## Target Architecture (Future)

- **Frontend:** React + React Flow (current)
- **Backend:** Java + Spring Boot REST API
- **Persistence:** PostgreSQL + S3-compatible storage (MinIO)
- **Deployment:** Oracle Cloud free tier with Kubernetes (OKE) or simple VM
- **CI/CD:** GitHub Actions

## Design Principles

- Progressive disclosure: overview → details on click
- Rich content in inspector panel, not on canvas nodes
- Start with hardcoded data, migrate to API/DB once model stabilizes
- Dark, modern aesthetic matching business card style
- Nodes small in preview, expand on selection

## Session Summary (Feb 2025)

### What Was Built

1. **Project Setup**
   - Initialized git repo, connected to GitHub (fschmidt/virtual-cv)
   - Created monorepo structure (virtual-cv-ui, virtual-cv-api)
   - Scaffolded React + Vite + TypeScript app
   - Added React Flow dependency

2. **GitHub Actions Deployment**
   - Created `.github/workflows/deploy.yml`
   - Configured Vite base path for GitHub Pages
   - Fixed npm registry issue (was pointing to private Nexus)
   - Enabled GitHub Pages with Actions source

3. **Graph Implementation**
   - Built interactive node graph with sample CV data
   - Implemented three-state system (detailed/quickview/dormant)
   - Added click navigation: select node → children become visible
   - Full ancestor path stays visible (breadcrumb)

4. **Styling & Design**
   - Dark theme throughout
   - Business card design for profile node (photo, title, experience)
   - Circular quickview nodes (5rem)
   - Straight edge lines connecting to node centers
   - Removed background grid

5. **Code Cleanup**
   - Unified all nodes into single `GraphNode` component
   - Consolidated CSS with consistent class naming
   - Removed redundant component files

### Recently Completed

6. **Data Architecture Refactor**
   - Separated data into `types/`, `data/`, `services/`, `content/` folders
   - Created virtual API service pattern (ready for real backend)
   - Extracted real CV data from PDF

7. **Markdown Content**
   - Added react-markdown for rich content rendering
   - Content stored in single `cv-content.md` file
   - Detailed views now show formatted markdown (headings, lists, code)

### Pending / Next Steps

- [ ] Add smooth animations/transitions when expanding nodes
- [ ] Add search functionality (Cmd+K)
- [ ] Add home/reset navigation button
- [ ] Consider auto-layout algorithm for node positioning
- [ ] Backend API (Phase 2) - service pattern is ready
