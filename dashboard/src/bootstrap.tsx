import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

/**
 * Standalone dev harness. `npm start` in this folder renders the exact same
 * <App /> that gets federated into a host, without needing the container to
 * be running.
 *
 * This only works because App.tsx (the exposed module) has no hard,
 * module-scope dependency on anything federated from the container - the
 * original portal-relationship's App.tsx did
 * `import { useStoreTheme } from 'container/store'` at the top level, which
 * means the module fails to even load standalone unless a container is
 * reachable at URL_HOST_PORTAL_CONTAINER. Keep it that way: pass host state
 * in as props (see RemoteAppProps in src/App.tsx), don't reach up for it.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
