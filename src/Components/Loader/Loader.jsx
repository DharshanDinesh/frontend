import { Spin } from "antd";
import "./Loader.css";

export const Loader = () => {
  return (
    <div className="loading-screen">
      <Spin size="large" />
    </div>
  );
};
