import { routes } from "./routes.tsx";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useRoutes } from "react-router-dom";

function App() {
  const location = useLocation();
  const element = useRoutes(routes, location);

  return (
    <AnimatePresence mode="wait">
      {element && <div className="animated-route" key={location.pathname}>{element}</div>}
    </AnimatePresence>
  );
}

export default App;