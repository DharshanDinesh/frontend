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
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
