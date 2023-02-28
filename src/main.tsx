import './polyfill'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/base/App'
import '@/styles/index.scss'

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
