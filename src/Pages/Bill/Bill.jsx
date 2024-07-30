/* eslint-disable react/prop-types */
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  notification,
  Radio,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import "./Bill.css";
import dayjs from "dayjs";
import { incomeFields } from "../../Utils/constant";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  calculateTotal,
  calculateTotalForGST,
  helperApi,
  updateObjectInArray,
} from "../../Utils/API/helperAPI";
import { Loader } from "../../Components/Loader/Loader";

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
  const isGstSelected = calculationDetails.find(
    (item) => item.name === "GST Transction"
  )?.value;
  const isCashReceived = accountDetails.find(
    (item) => item.name === "Does Amount Received as Cash"
  )?.value;

  useEffect(() => {
    form.validateFields();
  }, [form, isGstSelected, isCashReceived]);

  const findOptions = (key) => {
    if (key === "stay_name" && hotelInfo.isSuccess) {
      return hotelInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "booking_from" && sourceInfo.isSuccess) {
      return sourceInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "currency_received" && currencyInfo.isSuccess) {
      return currencyInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "amount_credited_to" && currencyInfo.isSuccess) {
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
    if (id === "bookingDetails") {
      setBookingDetials((prev) => {
        return prev.map((d) => ({
          ...d,
          value: d.name === name ? e : d.value,
        }));
      });
    } else if (id === "amountDetails") {
      setAmountDetails((prev) => {
        const updatedInputs = prev.map((d) => ({
          ...d,
          value: d.name === name ? e : d.value,
        }));
        return updatedInputs;
      });
    } else if (id === "accountDetails") {
      setAccountDetails((prev) => {
        return prev.map((d) => ({
          ...d,
          value: d.name === name ? e : d.value,
        }));
      });
      if (e === true && name === "Does Amount Received as Cash") {
        setAccountDetails((prev) => {
          return prev.map((d) => ({
            ...d,
            disabled: d.name != "Does Amount Received as Cash" ? true : false,
            value:
              d.type === "dropDown"
                ? null
                : d.type === "number"
                ? 0
                : d.type === "radio"
                ? e
                : "",
            isRequired: false,
          }));
        });
      } else {
        setAccountDetails((prev) => {
          return prev.map((d) => ({
            ...d,
            disabled: false,
            isRequired: true,
          }));
        });
      }
    } else {
      setCalculationDetails((prev) => {
        return prev.map((d) => ({
          ...d,
          value: d.name === name ? e : d.value,
        }));
      });
      if (e === false && name === "GST Transction") {
        setCalculationDetails((prev) => {
          return prev.map((d) => ({
            ...d,
            disabled: d.name != "GST Transction" ? true : false,
            value:
              d.type === "number" && !d.isDisabledPermanently
                ? 0
                : d.type === "radio"
                ? e
                : 0,
            isRequired: false,
          }));
        });
      } else {
        setCalculationDetails((prev) => {
          return prev.map((d) => ({
            ...d,
            disabled: false,
            isRequired: true,
          }));
        });
      }
    }
  };
  const handleCalculate = async () => {
    const totalAmount = calculateTotal([...amountDetails]);
    const total_amountForGST = calculateTotalForGST([...calculationDetails]);
    console.log(totalAmount, total_amountForGST);
    const isGstSelected = calculationDetails.find(
      (item) => item.name === "GST Transction"
    ).value;

    const final_amount = isGstSelected
      ? totalAmount - total_amountForGST
      : totalAmount;

    setAmountDetails(() => {
      return updateObjectInArray(
        amountDetails,
        "apiKey",
        "total_amount",
        "value",
        totalAmount
      );
    });

    setCalculationDetails(() => {
      let item = updateObjectInArray(
        calculationDetails,
        "apiKey",
        "final_amount",
        "value",
        final_amount
      );

      return item;
    });

    try {
      await form.validateFields();
      enableSubmit(true);
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
      final_amount: calculationDetails.find(
        (item) => item.apiKey === "final_amount"
      ).value,
      total_amount: amountDetails.find((item) => item.apiKey === "total_amount")
        .value,
      isIncome: true,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bill`,
        apiBody
      );
      if (!response.status === 201) {
        throw new Error("Network response was not ok");
      }
      // response.status === 201 && handleClearForm();
    } catch (error) {
      console.log(error);
    }
  };

  if (
    currencyInfo.isFetching ||
    sourceInfo.isFetching ||
    currencyInfo.isFetching
  ) {
    return <Loader />;
  }
  console.log(amountDetails, calculationDetails);
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
