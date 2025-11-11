import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import DashboardExample from "./dashboard/DashboardExample.jsx";

const darkTheme = createTheme({
  palette: {
    mode: "light",
  },
});
function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <DashboardExample />
    </ThemeProvider>
  );
}

export default App;
