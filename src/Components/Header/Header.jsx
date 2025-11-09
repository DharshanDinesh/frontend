/* eslint-disable react/prop-types */
import {
  Layout,
  Menu,
  Space,
  Avatar,
  Dropdown,
  Badge,
  theme,
  Button,
} from "antd";
import {
  HomeOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RadarChartOutlined,
  SmileOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ContextStore } from "../../Provider";
import { useContext,useState,useEffect } from "react";
import { action } from "../../useProvider";
import { toast } from "react-toastify";

export function Header() {
  const { Header: AntHeader } = Layout;
  const { store, dispatch } = useContext(ContextStore);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const Msg = ({ title, text }) => (
    <div className="msg-container">
      <p className="msg-title">{title}</p>
      <p className="msg-description">{text}</p>
    </div>
  );

  const handleLogout = () => {
    dispatch({ type: action.SET_LOGGED_OUT });
    toast.success(<Msg title="Logging out" text="Logout Successful" />, {
      position: "top-right",
      autoClose: 2000,
      theme: "colored",
    });
  };

  const userMenuItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: "Home" },
    { key: "income", icon: <DollarOutlined />, label: "Income" },
    { key: "expense", icon: <ShoppingCartOutlined />, label: "Expense" },
    { key: "dashboard", icon: <RadarChartOutlined />, label: "Dashboard" },
    { key: "customer", icon: <SmileOutlined />, label: "Customer Details" },
  ];

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  // Track viewport size reactively instead of one-time checks
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const mobile = width <= 600;
  const tablet = width > 600 && width <= 900;

  const menuItemsResponsive = menuItems.map((item) =>
    mobile ? { ...item, icon: null } : item
  );

  // Desktop / Tablet layout: single-row header with brand | menu | user
  // Mobile layout: two rows - top: brand + user icons, bottom: full-width scrollable menu
  return (
    <AntHeader
      style={{
        padding: 0,
        background: colorBgContainer,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        width: "100%",
      }}
    >
      {mobile ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#2c3e50",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg, #cda434, #f0c75e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/home")}
              >
                Le Pondy
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge count={5} size="small">
                <Button type="text" icon={<BellOutlined />} />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <Avatar icon={<UserOutlined />} size={28} />
              </Dropdown>
            </div>
          </div>

          <div style={{ padding: "6px 8px", borderTop: "1px solid rgba(0,0,0,0.03)" }}>
            <div style={{  WebkitOverflowScrolling: "touch" }}>
              <Menu
                mode="horizontal"
                items={menuItemsResponsive}
                onClick={handleMenuClick}
                style={{ borderBottom: "none", fontSize: 14, whiteSpace: "nowrap" }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "6px 16px" }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: tablet ? 18 : 22,
                color: "#2c3e50",
                letterSpacing: "1px",
                textTransform: "uppercase",
                background: "linear-gradient(90deg, #cda434, #f0c75e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                cursor: "pointer",
                marginRight: 24,
              }}
              onClick={() => navigate("/home")}
            >
              Le Pondy Home Stay
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Menu
              mode="horizontal"
              items={menuItemsResponsive}
              onClick={handleMenuClick}
              style={{ borderBottom: "none", justifyContent: "center" }}
            />
          </div>

          <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 12 }}>
            <Badge count={5} size="small">
              <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18 }} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} size={32} />
                <span style={{ color: "#262626", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 15, fontWeight: 500 }}>
                  {store?.userName || "User"}
                </span>
              </Space>
            </Dropdown>
          </div>
        </div>
      )}
    </AntHeader>
  );
}
