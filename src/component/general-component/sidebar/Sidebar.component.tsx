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
import MergeIcon from "@mui/icons-material/Merge";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function SidebarComponent() {
  const location = useLocation();
  
  const menuItems = [
    { 
      display: "Hóa Đơn Điện Tử", 
      link: "/invoice-management",
      icon: <ReceiptIcon />,
      isAvailableFeature: true
    },
    { 
      display: "Lấy dữ liệu", 
      link: "/detail",
      icon: <DataThresholdingIcon />,
      isAvailableFeature: true
    },
    { 
      display: "Gộp File Excel", 
      link: "/invoices-excel-merge",
      icon: <MergeIcon />,
      isAvailableFeature: true
    },
    { 
      display: "Danh Sách Hóa Đơn", 
      link: "/invoices-list",
      icon: <ListAltIcon />,
      isAvailableFeature: false
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
          {menuItems.filter((item) => item.isAvailableFeature).map((item) => (
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
