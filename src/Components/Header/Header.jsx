import { Button, Layout, theme } from "antd";
import { ContextStore } from "../../Provider";
import { useContext } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { action } from "../../useProvider";

export function Header() {
  const { Header } = Layout;
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { store, dispatch } = useContext(ContextStore);
  const { ui } = store;
  const handleNavBarClick = () => {
    dispatch({ type: action.SET_UI_NAV_STATUS, payload: !ui.isSideNaveClosed });
  };
  return (
    <Header>
      <Button
        type="text"
        icon={
          ui.isSideNaveClosed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
        }
        onClick={() => handleNavBarClick()}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
          color: colorBgContainer,
        }}
      />
    </Header>
  );
}
