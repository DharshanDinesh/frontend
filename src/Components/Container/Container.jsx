import { Outlet } from "react-router";
import "./Container.css";
import { Layout, ConfigProvider } from "antd";

import { Header } from "../Header/Header";

const { Content } = Layout;

export const Container = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            bodyBg: '#f5f5f5',
            headerBg: '#fff',
          }
        }
      }}
    >
      <Layout className="app-container">
        <Layout className="main-layout main-layout-mobile">
          <Header />
          <Content className="main-content">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
