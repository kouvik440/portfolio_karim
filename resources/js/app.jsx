import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import '../css/portfolio-motion.css';
import PortfolioApp from './PortfolioApp';

const container = document.getElementById('app');

createRoot(container).render(
    <React.StrictMode>
        <PortfolioApp />
    </React.StrictMode>
);
