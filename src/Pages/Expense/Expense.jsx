/* eslint-disable react/prop-types */
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
} from "antd";
import { useState } from "react";
import "./expense.css";
import dayjs from "dayjs";
import { expenseFileds } from "../../Utils/constant";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { helperApi, updateObjectInArray } from "../../Utils/API/helperAPI";
import { Loader } from "../../Components/Loader/Loader";

export function Expense() {
  const [form] = Form.useForm();

  const [expenseDetails, setExpenseDetails] = useState(expenseFileds);

  const [isSubmitEnabled, enableSubmit] = useState(false);

  const hotelInfo = useQuery({
    queryKey: ["hotel"],
    queryFn: () => helperApi("hotel"),
    initialData: [],
  });
  const accountInfo = useQuery({
    queryKey: ["account"],
    queryFn: () => helperApi("account"),
    initialData: [],
  });

  const findOptions = (key) => {
    if (key === "expense_for" && hotelInfo.isSuccess) {
      const val = hotelInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      return [...val, { label: "All", value: "All" }];
    } else if (key === "amount_debited_from" && accountInfo.isSuccess) {
      return accountInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    }
  };
  const handleClearForm = () => {
    window.location.reload();
  };

  const handleChangeInFileds = (e, name, id) => {
    if (id === "expense") {
      setExpenseDetails((prev) => {
        return prev.map((d) => ({
          ...d,
          value: d.name === name ? e : d.value,
        }));
      });
      if (e === false && name === "GST Transction (Expense)") {
        setExpenseDetails(() => {
          return updateObjectInArray(
            expenseDetails,
            "apiKey",
            "gst_amount_inward",
            "isRequired",
            false
          );
        });
        form.validateFields(["gst_amount_inward"]);
      } else if (e === true && name === "GST Transction (Expense)") {
        setExpenseDetails(() => {
          return updateObjectInArray(
            expenseDetails,
            "apiKey",
            "gst_amount_inward",
            "isRequired",
            true
          );
        });
        form.validateFields(["gst_amount_inward"]);
      }
    }
  };
  const handleCalculate = async () => {
    try {
      await form.validateFields();
      enableSubmit(true);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    let data = {
      ...values,
      expense_date: dayjs(values?.expense_date).format("DD-MM-YYYY"),
      isIncome: false,
      stay_name: values.expense_for,
      total_expense: -values.total_expense,
    };

    console.log(data);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bill`,
        data
      );
      if (!response.status === 201) {
        throw new Error("Network response was not ok");
      }
      // response.status === 201 && handleClearForm();
    } catch (error) {
      console.log(error);
    }
  };

  if (hotelInfo.isFetching || accountInfo.isFetching) {
    return <Loader />;
  }
  // console.log(expenseDetails);
  return (
    <div className="bill_container">
      <div className="bill_container_title">Expense Entry</div>
      <Form form={form} name="dynamic_rule">
        <FiledContainer
          title={"Expense Details"}
          fields={expenseDetails}
          handleChangeInFileds={handleChangeInFileds}
          findOptions={findOptions}
          id={"expense"}
        />

        <Row justify="end" align="bottom" gutter={[16, 16]}>
          <Col>
            <Button type="primary" onClick={handleCalculate}>
              Calculate
            </Button>
          </Col>
          <Col>
            {" "}
            <Button type="primary" onClick={handleClearForm}>
              Clear
            </Button>
          </Col>
          {isSubmitEnabled && (
            <Col>
              <Button type="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
}

const FiledContainer = ({
  title,
  fields,
  handleChangeInFileds,
  findOptions,
  id,
}) => {
  return (
    <div className="bill_container_section">
      <Divider
        orientation="left"
        orientationMargin="0"
        className="bill_container_divider_container"
      >
        <div className="bill_container_divider_title">{title}</div>
      </Divider>
      <Row justify="start" align="middle" gutter={[16, 0]}>
        {fields.map((field) => {
          return (
            <Col xs={24} sm={12} md={8} lg={6} span={6} key={field.name}>
              <div className="bill_form_field_label">{field.name}</div>
              <div>
                <RenderFiled
                  field={field}
                  handleChangeInFileds={handleChangeInFileds}
                  findOptions={findOptions}
                  id={id}
                />
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
const RenderFiled = ({ field, handleChangeInFileds, findOptions, id }) => {
  const style = {
    width: "100%",
  };

  const { RangePicker } = DatePicker;

  const renderFormInputs = () => {
    switch (field.type) {
      case "dropDown": {
        return (
          <Select
            options={findOptions(field.apiKey)}
            onSelect={(e) => {
              handleChangeInFileds(e, field.name, id);
            }}
            // value={field.value}
            style={style}
            placeholder={field.placeholder}
            disabled={field.isDisabledPermanently ?? Boolean(field.disabled)}
          />
        );
      }
      case "text": {
        return (
          <Input
            onChange={(e) => {
              handleChangeInFileds(e.target.value, e.target.name, id);
            }}
            // value={field.value}
            name={field.name}
            style={style}
            disabled={field.isDisabledPermanently ?? Boolean(field.disabled)}
            status={field.validation}
            placeholder={field.placeholder}
          />
        );
      }
      case "number": {
        return (
          <InputNumber
            name={field.name}
            // value={field.value}
            onChange={(e) => {
              handleChangeInFileds(e, field.name, id);
            }}
            style={style}
            disabled={field.isDisabledPermanently ?? Boolean(field.disabled)}
            placeholder={field.placeholder}
          />
        );
      }
      case "datePicker": {
        return (
          <DatePicker
            onChange={(_date, dateString) =>
              handleChangeInFileds(dateString, field.name, id)
            }
            // value={dayjs(field.value, "DD-MM-YYYY")}
            style={style}
            placeholder={field.placeholder}
            format={"DD/MM/YYYY"}
          />
        );
      }
      case "dateRangePicker": {
        return (
          <RangePicker
            onChange={(dates) => handleChangeInFileds(dates, field.name, id)}
            // value={field.value}
            format={"DD/MM/YYYY"}
          />
        );
      }
      case "radio": {
        return (
          <Radio.Group
            name={field.name}
            onChange={(e) => {
              handleChangeInFileds(e.target.value, e.target.name, id);
            }}
            // value={field.value}
          >
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        );
      }
      case "red": {
        return <p className="bill_container_result">{field.value}</p>;
      }
    }
  };
  const rules = [
    ...[
      {
        required: field.isRequired,
        message: `Please enter ${field.name}`,
      },
    ],
    ...(field?.rules?.length > 0 ? field.rules : []),
  ];
  return (
    <Form.Item rules={rules} name={field.apiKey} initialValue={field.value}>
      {renderFormInputs()}
    </Form.Item>
  );
};
