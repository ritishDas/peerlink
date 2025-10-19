import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tailwind.css';
import Footer from './footer';
import Body from './body';
import { BrowserRouter } from 'react-router-dom';
import ErrorDialog from './components/error';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <StrictMode>
  <ErrorDialog/>

    <Body/>
    <Footer/>
  </StrictMode>,
  </BrowserRouter>
)
