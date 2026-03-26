// --- PROJECT ENTRY POINT ---
// This is the absolute start of your application. When the browser loads the page, this file runs first.

// Imports the core React DOM mounting engine
import { createRoot } from "react-dom/client"; 

// Imports the main App component which holds all your screens and routes
import App from "./App.tsx"; 

// Imports the global styling (CSS) rules that define the look and feel of the site
import "./index.css"; 

/**
 * 1. document.getElementById("root") finds the empty <div> in your index.html.
 * 2. createRoot initializes the React environment inside that div.
 * 3. .render(<App />) physically draws your entire application on the screen.
 */
createRoot(document.getElementById("root")!).render(<App />); 
