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
import "./Bill.css";
import dayjs from "dayjs";
import { incomeFields } from "../../Utils/constant";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { helperApi } from "../../Utils/API/helperAPI";
import { Loader } from "../../Components/Loader/Loader";
import { toast } from "react-toastify";

export function Bill() {
  const [form] = Form.useForm();

  const [bookingDetails, setBookingDetials] = useState(
    incomeFields.bookingDetails
  );
  const [amountDetails, setAmountDetails] = useState(
    incomeFields.amountDetails
  );
  const [accountDetails, setAccountDetails] = useState(
    incomeFields.accountDetails
  );
  const [calculationDetails, setCalculationDetails] = useState(
    incomeFields.calculationDetails
  );

  const [isSubmitEnabled, enableSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dummy, setDummy] = useState(false);

  const currencyInfo = useQuery({
    queryKey: ["currency"],
    queryFn: () => helperApi("currency"),
    initialData: [],
  });
  const sourceInfo = useQuery({
    queryKey: ["source"],
    queryFn: () => helperApi("source"),
    initialData: [],
  });
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
    if (key === "stay_name" && hotelInfo.isSuccess) {
      return hotelInfo.data.map((item, index) => ({
        label: item.name,
        value: item.name,
        key: item._id,
      }));
    } else if (key === "booking_from" && sourceInfo.isSuccess) {
      return sourceInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
        key: item._id,
      }));
    } else if (key === "currency_received" && currencyInfo.isSuccess) {
      return currencyInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
        key: item._id,
      }));
    } else if (key === "amount_credited_to" && accountInfo.isSuccess) {
      return accountInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
        key: item._id,
      }));
    } else if (key === "room_no" && hotelInfo.isSuccess) {
      const hotelName = form.getFieldValue("stay_name");
      const hotelRomms =
        hotelInfo.data.find((d) => d.name === hotelName)?.rooms ?? [];

      return hotelRomms.map((item) => ({
        label: item.name,
        value: item.name,
        key: item._id,
      }));
    }
  };
  const Msg = ({ title, text }) => {
    return (
      <div className="msg-container">
        <p className="msg-title">{title}</p>
        <p className="msg-description">{text}</p>
      </div>
    );
  };

  const toastSuccess = () => {
    toast.success(
      <Msg
        title="Submitted Successfully"
        text="Resetting the form in 4 seconds"
      />,
      {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: () => {
          handleClearForm();
        },
      }
    );
  };
  const toastError = () => {
    toast.error(<Msg title="Error occured" text="Something went wrong" />, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };
  const handleClearForm = () => {
    form.resetFields();
    enableSubmit(false);
  };
  const handleChangeInFileds = () => {
    setDummy((prev) => !prev);
  };
  const handleCalculate = async () => {
    const formValues = await form.getFieldValue();
    console.log(formValues, "adsf");
    const totalAmount =
      formValues.adavance_amount +
      formValues.balance_amount +
      formValues.extra_amount;

    const total_amountForGST =
      formValues.gst_amount + formValues.tcs_amount + formValues.tds_amount;

    const isGstSelected = formValues.gst_transction;

    const final_amount = isGstSelected
      ? totalAmount - total_amountForGST
      : totalAmount;

    const final_amount_after_broker =
      formValues.broker_commission > 0
        ? final_amount - formValues.broker_commission
        : final_amount;

    try {
      await form.validateFields();
      enableSubmit(true);
      form.setFieldsValue({ total_amount: totalAmount });
      form.setFieldsValue({ final_amount: final_amount_after_broker });
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    let apiBody = {
      ...values,
      date_of_booking: [
        dayjs(values?.date_of_booking?.[0]).format("DD-MM-YYYY"),
        dayjs(values?.date_of_booking?.[1]).format("DD-MM-YYYY"),
      ],
      date_of_entry: dayjs(values?.date_of_entry).format("DD-MM-YYYY"),
      isIncome: true,
    };
    console.log(apiBody);
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bill`,
        apiBody
      );
      setLoading(false);
      response.status === 201 && toastSuccess();
      if (!response.status === 201) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.log(error);
      toastError();
      setLoading(false);
    }
  };

  if (
    currencyInfo.isFetching ||
    sourceInfo.isFetching ||
    currencyInfo.isFetching
  ) {
    return <Loader />;
  }
  return (
    <div className="bill_container">
      <div className="bill_container_title">Create Entry</div>
      <Form form={form} name="dynamic_rule">
        <FiledContainer
          title={"Booking Details"}
          fields={bookingDetails}
          handleChangeInFileds={handleChangeInFileds}
          findOptions={findOptions}
          id={"bookingDetails"}
        />
        <FiledContainer
          title={"Income Details"}
          fields={amountDetails}
          handleChangeInFileds={handleChangeInFileds}
          findOptions={findOptions}
          id={"amountDetails"}
        />
        <FiledContainer
          title={"Account Details"}
          fields={accountDetails}
          handleChangeInFileds={handleChangeInFileds}
          findOptions={findOptions}
          id={"accountDetails"}
        />
        <FiledContainer
          title={"Calculation Details"}
          fields={calculationDetails}
          handleChangeInFileds={handleChangeInFileds}
          findOptions={findOptions}
          id={"calculationDetails"}
        />
        <Row justify="end" align="bottom" gutter={[16, 16]}>
          <Col>
            <Button type="primary" onClick={handleCalculate}>
              Calculate
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={handleClearForm}>
              Clear
            </Button>
          </Col>
          {isSubmitEnabled && (
            <Col>
              <Button type="primary" loading={loading} onClick={handleSubmit}>
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
      <Row justify="start" align={"middle"} gutter={[16, 0]}>
        {fields.map((field) => {
          return (
            <Col xs={24} sm={12} md={8} lg={6} span={6} a key={field.name}>
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
              handleChangeInFileds(e, field.apiKey, id);
            }}
            // value={field.value}
            style={style}
            placeholder={field.placeholder}
            disabled={field.isDisabledPermanently ?? Boolean(field.disabled)}
          />
        );
      }
      case "multidropDown": {
        return (
          <Select
            mode="multiple"
            options={findOptions(field.apiKey) ?? field.options}
            onSelect={(e) => {
              handleChangeInFileds(e, field.apiKey, id);
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
              handleChangeInFileds(e.target.value, field.apiKey, id);
            }}
            // value={field.value}
            name={field.name}
            style={style}
            disabled={field.isDisabledPermanently ?? Boolean(field.disabled)}
            // status={field.validation}
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
              handleChangeInFileds(e, field.apiKey, id);
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
            style={style}
            onChange={(dates) => handleChangeInFileds(dates, field.apiKey, id)}
            // value={field.value}
            format={"DD/MM/YYYY"}
            placeholder={field.placeholder}
          />
        );
      }
      case "radio": {
        return (
          <Radio.Group
            name={field.name}
            onChange={(e) => {
              handleChangeInFileds(e.target.value, field.apiKey, id);
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
