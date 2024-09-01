/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useContext, useEffect, useState } from "react";
import { ContextStore } from "../../Provider";
import "./login.css";

export const LoginForm = () => {
  const { dispatch } = useContext(ContextStore);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sessionStorage.clear();
  });

  const Msg = ({ title, text }) => {
    return (
      <div className="msg-container">
        <p className="msg-title">{title}</p>
        <p className="msg-description">{text}</p>
      </div>
    );
  };

  const toastSuccess = () => {
    toast.success(<Msg title="Login Successful" />, {
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

  const toastError = (val) => {
    toast.error(<Msg title={val} text="Something went wrong" />, {
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

  const onLogin = async () => {
    const values = form.getFieldsValue();
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login/check`,
        values
      );
      setLoading(false);

      if (response.status === 200) {
        dispatch({ type: "SET_LOGGED_IN" });
        navigate("/home");
        toastSuccess();
      }

      if (!response.status === 200) {
        throw new Error("User not found");
      }
    } catch (error) {
      console.log(error);
      toastError();
    }
  };

  const onRegister = async () => {
    const values = form.getFieldsValue();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        values
      );
      response.status === 201 && toastSuccess();
      setLoading(false);

      if (!response.status === 201) {
        throw new Error("Network response was not ok");
      }
      // response.status === 201 && handleClearForm();
    } catch (error) {
      console.log(error);
      toastError("register");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <Form
          name="login-form"
          form={form}
          initialValues={{ name: "Dharshan", password: "Dharshan" }}
        >
          <p className="form-title">Welcome back</p>
          <p>Login to the Expense Monitor</p>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className="login-form-button"
              loading={loading}
              onClick={onLogin}
            >
              LOGIN
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
