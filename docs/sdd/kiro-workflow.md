# Kiro SDD Workflow

## Introduction
This project uses **Spec-Driven Development (SDD)** inspired by the **Kiro Framework**. This means we shift away from "vibe coding" (prompting the AI to generate code directly without a plan) toward a structured, engineering-focused workflow where specifications serve as the primary source of truth.

## The 3-Phase Workflow

Every new feature or complex bug fix must pass through these three documents before any code is generated:

### 1. Requirements (`requirements.md` or `bugfix.md`)
- **What it is:** Defines *what* needs to be built or fixed.
- **Contents:** User stories, acceptance criteria, edge cases, and business rules.

### 2. Design (`design.md`)
- **What it is:** The technical architecture of the feature.
- **Contents:** Component structures (MVVM), data flow, sequence diagrams, and how it integrates with the existing system.
- *Note:* The retroactive specs we created in `docs/sdd/specs/` are essentially the `design.md` for our existing pages.

### 3. Tasks (`tasks.md`)
- **What it is:** The execution plan.
- **Contents:** Breaks the design down into small, discrete, and trackable steps (e.g., [ ] 1. Create ViewModel, [ ] 2. Create Component). The AI agent will execute these steps one by one.

## How to use
When starting a new feature:
1. Review the applicable cross-cutting standards in `docs/sdd/standards/`. UI work must follow `docs/sdd/standards/ui-patterns.md`.
2. Copy the templates from `docs/sdd/templates/`.
3. Fill out the `requirements.md` and get agreement.
4. Translate requirements into `design.md`.
5. Break it down in `tasks.md` and start coding step-by-step.
