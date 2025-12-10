import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function SidebarComponent() {
  const location = useLocation();
  
  const menuItems = [
    { 
      display: "Hóa Đơn Điện Tử", 
      link: "/invoice-management",
      icon: <ReceiptIcon />
    },
    { 
      display: "Lấy dữ liệu", 
      link: "/detail",
      icon: <DataThresholdingIcon />
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.display} disablePadding>
              <ListItemButton
                component={Link}
                to={item.link}
                selected={location.pathname === item.link}
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "success.light",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.link ? "white" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.display}
                  slotProps={{
                    primary: {
                      fontWeight: location.pathname === item.link ? "bold" : "normal",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
