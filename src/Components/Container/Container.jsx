import { Outlet } from "react-router";
import "./Container.css";
import { Layout } from "antd";
import { SideBar } from "../Sider/Sider";
import { Header } from "../Header/Header";

const { Content } = Layout;
export const Container = () => {
  return (
    <Layout>
      <SideBar />
      <Layout>
        <Header />
        <Content>
          <div style={{ minHeight: window.innerHeight }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
