import { Backdrop, CircularProgress } from "@mui/material";

export function LoadingOverlay({ isLoading }) {
  return (
    <Backdrop
      open={isLoading}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1000,
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
