# LAWSA Landing Page

## Overview

This landing page serves as the entry point for the LAWSA No-Code Agentic Automation Platform. It provides information about the platform's features, pricing, and how it works, and connects to the main application frontend.

## Features

- Responsive design that works on desktop and mobile devices
- Automatic detection of frontend application status
- Button to start the frontend application directly from the landing page
- Direct links to the frontend application

## How to Use

### Starting the Landing Page Server

1. Navigate to the project directory:
   ```
   cd d:\n8n(minimal)
   ```

2. Start the combined server:
   ```
   python start_frontend_server.py
   ```

3. Open the landing page in your browser:
   ```
   http://localhost:8080/landing-page.html
   ```

### Starting the Frontend Application

You can start the frontend application in two ways:

1. **From the landing page**: If the frontend is not running, you'll see a notification at the top of the landing page. Click the "Start Frontend" button to start the frontend application.

2. **Manually**: Navigate to the frontend directory and run the development server:
   ```
   cd d:\n8n(minimal)\n8n-frontend
   npm run dev -- --port 5174
   ```

## Connecting to the Frontend

Once the frontend is running, you can access it directly from the landing page by clicking any of the following buttons:

- "Get started" in the header
- "Start building for free" in the hero section
- "Book a demo" in the hero section

These buttons will take you to the appropriate pages in the frontend application.

## Troubleshooting

- If the "Start Frontend" button doesn't work, try starting the frontend manually as described above.
- If you see 404 errors for "/@vite/client", these can be safely ignored as they are related to the Vite development server and don't affect the landing page functionality.
- If the frontend status detection doesn't work correctly, try refreshing the page after starting the frontend application.

## Customization

You can customize the landing page by editing the following files:

- `landing-page.html`: HTML structure and content
- `landing-page.css`: Styles and layout
- `landing-page-assets/`: Images and other assets