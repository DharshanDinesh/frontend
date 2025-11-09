import { useContext } from "react";
import {
  DollarOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  RadarChartOutlined,
  SmileOutlined,
  DashboardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu, Layout } from "antd";
import { ContextStore } from "../../Provider";
import "./Sider.css";
import { useNavigate } from "react-router-dom";
import { action } from "../../useProvider";
const { Sider: Siders } = Layout;

export function SideBar({ collapsed, setCollapsed, isMobile }) {
  const { store } = useContext(ContextStore);
  const { ui } = store;
  const navigate = useNavigate();

  const onClick = (e) => {
    navigate(`/${e.key}`);
    if (isMobile) setCollapsed(true);
  };

  return (
    <Siders
      collapsed={collapsed}
      collapsible
      trigger={null}
      breakpoint="md"
      width={200}
      collapsedWidth={isMobile ? 0 : 80}
      className={`custom-sider${isMobile && !collapsed ? ' custom-sider-mobile-open' : ''}`}
      style={{ position: isMobile ? 'fixed' : 'relative', zIndex: 1002, height: '100vh', left: 0, top: 0 }}
    >
      <div className="demo-logo-vertical">
        {collapsed ? "LPHS" : "Le Pondy Home Stay"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[ui.currentPage]}
        onClick={onClick}
        items={[
          {
            key: "home",
            icon: <HomeOutlined />,
            label: "Home",
          },
          {
            key: "income",
            icon: <DollarOutlined />,
            label: "Income",
          },
          {
            key: "expense",
            icon: <ShoppingCartOutlined />,
            label: "Expense",
          },
          {
            key: "dashboard",
            icon: <RadarChartOutlined />,
            label: "Dashboard",
          },
          {
            key: "customer",
            icon: <SmileOutlined />,
            label: "Customer Details",
          },
        ]}
      />
    </Siders>
  );
}
