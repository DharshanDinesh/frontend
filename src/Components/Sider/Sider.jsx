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

export function SideBar() {
  const { store, dispatch } = useContext(ContextStore);
  const { ui } = store;
  const navigate = useNavigate();

  const onClick = (e) => {
    navigate(`/${e.key}`);
  };

  const handleNavBarClick = () => {
    dispatch({
      type: action.SET_UI_NAV_STATUS,
      payload: !ui.isSideNaveClosed,
    });
  };

  return (
    <Siders
      collapsed={ui.isSideNaveClosed}
      collapsible
      onCollapse={(value) => handleNavBarClick(value)}
    >
      <div className="demo-logo-vertical">
        {ui.isSideNaveClosed ? "LPHS" : "Le Pondy Home Stay"}
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
