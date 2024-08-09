import { Button, Col, Row, Select, Table } from "antd";
import { useState } from "react";
// import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { fields } from "../../Utils/constant";
import { DatePicker } from "antd";
import { useQuery } from "@tanstack/react-query";
import { helperApi } from "../../Utils/API/helperAPI";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./dashboard.css";
export function Dashboard() {
  const { RangePicker } = DatePicker;

  const [filterIncome, setFilterIncome] = useState(null);
  const [filter1, setFilter1] = useState([]);
  const [filter2, setFilter2] = useState([]);
  const [filter3, setFilter3] = useState(null);
  const [dateRange, setDateRange] = useState([]);

  const sourceInfo = useQuery({
    queryKey: ["source"],
    queryFn: () => helperApi("source"),
  });
  const hotelInfo = useQuery({
    queryKey: ["hotel"],
    queryFn: () => helperApi("hotel"),
  });
  const billInfo = useQuery({
    queryKey: ["bill"],
    queryFn: () => helperApi("bill"),
    initialData: {},
  });
  function removeKeyIfCondition(arr, keyToRemove, condition) {
    return arr.map((obj) => {
      if (condition(obj)) {
        // eslint-disable-next-line no-unused-vars
        const { [keyToRemove]: _d, ...newObj } = obj; // Remove the key
        return newObj;
      }
      return obj;
    });
  }
  const condition = (obj) => obj.isIncome === false;

  const billItems = removeKeyIfCondition(
    billInfo?.data?.items ?? [],
    "date_of_booking",
    condition
  );

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
        value: item === "Yes" ? true : false,
      }));
    }
  }
  const sortByOrder = (arr) => {
    return arr.sort((a, b) => {
      if (a.order === undefined && b.order === undefined) return 0;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      return a.order - b.order;
    });
  };
  const columns = sortByOrder(fields).map((item) => {
    if (
      item.apiKey === "gst_transction" ||
      item.apiKey === "is_cash_received" ||
      item.apiKey === "gst_transction_expense"
    ) {
      return {
        title: (
          <div>
            {item?.name?.split(" ").map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        ),
        dataIndex: item.apiKey,
        key: item.apiKey,
        render: (text) => (text ? "Yes" : "No"),
      };
    }
    if (item.apiKey === "isIncome") {
      return {
        title: (
          <div>
            {item?.name?.split(" ").map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        ),
        dataIndex: item.apiKey,
        key: item.apiKey,
        render: (text) => (text ? "Income" : "Expense"),
      };
    } else if (item.apiKey === "date_of_booking") {
      return {
        title: (
          <div>
            {item?.name?.split(" ").map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        ),
        dataIndex: item.apiKey,
        key: item.apiKey,
        render: (text) => {
          return text?.length > 0 && `${text[0]} to ${text[1]}`;
        }, // '25/01/2019'
      };
    } else if (item.apiKey === "profit_loss") {
      return {
        title: (
          <div>
            {item?.name?.split(" ").map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        ),
        dataIndex: item.apiKey,
        key: item.apiKey,
        render: (text, records) => {
          return records.isIncome
            ? records?.final_amount
            : records?.total_expense;
        },
      };
    } else if (item.apiKey === "amount_credited_to") {
      return {
        title: (
          <div>
            {item?.name?.split(" ").map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        ),
        dataIndex: item.apiKey,
        key: item.apiKey,
        render: (text) => {
          return text.join(",");
        },
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
      dataIndex: item.apiKey,
      key: item.apiKey,
      ellipsis: true,
    };
  });

  const handleExport = () => {
    const groupDataByStayName = (data) => {
      return data.reduce((acc, item) => {
        if (!acc[item?.["Stay Name"]]) {
          acc[item["Stay Name"]] = [];
        }
        acc[item["Stay Name"]].push(item);
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

    const headerNameMapping = fields.reduce((acc, item) => {
      return { ...acc, [item.apiKey]: item.name };
    }, {});

    const renameHeaders = (data, headerMapping = headerNameMapping) => {
      return data.map((item) => {
        const newItem = {};
        for (const key in item) {
          if (headerMapping[key]) {
            newItem[headerMapping[key]] = item[key];
          } else {
            newItem[key] = item[key];
          }
        }
        return newItem;
      });
    };

    const renamed = renameHeaders(handleCommonFilter(billItems));
    const groupedData = groupDataByStayName(renamed);

    const orderColumns = (data, columnOrder) => {
      return data?.map((item) => {
        const orderedItem = {};
        columnOrder.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            orderedItem[key] = item[key];
          } else {
            orderedItem[key] = ""; // Ensure that all columns are present
          }
        });
        return orderedItem;
      });
    };

    const column_Order = fields
      .sort((a, b) => a.order - b.order)
      .map((item) => item.name);

    const workbook = new ExcelJS.Workbook();

    Object.keys(groupedData).forEach((name) => {
      let filteredData = groupedData[name].map((item) =>
        removeKeys(item, ["__v", "_id"])
      );
      filteredData = filteredData.map((item) => ({
        ...item,
        ["Type"]: item["Type"] ? "Income" : "Expense",
        ["GST Transction"]: item["GST Transction"] ? "Yes" : "No",
        ["GST Transction (Expense)"]: item["GST Transction (Expense)"]
          ? "Yes"
          : "No",
        ["Date Of Booking"]: item["Type"]
          ? `${item["Date Of Booking"]?.[0]} to ${item["Date Of Booking"]?.[1]}`
          : "",
        ["Does Amount Received as Cash"]: item["Does Amount Received as Cash"]
          ? "Yes"
          : "No",
        ["Profit / Loss Amount"]: item["Type"]
          ? item["Income After tax"]
          : item["Total Expense"],
        ["Amount Credited to"]: item["Amount Credited to"].join(" , "),
      }));

      filteredData = orderColumns(filteredData, column_Order);

      const worksheet = workbook.addWorksheet(name);

      // Add headers
      const headers = Object.keys(filteredData[0]);
      worksheet.addRow(headers);

      // Add data
      filteredData.forEach((row) => {
        worksheet.addRow(Object.values(row));
      });

      // Set column widths based on maximum length of content in each column
      headers.forEach((header, i) => {
        let maxLength = header.length;
        filteredData.forEach((row) => {
          const cellValue = row[header];
          if (cellValue && cellValue.toString().length > maxLength) {
            maxLength = cellValue.toString().length;
          }
        });
        worksheet.getColumn(i + 1).width = maxLength + 2; // +2 for padding
      });

      // Apply styles to the first row (header row)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 11, name: "Calibri" };
      headerRow.alignment = { horizontal: "center", vertical: "center" };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFAA00" }, // Light orange background color
        };
      });

      // Center-align all cells and apply specific styling to the last column
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          cell.alignment = { horizontal: "center", vertical: "center" };
          // Apply styling to the last column (Profit / Loss Amount)
          if (colNumber === headers.length) {
            cell.font = { color: "black", bold: true };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFAA00" },
            };
            cell.font = { bold: true, size: 11, name: "Calibri" };
          }
        });
      });

      // Add total amount row
      const totalRow = worksheet.getRow(filteredData.length + 2);
      totalRow.getCell(headers.length - 1).value = "Total Amount";
      totalRow.getCell(headers.length).value = {
        formula: `SUM(${worksheet.getColumn(headers.length).letter}2:${
          worksheet.getColumn(headers.length).letter
        }${filteredData.length + 1})`,
      };
      totalRow.font = { bold: true };
    });

    // Save the workbook
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), "Stay_Info.xlsx");
    });
  };
  const handleCommonFilter = (arr) => {
    function multiFilter(array, filters) {
      return array.filter((item) => {
        return filters.every((filter) => filter(item));
      });
    }
    const filterEntryByType = (type) => (entry) =>
      type === null || entry.isIncome === type;
    const filterEntryByStayName = (type) => (entry) =>
      type?.length === 0 || type?.includes(entry["stay_name"]);
    const filterEntryByIncomeSource = (type) => (entry) =>
      type?.length === 0 || type?.includes(entry["booking_from"]);
    const filterEntryByGstSales = (type) => (entry) =>
      type === null || entry.gst_transction === type;
    const filterEntryByDates = (type) => (entry) => {
      return (
        type[0] === undefined ||
        type[1] === undefined ||
        isDateInRange(entry?.expense_date, type[0], type[1]) ||
        (isDateInRange(entry?.date_of_booking?.[0], type[0], type[1]) &&
          isDateInRange(entry?.date_of_booking?.[1], type[0], type[1]))
      );
    };

    const isDateInRange = (date, startDate, endDate) => {
      const formattedDate = dayjs(date, "DD/MM/YYYY");
      const start = dayjs(startDate, "DD/MM/YYYY");
      const end = dayjs(endDate, "DD/MM/YYYY");

      return (
        (formattedDate.isAfter(start) && formattedDate.isBefore(end)) ||
        formattedDate.isSame(start) ||
        formattedDate.isSame(end)
      );
    };

    return multiFilter(arr, [
      filterEntryByType(filterIncome),
      filterEntryByStayName(filter1),
      filterEntryByIncomeSource(filter2),
      filterEntryByGstSales(filter3),
      filterEntryByDates(dateRange),
    ]);
  };

  const filteredTable = billItems ? handleCommonFilter(billItems) : [];

  if (billInfo.error) {
    return <div>Error: {billInfo.error}</div>;
  }
  return (
    <div>
      <Row justify="end" align="middle" gutter={[16, 24]}>
        <Col xs={24} sm={12} md={8} lg={4} span={4}>
          <Button onClick={handleExport}>Export to Excel</Button>{" "}
        </Col>
      </Row>
      <Row justify="space-around" align="middle" gutter={[16, 24]}>
        <Col xs={24} sm={12} md={8} lg={4} span={4}>
          <h4>Select Income / Expense</h4>
          <Select
            allowClear
            style={{
              width: "100%",
            }}
            placeholder="Please select"
            onChange={(value) => {
              setFilterIncome(value ?? null);
            }}
            options={[
              { label: "Income", value: true },
              { label: "Expense", value: false },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} span={4}>
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
        <Col xs={24} sm={12} md={8} lg={4} span={4}>
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
        <Col xs={24} sm={12} md={8} lg={4} span={4}>
          <h4>GST Included (Sales)</h4>
          <Select
            allowClear
            style={{
              width: "100%",
            }}
            placeholder="Please select"
            onChange={(value) => setFilter3(value ?? null)}
            options={findOptions("GST")}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} span={5}>
          <h4>Select Date Range</h4>

          <RangePicker
            onChange={(dates) => {
              setDateRange(
                dates === null
                  ? []
                  : [
                      dates[0].format("DD/MM/YYYY"),
                      dates[1].format("DD/MM/YYYY"),
                    ]
              );
            }}
            format={"DD/MM/YYYY"}
          />
        </Col>
      </Row>
      <div style={{ margin: "0.5rem" }}>
        <Table
          dataSource={filteredTable}
          columns={columns}
          rowKey="_id"
          scroll={{
            x: 4000,
            y: 4000,
          }}
          size="small"
          loading={billInfo.isFetching}
          pagination={false}
          className="custom-table"
        />
      </div>
    </div>
  );
}
