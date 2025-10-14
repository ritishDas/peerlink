import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css';
import Footer from './footer';
import Body from './body';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Body/>
    <Footer/>
  </StrictMode>,
)
