import { useContext } from "react";
import {
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { Menu, Layout } from "antd";
import { ContextStore } from "../../Provider";
import "./Sider.css";
import { useNavigate } from "react-router-dom";
const { Sider: Siders } = Layout;

export function SideBar() {
  const { store, dispatch } = useContext(ContextStore);
  const { ui } = store;
  const navigate = useNavigate();

  const onClick = (e) => {
    dispatch({ type: "SET_CURRENT_PAGE", payload: e.key });
    navigate(`/${e.key}`);
  };

  return (
    <Siders trigger={null} collapsible collapsed={ui.isSideNaveClosed}>
      <div className="demo-logo-vertical">
        {ui.isSideNaveClosed ? "BS" : "Benny Stay"}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[ui.currentPage]}
        onClick={onClick}
        items={[
          {
            key: "",
            icon: <UserOutlined />,
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
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
        ]}
      />
    </Siders>
  );
}
