
# Qwix To Do: Intelligent Task Management

<div align="center">
  <img src="public/brain-circuit.svg" alt="Qwix To Do Logo" width="120" />
</div>

## About Qwix To Do

Qwix To Do is an advanced task management application that leverages MeTTa principles for intelligent task scheduling and optimization. Unlike traditional to-do apps, Qwix To Do understands task dependencies and uses graph-based algorithms to optimize your workflow.

## Unique Features

- **Intelligent Task Prioritization**: MeTTa-powered algorithms calculate task importance based on dependencies and deadlines
- **Dependency Visualization**: Interactive graph display showing task relationships
- **Spreading Activation Algorithms**: Determines optimal task sequence using advanced graph theory
- **Time Efficiency Analytics**: Tracks estimated vs. actual completion times
- **Dark/Light Theme**: Seamless theme switching based on user preference or system settings

## Project Architecture

```
┌─ User Interface ─────────┐       ┌─ Core Logic ─────────────┐
│                          │       │                          │
│  ┌─ Components ────────┐ │       │  ┌─ MeTTa Service ─────┐ │
│  │ - TaskList          │ │       │  │ - AtomSpace         │ │
│  │ - TaskItem          │ │       │  │ - Knowledge Graph   │ │
│  │ - TaskForm          │ │ ←───→ │  │ - Activation Logic  │ │
│  │ - DependencyGraph   │ │       │  └────────────────────┘ │
│  │ - TaskAnalytics     │ │       │                          │
│  └────────────────────┘ │       │  ┌─ Task Scheduler ────┐ │
│                          │       │  │ - Dependency Solver │ │
│  ┌─ Pages ─────────────┐ │       │  │ - Priority Engine   │ │
│  │ - Dashboard         │ │       │  │ - Deadline Manager  │ │
│  │ - About             │ │ ←───→ │  └────────────────────┘ │
│  └────────────────────┘ │       │                          │
└──────────────────────────┘       └──────────────────────────┘
```

## Tech Stack

| Technology | Purpose | Description |
|------------|---------|-------------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black) | Frontend UI | Component-based UI library for building interactive interfaces |
| ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Type Safety | Strongly typed programming language built on JavaScript |
| ![Tailwind CSS](https://img.shields.io/badge/-Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | Styling | Utility-first CSS framework for rapid UI development |
| ![shadcn/ui](https://img.shields.io/badge/-shadcn/ui-000000?style=flat) | UI Components | Beautifully designed, accessible component library |
| ![Recharts](https://img.shields.io/badge/-Recharts-22B5BF?style=flat) | Data Visualization | Composable chart library for React applications |
| ![MeTTa](https://img.shields.io/badge/-MeTTa-9B30FF?style=flat) | Task Intelligence | Graph-based knowledge representation for advanced task scheduling |
| ![SingularityNET](https://img.shields.io/badge/-SingularityNET-8A2BE2?style=flat) | AI Framework | Decentralized marketplace for AI algorithms |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white) | Build Tool | Next-generation frontend tooling for fast development |

## MeTTa Integration Details

The core of Qwix To Do is powered by MeTTa principles:

1. **AtomSpace Implementation**: Tasks and their relationships are represented as a knowledge graph
2. **Spreading Activation**: Task priorities are calculated by propagating "activation energy" through connected nodes
3. **Topological Sorting**: Determines the optimal sequence of tasks based on dependencies
4. **Symbolic AI**: Leverages graph-based symbolic reasoning for task organization

## Getting Started

```bash
# Clone the repository
git clone https://github.com/dspraneeth07/qwix-todo.git

# Navigate to project directory
cd qwix-todo

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

The application is optimized for deployment on Netlify with proper routing configuration for single-page application behavior.

## Designed and Developed by Team QwikZen

- **Dhadi Sai Praneeth Reddy** - [GitHub](https://github.com/dspraneeth07)
- **Kasireddy Manideep Reddy** - [GitHub](https://github.com/dspraneeth07)

© 2023 QwikZen Group India. All rights reserved.
