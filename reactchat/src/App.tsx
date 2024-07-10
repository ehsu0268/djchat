import Home from "./pages/Home";
import Explore from "./pages/Explore";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { createMuiTheme } from "./theme/theme";
import ToggleColorMode from "./components/ToggleColorMode";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Home />} />
      <Route path="/explore/:categoryName" element={<Explore />} />
    </Route>
  )
);
const App: React.FC = () => {
  //const theme = createMuiTheme();
  return (
    <ToggleColorMode>
      <RouterProvider router={router} />
    </ToggleColorMode>
  );
};

export default App;
