import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import axios from 'axios';

// Ensure we use local proxy or relative path
axios.defaults.baseURL = window.location.hostname === 'localhost' ? '' : '';
// Actually, default is '' (current host), which is correct for Vite proxy.
// But let's log it to be sure.
console.log("App Starting. Axios BaseURL:", axios.defaults.baseURL);
console.log("Current Host:", window.location.host);

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
