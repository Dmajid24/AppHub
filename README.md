# Application Catalog

A modern React application for managing and browsing application catalogs, built with Vite for fast development and optimized production builds. This project provides a comprehensive catalog interface with a focus on performance and developer experience.

## Features

- ⚡ **Fast Development** - Powered by Vite with Hot Module Replacement (HMR)
- 🚀 **React 19** - Latest React version with modern hooks and features
- 🛣️ **Client-side Routing** - React Router for seamless navigation
- 🧪 **Testing & Coverage** - Vitest integrated with code coverage reporting
- 📝 **Code Quality** - ESLint configuration for maintaining code standards
- 🎨 **Responsive Design** - CSS modules and styling for all screen sizes

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19.2 | UI framework |
| Vite 8.1 | Build tool & dev server |
| React Router 7.18 | Client-side routing |
| Vitest 4.1 | Unit testing framework |
| ESLint 10.6 | Code linting |
| JSDOM 29.1 | DOM testing environment |
| .NET10 (ASP.NET Core Web API) | RESTful APIs and business logic |
| PostgreSQL 18 | Relational database management system (RDBMS) for data storage |
| Entity Framework Core | Object-Relational Mapping (ORM) for database access and migrations |
| Npgsql | PostgreSQL provider for .NET / Entity Framework Core |

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd application_catalog
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server with HMR:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (Vite default port).

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components for routing
├── assets/           # Static assets (images, icons)
├── style/            # Global and shared styles
├── App.jsx           # Root application component
├── App.css           # Application styles
├── main.jsx          # Application entry point
└── index.css         # Global CSS
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests with coverage reporting

## Linting & Code Quality

Run ESLint to check code quality:
```bash
npm run lint
```

The project uses ESLint with recommended rules and React-specific linting plugins to maintain code consistency and catch potential issues early.

## Testing

Run tests with code coverage:
```bash
npm run test
```

The project uses Vitest, a Vite-native unit testing framework, with:
- React Testing Library for component testing
- JSDOM for DOM simulation
- Code coverage tracking with V8

## Performance

- **Fast HMR** - Vite's lightning-fast Hot Module Replacement for development
- **Optimized Builds** - Production builds are minified and optimized
- **Lazy Loading** - Support for code splitting with React Router
- **CSS Modules** - Scoped styling to prevent conflicts

## React Plugin Configuration

This project uses [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) which leverages [Oxc](https://oxc.rs) for fast JSX transformation.

Alternative: [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) is available if you prefer [SWC](https://swc.rs/) instead.

## Contributing

When contributing to this project:

1. Follow the existing ESLint rules
2. Write tests for new features
3. Maintain code quality with `npm run lint`
4. Test locally with `npm run dev` before submitting changes

## License

Please check the repository for license information.

## Future Enhancements

- Integrate TypeScript for type safety
- Enable React Compiler for performance optimization
- Add e2e testing with Playwright or Cypress
- Implement error boundary and error tracking
