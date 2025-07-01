import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Error rendering React app:', error);
  document.body.innerHTML = `
    <div style="color: white; padding: 20px; background: #1a1a1a; min-height: 100vh;">
      <h1>Error Loading App</h1>
      <p>There was an error loading the application:</p>
      <pre>${error}</pre>
    </div>
  `;
}
