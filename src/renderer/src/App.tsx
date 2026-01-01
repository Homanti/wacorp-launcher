import {routes} from "./routes.tsx";
import {useLocation, useRoutes} from "react-router-dom";
import ElectronListeners from "./ElectronListeners";
import {UpdateModal} from "./components/UpdateModal/UpdateModal";
import Snow from "./components/Snow";
import isNewYearPeriod from "./utils/IsNewYearPeriod";
import NewYearCursor from "./components/NewYearCursor";

function App() {
  const location = useLocation();
  const element = useRoutes(routes, location);

  return (
    <>
        {element}
        <ElectronListeners />
        <UpdateModal />

        {isNewYearPeriod() && (
            <>
                <Snow />
                <NewYearCursor/>
            </>
        )}
    </>
  );
}

export default App;