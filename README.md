# SBRM Project

This project is an **Employee Resource Management (ERM)** application designed to maintain and manage all information related to employees within an organization. It allows for tracking employee details, managing roles, handling payroll, recording attendance, and supporting other employee-related functionalities. The goal of this application is to streamline employee data management, enhance operational efficiency, and provide insights through accessible data.

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Folder Structure](#folder-structure)
- [Configuration](#configuration)
- [License](#license)

## Project Overview

The **SBRM Employee Resource Management** project serves as a centralized system for handling various employee management functions. The key features include:

- **Employee Information Management**: Store and update detailed employee records.
- **Payroll and Benefits**: Manage payroll, insurance, retirement, and other benefits.
- **Role and Permissions**: Assign roles and manage access levels across the organization.
- **Attendance and Leave Tracking**: Track employee attendance, leave, and other time-related data.
- **Reporting and Analytics**: Provide insights through reporting on employee data and relevant metrics.

## Getting Started

This guide will help you set up the project on your local machine for development and production purposes.

### Prerequisites

- **Node.js** (version 14 or higher) and **npm** are required. You can download them from [Node.js official site](https://nodejs.org/).

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate into the project directory:

   ```bash
   cd SBRM
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Running the Application

To start the development server, use:

```bash
npm run dev
```

This command launches the application on a local development server, accessible by default at `http://localhost:3000`. With Vite's Hot Module Reloading, changes to source files will immediately reflect in the browser.

## Building for Production

To create an optimized build for production, run:

```bash
npm run build
```

This will create a `dist` directory with compiled and minified files ready for deployment.

### Previewing the Production Build

You can preview the production build locally using:

```bash
npm run preview
```

This will start a local server to serve the contents of the `dist` directory.

## Folder Structure

Here's an overview of the main folders and files:

- **src**: Contains the main application code, including components, assets, and styles.
- **public**: Holds static assets like images and icons.
- **dist**: Generated after building for production; contains optimized files ready for deployment.

## Configuration

- **Vite Configuration**: `vite.config.js` – customize Vite options, plugins, and build settings.
- **Tailwind CSS Configuration**: `tailwind.config.js` (if using Tailwind) – configure Tailwind CSS.
- **Environment Variables**: Create a `.env` file at the root of the project to store any environment variables. These variables can be accessed in the app through `import.meta.env`.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
