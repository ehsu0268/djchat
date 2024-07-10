import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import * as React from "react";
import createMuiTheme from "../theme/theme";
import { ColorModeContext } from "../context/DarkModeContext";
import Cookies from "js-cookie";

interface ToggleColorModeProps {
  children: React.ReactNode;
}

const ToggleColorMode: React.FC<ToggleColorModeProps> = ({ children }) => {
  const storedMode = Cookies.get("colorMode") as "light" | "dark";
  const preferredDarkMode = useMediaQuery("([prefers-color-scheme: dark])");
  const defaultMode = storedMode || (preferredDarkMode ? "dark" : "light");

  const [mode, setMode] = useState<"light" | "dark">(
    () =>
      (Cookies.get("colorMode") as "light" | "dark") ||
      (useMediaQuery("([prefers-color-schem: dark])") ? "dark" : "light")
  );

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    Cookies.set("colorMode", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode,
    }),
    [toggleColorMode]
  );

  const theme = React.useMemo(() => createMuiTheme(mode || "light"), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ToggleColorMode;
