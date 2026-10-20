import { startLabAnalytics } from './services/labAnalytics.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AssignmentRoot from './components/AssignmentRoot.jsx';
import './styles/app.css';

startLabAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AssignmentRoot appId="www-lab"><App /></AssignmentRoot>
  </StrictMode>,
);
