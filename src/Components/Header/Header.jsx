/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Button, Layout, theme } from "antd";
import { ContextStore } from "../../Provider";
import { useContext } from "react";
import { UserOutlined } from "@ant-design/icons";
import { action } from "../../useProvider";
import { toast } from "react-toastify";

export function Header() {
  const { Header } = Layout;
  const { store, dispatch } = useContext(ContextStore);

  const handleNavBarClick = () => {
    dispatch({ type: action.SET_LOGGED_OUT });
    toastSuccess();
  };
  const Msg = ({ title, text }) => {
    return (
      <div className="msg-container">
        <p className="msg-title">{title}</p>
        <p className="msg-description">{text}</p>
      </div>
    );
  };

  const toastSuccess = (val) => {
    toast.success(<Msg title={val} text="Logout Successful" />, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };
  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <div>
        <Button
          type="text"
          icon={<UserOutlined />}
          onClick={() => handleNavBarClick()}
          style={{
            color: "blanchedalmond",
            borderRadius: "35px",
            background: "rgba(255, 255, 255, .2)",
          }}
          size="middle"
        >
          Logout
        </Button>
      </div>
    </Header>
  );
}
