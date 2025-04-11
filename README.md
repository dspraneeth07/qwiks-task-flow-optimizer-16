
# Qwix To Do: Intelligent Task Management

![Qwix To Do](public/brain-circuit.svg)

## About the Project

Qwix To Do is an advanced task management application that uses MeTTa principles for intelligent task scheduling and optimization. The application employs graph-based knowledge representation to create optimized task schedules based on dependencies, priorities, and deadlines.

## Key Features

- **MeTTa-powered Task Scheduling**: Utilizes graph-based knowledge representation for optimized task ordering
- **Dependency Visualization**: Interactive graph visualization showing task dependencies
- **Intelligent Priority Calculation**: Uses spreading activation algorithms to determine task priorities
- **Time Tracking & Efficiency**: Real-time tracking of estimated vs. actual task completion time
- **Comprehensive Analytics**: Detailed data visualizations for task status, priority distribution, and time efficiency
- **Dark Mode Support**: System-matched or manually selected theme options

## Technology Stack

- **Frontend**: React with TypeScript for type-safe development
- **State Management**: React Hooks and Context for efficient state management
- **Styling**: Tailwind CSS for rapid, responsive UI development
- **UI Components**: shadcn/ui for beautifully designed, accessible components
- **Data Visualization**: Recharts for comprehensive analytics and dependencies visualization
- **AI Framework**: Custom MeTTa implementation for intelligent task prioritization
- **Build Tool**: Vite for fast development and optimized builds

## MeTTa Integration

The project implements several core MeTTa concepts:

1. **Graph Representation**: Tasks and dependencies are represented as nodes and links in a custom AtomSpace
2. **AtomSpace Manipulation**: Functions for adding, removing, and querying atoms in the knowledge graph
3. **Spreading Activation**: Algorithm for calculating priorities by propagating "activation energy" through the dependency network
4. **Topological Sorting**: Tasks are ordered based on their dependencies to ensure proper sequencing

## SingularityNET Alignment

The project aligns with SingularityNET principles by:
- Using symbolic AI representation (AtomSpace)
- Implementing graph-based reasoning
- Focusing on knowledge representation and manipulation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dspraneeth07/qwix-todo.git

# Navigate to the project directory
cd qwix-todo

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. Create tasks with titles, descriptions, priorities, and deadlines
2. Establish dependencies between tasks
3. View the recommended task order in the list view
4. Track task completion and time efficiency
5. Analyze task performance in the analytics tab
6. Visualize task dependencies in the graph view
7. Explore MeTTa task activation values in the dedicated tab

## Project Structure

```
src/
├── components/        # UI components
├── hooks/             # Custom React hooks
├── pages/             # Application pages
├── services/          # MeTTa service implementation
├── styles/            # Global styles
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Future Enhancements

- External AtomSpace database integration
- Enhanced MeTTa reasoning capabilities
- Mobile application
- Team collaboration features
- Integration with external calendar and project management tools

## Contributors

- **Dhadi Sai Praneeth Reddy** - [GitHub](https://github.com/dspraneeth07)
- **Kasireddy Manideep Reddy** - [GitHub](https://github.com/dspraneeth07)

## License

This project is developed by Team QwikZen for the SingularityNET hackathon.

© 2023 QwikZen Group India. All rights reserved.
