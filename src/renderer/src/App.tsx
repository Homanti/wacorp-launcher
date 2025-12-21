import { routes } from "./routes.tsx";
import { useLocation } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import ElectronListeners from "./ElectronListeners";

function App() {
  const location = useLocation();
  const element = useRoutes(routes, location);

  return (
    <>
        {element}
        <ElectronListeners />
    </>
  );
}

export default App;