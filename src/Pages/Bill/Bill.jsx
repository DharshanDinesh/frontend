/* eslint-disable react/prop-types */
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
} from "antd";
import { useState } from "react";
import "./Bill.css";
import dayjs from "dayjs";
import { fields, filedContainers } from "../../Utils/constant";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { helperApi } from "../../Utils/API/helperAPI";
import { Loader } from "../../Components/Loader/Loader";

export function Bill() {
  const [formFields, setFiledProps] = useState(fields);
  const [isSubmitEnabled, enableSubmit] = useState(false);

  const currencyInfo = useQuery({
    queryKey: ["currency"],
    queryFn: () => helperApi("currency"),
  });
  const sourceInfo = useQuery({
    queryKey: ["source"],
    queryFn: () => helperApi("currency"),
  });
  const hotelInfo = useQuery({
    queryKey: ["hotel"],
    queryFn: () => helperApi("currency"),
  });

  function findOptions(key) {
    if (key === "Income_From_(Stay_Name)" && hotelInfo.isSuccess) {
      return hotelInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "Booking_From" && sourceInfo.isSuccess) {
      return sourceInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (
      key === "Amount_Received_As_(Rs_/_Euro)" &&
      currencyInfo.isSuccess
    ) {
      return currencyInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    }
  }

  function clearForm() {
    setFiledProps(fields);
    enableSubmit(false);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiBody = formFields
      .map((item) => ({
        ...item,
        value: item.convertToNumber ? Number(item.value) : item.value,
      }))
      .reduce((prev, curr) => {
        return { ...prev, [curr.apikey]: curr.value };
      }, {});
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bill`,
        apiBody
      );
      if (!response.status === 201) {
        throw new Error("Network response was not ok");
      }
      response.status === 201 && clearForm();
    } catch (error) {
      const errorObj = error.response.data.err.errors;
      const d = formFields.map((d) => ({
        ...d,
        validation: errorObj[d.apikey] ? "error" : "",
        errorMessage: errorObj[d.apikey] ? errorObj[d.apikey]?.message : "",
      }));
      console.log(d, errorObj);
      setFiledProps(d);
    }
    enableSubmit(false);
  };
  const totalIncome = formFields
    .filter(
      (item) => item.container === "income" && item.convertToNumber === true
    )
    .reduce(function (acc, obj) {
      return acc + obj.value;
    }, 0);

  const totalExpenses = formFields
    .filter((item) => item.name === "Expenses" && item.convertToNumber === true)
    .reduce(function (acc, obj) {
      return acc + obj.value;
    }, 0);

  const handleChangeInFileds = (e, name) => {
    setFiledProps((prev) => {
      return prev.map((d) => ({ ...d, value: d.name === name ? e : d.value }));
    });
  };

  const handleCalculate = () => {
    const isSharePercentage = formFields.find(
      (itm) => itm.name === "Share Percentage"
    ).value;
    const isGstPercentageFiledEnabled = formFields.find(
      (itm) => itm.name === "Is GST Included"
    ).value;
    const isGstPercentage = formFields.find(
      (itm) => itm.name === "GST Percentage"
    ).value;
    const taxcalculted =
      (totalIncome - totalExpenses) * (isGstPercentage / 100);

    const totalGain =
      !isGstPercentageFiledEnabled || isGstPercentage === 0
        ? totalIncome - totalExpenses
        : totalIncome - totalExpenses - taxcalculted;

    const totalGainAfterShare = totalGain * (isSharePercentage / 100);

    setFiledProps((prev) => {
      return prev.map((d) => ({
        ...d,
        value: d.name === "Final Amount" ? totalGainAfterShare : d.value,
      }));
    });
    enableSubmit(true);
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
      {filedContainers.map((container, index) => (
        <FiledContainer
          key={index}
          title={container.title}
          fields={formFields.filter((itm) => itm?.container === container.key)}
          handleChangeInFileds={handleChangeInFileds}
          findOptions={findOptions}
        >
          {container.key === "calculation" && (
            <div>
              <Row justify="start" align="bottom" gutter={[16, 24]}>
                <Col>
                  <Button type="primary" onClick={handleCalculate}>
                    Calculate
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
            </div>
          )}
        </FiledContainer>
      ))}
    </div>
  );
}

const FiledContainer = ({
  title,
  fields,
  handleChangeInFileds,
  children,
  findOptions,
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
      <Row justify="start" gutter={[16, 24]}>
        {fields.map((field) => {
          return (
            <Col span={6} key={field.name}>
              <div className="bill_form_field_label">{field.name}</div>
              <div>
                {
                  <RenderFiled
                    field={field}
                    handleChangeInFileds={handleChangeInFileds}
                    findOptions={findOptions}
                  />
                }
              </div>
            </Col>
          );
        })}
      </Row>
      <Row justify="start" gutter={[16, 24]}>
        {children}
      </Row>
    </div>
  );
};

const RenderFiled = ({ field, handleChangeInFileds, findOptions }) => {
  const style = {
    width: "100%",
  };
  switch (field.type) {
    case "dropDown": {
      return (
        <>
          <Select
            options={findOptions(field.apikey)}
            onSelect={(e) => {
              handleChangeInFileds(e, field.name);
            }}
            style={style}
            placeholder={`Select ${field.name}`}
          />
          <p>{field.errorMessage}</p>
        </>
      );
    }
    case "text": {
      return (
        <>
          {" "}
          <Input
            placeholder={`Enter ${field.name}`}
            onChange={(e) => {
              if (field.convertToNumber && isNaN(e.target.value)) {
                alert("enter only number");
              } else if (
                field.convertToNumber &&
                !isNaN(e.target.value) &&
                e.target.value.length > 0
              ) {
                handleChangeInFileds(parseFloat(e.target.value), e.target.name);
              } else {
                console.log(e.target.value);
                handleChangeInFileds(e.target.value, e.target.name);
              }
            }}
            value={field.value}
            name={field.name}
            style={style}
            disabled={Boolean(field.disabled)}
            status={field.validation}
          />
          <p>{field.errorMessage}</p>
        </>
      );
    }
    case "number": {
      return (
        <InputNumber
          placeholder={`Enter ${field.name}`}
          name={field.name}
          // onChange={(e) => {
          //   handleChangeInFileds(e.target.value, e.target.name);
          // }}
          style={style}
        />
      );
    }
    case "datePicker": {
      return (
        <DatePicker
          placeholder={`Select ${field.name}`}
          onChange={(_date, dateString) =>
            handleChangeInFileds(dateString, field.name)
          }
          value={dayjs(field.value, "YYYY-MM-DD")}
          style={style}
        />
      );
    }
    case "radio": {
      return (
        <Radio.Group
          name={field.name}
          onChange={(e) => {
            handleChangeInFileds(e.target.value, e.target.name);
          }}
          value={field.value}
        >
          <Radio value={true}>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      );
    }
  }
};
