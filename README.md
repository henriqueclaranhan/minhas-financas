# Minhas Finanças (Personal Finance Manager)

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Firebase](https://img.shields.io/badge/Firebase-12-orange)

A modern, high-performance web application for personal finance management. Built with React, TypeScript, and Vite, it follows best practices in software architecture to deliver a scalable, maintainable, and responsive user experience.

## 🌟 Features
- **Dashboard & Analytics:** Visual insights into income, expenses, and forecasts.
- **Transaction Management:** Add, edit, and organize financial transactions seamlessly.
- **Planned Expenses:** Keep track of upcoming bills and fixed costs.
- **Internationalization (i18n):** Multi-language support built-in.

## 🛠️ Technology Stack
- **Core Framework:** React 19, TypeScript, Vite 8
- **Routing:** React Router v7
- **Styling & UI:** Vanilla CSS + Lucide React (Icons)
- **Data Visualization:** Recharts
- **Date Manipulation:** date-fns
- **Backend / Database / Auth:** Firebase
- **Testing:** Vitest & React Testing Library
- **Linting:** Oxlint

## 🏗️ Architecture
The application is built using the **MVVM (Model-View-ViewModel)** architectural pattern to ensure separation of concerns:
- **View:** React functional components focused entirely on the UI.
- **ViewModel:** Custom hooks managing state, presentation logic, and interactions.
- **Model:** Data entities and service integrations (e.g., Firebase).

For a detailed breakdown of the architecture, refer to the [System Architecture](./docs/architecture.md).

## 📜 Documentation
All technical documentation, including our structured Software Design Descriptions (SDD) aligned with the Kiro methodology, can be found in the `docs/` directory. 
- [System Architecture](./docs/architecture.md)
- [Project Structure](./docs/project-structure.md)
- [Database Schema](./docs/database-schema.md)
- [Testing Strategy](./docs/testing-strategy.md)
- [Kiro Workflow & Templates](./docs/sdd/kiro-workflow.md)
- Feature specifications can be found inside `docs/sdd/features/`.

## 🤝 Contributing
Guidelines for AI agents and developers can be found in `AGENTS.md`.

