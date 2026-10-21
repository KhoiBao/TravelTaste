import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/vietnamese-400.css';
import '@fontsource/inter/vietnamese-700.css';
import './styles/global.css';
import App from './App';
import { AppProvider } from './state/AppContext';
import { PopupProvider } from './components/common/PopupContext';

const router = createBrowserRouter([{ path: '*', element: <PopupProvider><AppProvider><App /></AppProvider></PopupProvider> }]);
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);
