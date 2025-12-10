import {
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";

export default function AppBarComponent() {
  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            mr: 0,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          Tiện Ích Quản Lý Thuế
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
