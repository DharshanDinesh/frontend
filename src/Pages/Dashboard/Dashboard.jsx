import { Button, Col, Row, Select, Table } from "antd";
import { useState } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { fields } from "../../Utils/constant";
import { DatePicker } from "antd";
import { useQuery } from "react-query";
import { helperApi } from "../../Utils/API/helperAPI";

export function Dashboard() {
  const { RangePicker } = DatePicker;

  const [filter1, setFilter1] = useState([]);
  const [filter2, setFilter2] = useState([]);
  const [filter3, setFilter3] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  const sourceInfo = useQuery("source", () => helperApi("source"));
  const hotelInfo = useQuery("hotel", () => helperApi("hotel"));
  const billInfo = useQuery("bill", () => helperApi("bill"), {
    initialData: {},
  });
  const orderColumns = (data, columnOrder) => {
    return data?.map((item) => {
      const orderedItem = {};
      columnOrder.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          orderedItem[key] = item[key];
        }
      });
      return orderedItem;
    });
  };
  const column_Order = [
    "Date_Of_Booking",
    "Tenant_Name",
    "Income_From_(Stay_Name)",
    "Booking_From",
    "Room_No",
    "Adavance_Amount",
    "Balance_Amount",
    "Extra_Amount",
    "Extra_Amount_Detail",
    "Expenses",
    "Expenses_Explanation",
    "Debited_Amount",
    "Amount_Debited_from",
    "Amount_Credited_to",
    "Credited_Amount",
    "Amount_Received_As_(Rs_/_Euro)",
    "Is_GST_Included",
    "GST_Percentage",
    "Share_Percentage",
    "Final_Amount",
  ];
  const billItems = billInfo?.data?.items ?? [];

  function findOptions(key) {
    if (key === "hotel" && hotelInfo.isSuccess) {
      return hotelInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "Booking_From" && sourceInfo.isSuccess) {
      return sourceInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "GST") {
      return ["Yes", "No"].map((item) => ({
        label: item,
        value: item,
      }));
    }
  }

  const columns = fields
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      if (item.apikey === "Is_GST_Included") {
        return {
          title: (
            <div>
              {item?.name?.split(" ").map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          ),
          dataIndex: item.apikey,
          key: item.apikey,
          render: (text) => (text ? "Yes" : "No"),
        };
      } else if (item.apikey === "Date_Of_Booking") {
        return {
          title: (
            <div>
              {item?.name?.split(" ").map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          ),
          dataIndex: item.apikey,
          key: item.apikey,
          render: (text) => dayjs(text).format("DD/MM/YYYY"), // '25/01/2019'
        };
      }
      return {
        title: (
          <div>
            {item?.name?.split(" ").map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        ),
        dataIndex: item.apikey,
        key: item.apikey,
        ellipsis: true,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps

  if (billInfo.error) {
    return <div>Error: {billInfo.error}</div>;
  }

  const groupDataByStayName = (data) => {
    return data.reduce((acc, item) => {
      if (!acc[item?.["Income_From_(Stay_Name)"]]) {
        acc[item["Income_From_(Stay_Name)"]] = [];
      }
      acc[item["Income_From_(Stay_Name)"]].push(item);
      return acc;
    }, {});
  };
  const removeKeys = (obj, keys) => {
    const newObj = { ...obj };
    keys.forEach((key) => {
      delete newObj[key];
    });
    return newObj;
  };

  const handleExport = () => {
    const groupedData = groupDataByStayName(handleCommonFilter(billItems));

    // const totalColumns = column_Order.length;
    // const totalEntires = billItems.length;

    const wb = XLSX.utils.book_new();

    Object.keys(groupedData).forEach((name) => {
      let filteredData = groupedData[name].map((item) =>
        removeKeys(item, ["__v", "_id"])
      );
      filteredData = orderColumns(filteredData, column_Order);

      filteredData.push(
        column_Order.reduce((acc, key) => {
          acc[key] = ""; // or any default value
          return acc;
        }, {})
      );
      filteredData.push(
        column_Order.reduce((acc, key) => {
          acc[key] = key === "Share_Percentage" ? "Total" : ""; // or any default value
          return acc;
        }, {})
      );
      const ws = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(wb, ws, `${name}`);
    });

    XLSX.writeFile(wb, "Stay_Info.xlsx");
  };

  const handleCommonFilter = (data) => {
    return data
      .filter(handleFilterFilter1)
      .filter(handleFilterFilter2)
      .filter(handleFilterFilter3)
      .filter(handleFilterFilter4);
  };

  const handleFilterFilter1 = (item) => {
    return (
      filter1.length === 0 || filter1?.includes(item["Income_From_(Stay_Name)"])
    );
  };
  const handleFilterFilter2 = (item) => {
    return filter2.length === 0 || filter2?.includes(item["Booking_From"]);
  };
  const handleFilterFilter3 = (item) => {
    const isGst = filter3 === "Yes";
    return filter3?.length === 0 || isGst === item?.Is_GST_Included;
  };
  const handleFilterFilter4 = (item) => {
    const withinDateRange =
      dateRange[0] === null ||
      dateRange[1] === null ||
      (dayjs(item?.Date_Of_Booking).isAfter(dateRange[0]) &&
        dayjs(item?.Date_Of_Booking).isBefore(dateRange[1]));
    return withinDateRange;
  };

  const filteredTable = billItems ? handleCommonFilter(billItems) : [];

  return (
    <div>
      <Button onClick={handleExport}>Export to Excel</Button>{" "}
      <Row justify="space-around" gutter={[16, 24]}>
        <Col span={4}>
          <h4>Stay Name</h4>
          <Select
            mode="multiple"
            allowClear
            style={{
              width: "100%",
            }}
            placeholder="Please select"
            onChange={(value) => setFilter1(value)}
            options={findOptions("hotel")}
          />
        </Col>
        <Col span={4}>
          <h4>Booking From</h4>
          <Select
            mode="multiple"
            allowClear
            style={{
              width: "100%",
            }}
            placeholder="Please select"
            onChange={(value) => setFilter2(value)}
            options={findOptions("Booking_From")}
          />
        </Col>
        <Col span={4}>
          <h4>GST Included</h4>
          <Select
            allowClear
            style={{
              width: "100%",
            }}
            placeholder="Please select"
            onChange={(value) => setFilter3(value)}
            options={findOptions("GST")}
          />
        </Col>
        <Col span={5}>
          <h4>Select Date Range</h4>

          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            format={"DD/MM/YYYY"}
          />
        </Col>
      </Row>
      <Table
        dataSource={filteredTable}
        columns={columns}
        rowKey="_id"
        scroll={{
          x: 2000,
          y: 400,
        }}
        size="small"
        loading={billInfo.isFetching}
      />
      <h3>Total Final Amount: {billInfo.data.totalFinalAmount}</h3>
    </div>
  );
}
