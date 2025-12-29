import { routes } from "./routes.tsx";
import { useLocation } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import ElectronListeners from "./ElectronListeners";
import {UpdateModal} from "./components/UpdateModal/UpdateModal";

function App() {
  const location = useLocation();
  const element = useRoutes(routes, location);

  return (
    <>
        {element}
        <ElectronListeners />
        <UpdateModal />
    </>
  );
}

export default App;