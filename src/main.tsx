import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Root from './Root'
import './index.css'

const container = document.getElementById('root')!;

const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </React.StrictMode>
);

// Every public page ships with its markup already in the HTML, so React adopts
// it rather than rebuilding it. `npm run dev` serves the unprerendered
// index.html, which arrives with an empty root and mounts the usual way.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}
