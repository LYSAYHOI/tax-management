import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import { Link, useLocation } from "react-router-dom";

export default function AppBarComponent() {
  const location = useLocation();
  const pages = [
    { display: "Hóa Đơn Điện Tử", link: "/invoice-management" },
    { display: "Lấy dữ liệu", link: "/detail" },
  ];
  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            TAX
          </Typography>

          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            LOGO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                component={Link}
                variant="contained"
                color={location.pathname === page.link ? "primary" : "success"}
                key={page.display}
                to={page.link}
                sx={{ 
                  mx: 1, 
                  color: "white", 
                  display: "block",
                  ...(location.pathname === page.link && {
                    backgroundColor: "primary.dark",
                    fontWeight: "bold",
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
                  })
                }}
              >
                {page.display}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
