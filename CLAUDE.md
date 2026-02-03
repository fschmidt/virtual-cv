# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zoomable CV Graph - an interactive, graph-based CV website that serves as both a virtual CV and a portfolio project. Users explore professional information through a zoomable canvas with progressive disclosure (overview → details).

## Target Architecture

- **Frontend:** React + React Flow (graph visualization)
- **Backend:** Java + Spring Boot REST API
- **Persistence:** PostgreSQL (structured data) + S3-compatible storage like MinIO (media)
- **Tooling:** CLI client, Docker Compose, CI pipeline

## Key Concepts

- **Nodes:** Category nodes (Work, Skills, Projects), Item nodes (Job, Project, Education), Tag/Skill nodes
- **Edges:** Relationships between nodes with type, label, and order
- **Inspector Panel:** Rich content display (markdown, images, links) - keeps canvas nodes lightweight
- **Views/Scenes:** Predefined graph entry points for guided navigation

## Development Phases

1. React + React Flow UI prototype (no backend, hardcoded data)
2. Java API serving graph from JSON/YAML files
3. CLI client (search, node lookup, export)
4. PostgreSQL + object storage migration
5. Minimal admin/CMS capabilities
6. Docker Compose deployment with CI

## Monorepo Structure

- `virtual-cv-ui/` - React + Vite + TypeScript frontend
- `virtual-cv-api/` - Java Spring Boot backend (future)
- `docs/` - Project documentation and roadmap

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

## Design Principles

- Rich content belongs in the inspector panel, not on canvas nodes
- Start with content-as-code (JSON/YAML), migrate to DB once model stabilizes
- Avoid CMS scope creep - "CMS-like" is sufficient
- Finish features completely rather than many partially
