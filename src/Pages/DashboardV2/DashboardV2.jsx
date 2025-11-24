import { Button, Col, Row, Select, Table, Statistic, Card, Tag, Typography, DatePicker } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { fields } from "../../Utils/constant";
import {
  DollarCircleOutlined,
  TeamOutlined,
  BankOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import "./dashboard.css";
import { useQuery } from "@tanstack/react-query";
import { helperApi } from "../../Utils/API/helperAPI";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function DashboardV2() {
  const { RangePicker } = DatePicker;
  const { Text } = Typography;

  // State management for filters
  const [filterIncome, setFilterIncome] = useState(null);
  const [filter1, setFilter1] = useState([]);
  const [filter2, setFilter2] = useState([]);
  const [filter3, setFilter3] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [dateRangeEntry, setDateRangeEntry] = useState([]);
  
  // State management for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    
    if (filterIncome !== null) {
      params.append('isIncome', filterIncome.toString());
    }
    
    if (filter1.length > 0) {
      filter1.forEach(stay => params.append('stay_name', stay));
    }
    
    if (filter2.length > 0) {
      filter2.forEach(source => params.append('booking_from', source));
    }
    
    if (filter3 !== null) {
      params.append('gst_transction', filter3.toString());
    }
    
    if (dateRangeEntry.length === 2) {
      params.append('startDateEntry', dateRangeEntry[0]);
      params.append('endDateEntry', dateRangeEntry[1]);
    }
    
    if (dateRange.length === 2) {
      params.append('startDateBooking', dateRange[0]);
      params.append('endDateBooking', dateRange[1]);
    }
    
    return params.toString();
  };

  // Fetch data
  const sourceInfo = useQuery({
    queryKey: ["source"],
    queryFn: () => helperApi("source"),
  });

  const hotelInfo = useQuery({
    queryKey: ["hotel"],
    queryFn: () => helperApi("hotel"),
  });

  const billInfo = useQuery({
    queryKey: ["billv2", currentPage, pageSize, filterIncome, filter1, filter2, filter3, dateRange, dateRangeEntry],
    queryFn: () => {
      const queryString = buildQueryParams();
      return helperApi(`billv2?${queryString}`);
    },
    initialData: { items: [], totalNetProfit: 0, count: 0, page: 1, limit: 10, totalPages: 0 },
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  // Get data values
  const billItems = billInfo?.data?.items ?? [];
  const totalNetProfit = billInfo?.data?.totalNetProfit ?? 0;
  const totalCount = billInfo?.data?.count ?? 0;
  const totalPages = billInfo?.data?.totalPages ?? 0;

  // Dropdown options
  function findOptions(key) {
    if (key === "hotel" && hotelInfo.isSuccess && Array.isArray(hotelInfo.data)) {
      return hotelInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "Booking_From" && sourceInfo.isSuccess && Array.isArray(sourceInfo.data)) {
      return sourceInfo.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    } else if (key === "GST") {
      return [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ];
    }
    return [];
  }

  // Helper for Indian number formatting
  const formatINR = (num) => {
    // Handle null, undefined, empty strings
    if (num == null || num === '') return '0';
    
    // Convert to number if it's a string
    const numValue = typeof num === 'number' ? num : Number(num);
    
    // If conversion fails, return 0
    if (isNaN(numValue)) return '0';
    
    // Format using Indian number system
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Helper to safely format strings
  const formatString = (str) => {
    if (str == null || str === '') return '-';
    if (typeof str === 'string') return str.trim();
    return String(str);
  };

  // Helper to format date arrays
  const formatDateRange = (dates) => {
    if (Array.isArray(dates) && dates.length >= 2) {
      return `${formatString(dates[0])} to ${formatString(dates[1])}`;
    }
    if (dates) return formatString(dates);
    return '-';
  };

  // Table columns
  // Custom columns for better readability for elderly users
  const cellBoxStyle = {
    padding: '6px 0',
    minWidth: 90,
    fontSize: 15,
    background: 'none',
    margin: 0,
    boxShadow: 'none',
  };
  const valueStyle = { color: '#1a237e', fontWeight: 600, marginLeft: 4 };
  const labelStyle = { color: '#222', fontWeight: 500, minWidth: 110, display: 'inline-block' };
  const formulaStyle = { fontSize: '0.7rem', color: '#00897b', margin: '6px 0 0 0', fontStyle: 'italic', display: 'block' };
  const rowStyle = { display: 'flex', alignItems: 'center', margin: '2px 0' };

  const columns = [
     {
      title: "Type",
      dataIndex: "isIncome",
      key: "isIncome",
      render: (val) => (
        <div style={{ ...cellBoxStyle, minWidth: 60 }}>
          <span style={labelStyle}>{val ? "Income" : "Expense"}</span>
        </div>
      ),
    },

    // GST Transaction
    {
      title: "GST Transaction",
      dataIndex: "gst_transction",
      key: "gst_transction",
      render: (val) => (
        <div style={{ ...cellBoxStyle, minWidth: 70 }}>
          <span style={labelStyle}>{val ? "Yes" : "No"}</span>
        </div>
      ),
    },
    // Income/Expense
    {
      title: "Booking Details",
      key: "booking_details",
      dataIndex: "booking_details",
      render: (_, record) => {
        const entryDate = formatString(record.date_of_entry);
        const tenant = formatString(record.tenant_name);
        const stay = formatString(record.stay_name);
        const room = formatString(record.room_no);
        const source = formatString(record.booking_from || record.Booking_From);
        const dates = formatDateRange(record.date_of_booking);
        
        return (
          <div style={cellBoxStyle}>
            <div style={rowStyle}><span style={labelStyle}>Date of Entry:</span><span style={valueStyle}>{entryDate}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Tenant:</span><span style={valueStyle}>{tenant}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Stay:</span><span style={valueStyle}>{stay}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Room No:</span><span style={valueStyle}>{room}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Source:</span><span style={valueStyle}>{source}</span></div>
            <div style={rowStyle}><span style={labelStyle}>Booking Dates:</span><span style={valueStyle}>{dates}</span></div>
          </div>
        );
      },
    },
   
  

    // Combined Tax Calculation Column
    {
      title: "Tax Calculation (Step-by-Step)",
      key: "tax_calculation",
      render: (_, record) => {
        const totalWithoutTaxes = Number(record.total_without_taxes) || 0;
        const taxSlab = Number(record.tax_slab) || 0;
        const taxAmount = Number(record.totalTaxAmount) || 0;
        const totalWithTaxes = Number(record.totalWithTaxes) || 0;
        
        return (
          <div style={cellBoxStyle}>
            <div style={rowStyle}><b style={labelStyle}>Base Amount:</b><span style={valueStyle}>₹{formatINR(totalWithoutTaxes)}</span></div>
            <div style={rowStyle}><b style={labelStyle}>Tax Slab:</b><span style={valueStyle}>{formatINR(taxSlab)}%</span></div>
            <div style={rowStyle}><b style={labelStyle}>Tax Amount:</b><span style={valueStyle}>₹{formatINR(taxAmount)}</span></div>
            <span style={formulaStyle}>Formula: ₹{formatINR(totalWithoutTaxes)} + (₹{formatINR(totalWithoutTaxes)} × {formatINR(taxSlab)}% / 100) = ₹{formatINR(totalWithTaxes)}</span>
            <div style={rowStyle}><b style={labelStyle}>Total With Taxes:</b><span style={valueStyle}>₹{formatINR(totalWithTaxes)}</span></div>
          </div>
        );
      },
    },
    // Commission Percentage & Amount (grouped)
    {
      title: "Commission (Step-by-Step)",
      key: "commission",
      render: (_, record) => {
        const base = Number(record.total_without_taxes) || 0;
        const percent = Number(record.commission_percentage) || 0;
        const amount = Number(record.commission_amount) || 0;
        const gst = Number(record.commission_amount_gst) || 0;
        const total = Number(record.total_commission_amount) || 0;
        
        return (
          <div style={cellBoxStyle}>
            <div style={rowStyle}><b style={labelStyle}>Base Amount:</b><span style={valueStyle}>₹{formatINR(base)}</span></div>
            <div style={rowStyle}><b style={labelStyle}>Commission %:</b><span style={valueStyle}>{formatINR(percent)}%</span></div>
            <div style={rowStyle}><b style={labelStyle}>Commission Amount:</b><span style={valueStyle}>₹{formatINR(amount)}</span></div>
            <div style={rowStyle}><b style={labelStyle}>GST on Commission:</b><span style={valueStyle}>₹{formatINR(gst)}</span></div>
            <div style={rowStyle}><b style={labelStyle}>Total:</b><span style={valueStyle}>₹{formatINR(total)}</span></div>
            <span style={formulaStyle}>Formula: ₹{formatINR(base)} × {formatINR(percent)}% / 100 = ₹{formatINR(amount)}</span>
               <span style={formulaStyle}>Total Commission: ₹{formatINR(amount)} + ₹{formatINR(gst)} = ₹{formatINR(total)}</span>
          </div>
        );
      },
    },
    // TCS & TDS (grouped)
    {
      title: "TCS / TDS (Explained)",
      key: "tcs_tds",
      render: (_, record) => {
        const base = Number(record.total_without_taxes) || 0;
        const tcsPercent = 0.05;
        const tdsPercent = 0.04;
        const tcs = (base * tcsPercent / 100);
        const tds = (base * tdsPercent / 100);
        
        return (
          <div style={cellBoxStyle}>
            <div style={rowStyle}><b style={labelStyle}>TCS:</b><span style={valueStyle}>₹{formatINR(tcs)}</span></div>
            <div style={rowStyle}><b style={labelStyle}>TDS:</b><span style={valueStyle}>₹{formatINR(tds)}</span></div>
            <span style={formulaStyle}>TCS : ₹{formatINR(base)} × {tcsPercent}% / 100 = ₹{formatINR(tcs)}</span>
               <span style={formulaStyle}>
              
               TDS : ₹{formatINR(base)} × {tdsPercent}% / 100 = ₹{formatINR(tds)}</span>
          </div>
        );
      },
    },
    // Credited Accounts
    {
      title: "Credited Accounts",
      dataIndex: "creditedAccounts",
      key: "creditedAccounts",
      render: (val) => {
        if (Array.isArray(val) && val.length > 0) {
          return (
            <div style={cellBoxStyle}>
              {val.map((acc, idx) => {
                const accountName = formatString(acc.account);
                const accountAmount = Number(acc.amount) || 0;
                return (
                  <div key={idx} style={rowStyle}>
                    <b style={labelStyle}>{accountName}:</b>
                    <span style={valueStyle}>₹{formatINR(accountAmount)}</span>
                  </div>
                );
              })}
            </div>
          );
        }
        return <span style={cellBoxStyle}>-</span>;
      },
    },
    // Net Profit
    {
      title: "Net Profit",
      dataIndex: "net_profit",
      key: "net_profit",
      render: (val) => {
        const profit = Number(val) || 0;
        const isPositive = profit >= 0;
        return (
          <div style={{ ...cellBoxStyle, minWidth: 80 }}>
            <span style={{ ...valueStyle, color: isPositive ? '#3f8600' : '#cf1322', fontWeight: 700 }}>
              ₹{formatINR(Math.abs(profit))}
              {!isPositive && ' (Loss)'}
            </span>
          </div>
        );
      },
    },
  ];


  // Handle pagination change
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (filterSetter) => (value) => {
    setCurrentPage(1);
    filterSetter(value);
  };

  // Handle Excel Export
  // Handle Excel Export
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Dashboard Data");

    const headers = fields.map((field) => field.name);
    worksheet.addRow(headers);

    billItems.forEach((item) => {
      const row = fields.map((field) => {
        let val = item[field.apiKey];
        console.log('Exporting field:', field.apiKey, 'Value:', val);
        // Special handling for 'creditedAccounts' field
        if (field.apiKey === 'creditedAccounts' && Array.isArray(val)) {
          // Format as "Account1: ₹Amount1, Account2: ₹Amount2"
          return val.map(acc => {
            // Defensive: handle possible missing or differently cased keys
            const accountName = acc.account || acc.Account || '-';
            const accountAmount = acc.amount != null ? `₹${formatINR(acc.amount)}` : (acc.Amount != null ? `₹${formatINR(acc.Amount)}` : '-');
            return `${accountName}: ${accountAmount}`;
          }).join('; '); // Use semicolon for clarity if commas in names
        }
        if (typeof val === "boolean") return val ? "Yes" : "No";
        if (Array.isArray(val)) return val.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(", ");
        return val ?? "";
      });
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `dashboard_data_${dayjs().format("YYYY-MM-DD")}.xlsx`
    );
  };

  return (
    <div className="dashboard-container" style={{ padding: 8 }}>
      <Card bordered={false} style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Filter Section */}
        <Row justify="start" gutter={[8, 8]} wrap>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Date Range (Entry)</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 4 }}
              onChange={(dates) => {
                setCurrentPage(1);
                setDateRangeEntry(
                  dates
                    ? [dates[0].format("DD/MM/YYYY"), dates[1].format("DD/MM/YYYY")]
                    : []
                );
              }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Income / Expense</Text>
            <Select
              allowClear
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Select type"
              onChange={handleFilterChange(setFilterIncome)}
              options={[
                { label: "Income", value: true },
                { label: "Expense", value: false },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Stay Name</Text>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Select stays"
              onChange={handleFilterChange(setFilter1)}
              options={findOptions("hotel")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Booking Source</Text>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Select sources"
              onChange={handleFilterChange(setFilter2)}
              options={findOptions("Booking_From")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>GST Status</Text>
            <Select
              allowClear
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Select GST"
              onChange={handleFilterChange(setFilter3)}
              options={findOptions("GST")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Text strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Booking Date Range</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 4 }}
              onChange={(dates) => {
                setCurrentPage(1);
                setDateRange(
                  dates
                    ? [dates[0].format("DD/MM/YYYY"), dates[1].format("DD/MM/YYYY")]
                    : []
                );
              }}
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>

        {/* Stats Section */}
        <Row gutter={[8, 8]} style={{ marginTop: 16 }} wrap>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card bordered={false} className="stats-card" style={{ minHeight: 120 }}>
              <Statistic
                title="Total Net Profit"
                value={formatINR(totalNetProfit)}
                prefix="₹"
                valueStyle={{ color: "#3f8600", fontSize: '20px' }}
              />
              <Tag color="success" style={{ marginTop: 8 }}>
                {formatINR(totalCount)} Transactions
              </Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card bordered={false} className="stats-card" style={{ minHeight: 120 }}>
              <Statistic
                title="Total Hotels"
                value={formatINR(hotelInfo.data?.length ?? 0)}
                prefix={<BankOutlined />}
                valueStyle={{ color: "#1890ff", fontSize: '20px' }}
              />
              <Tag color="blue" style={{ marginTop: 8 }}>
                Active
              </Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card bordered={false} className="stats-card" style={{ minHeight: 120 }}>
              <Statistic
                title="Booking Sources"
                value={formatINR(sourceInfo.data?.length ?? 0)}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1", fontSize: '20px' }}
              />
              <Tag color="purple" style={{ marginTop: 8 }}>
                Connected
              </Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card bordered={false} className="stats-card" style={{ minHeight: 120 }}>
              <Statistic
                title="Average Transaction"
                value={formatINR(totalCount ? totalNetProfit / totalCount : 0)}
                prefix="₹"
                valueStyle={{ color: "#faad14", fontSize: '20px' }}
              />
              <Tag color="warning" style={{ marginTop: 8 }}>
                Per Entry
              </Tag>
            </Card>
          </Col>
        </Row>

        {/* Chart */}
        <Card
          className="financial-trend-card"
          bordered={false}
          style={{ marginTop: 16 }}
          title={
            <Row justify="space-between" align="middle" wrap gutter={[8, 8]}>
              <Col xs={24} sm={16} md={16}>
                <Text strong style={{ fontSize: '16px' }}>Financial Trend</Text>
              </Col>
              <Col xs={24} sm={8} md={8} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  onClick={handleExport}
                  icon={<BarChartOutlined />}
                  style={{ width: '100%', maxWidth: '200px' }}
                >
                  Export Data
                </Button>
              </Col>
            </Row>
          }
        >
          {/* Chart component removed as per recent edits */}
        </Card>

        {/* Table */}
        <Card
          className="transactions-table"
          bordered={false}
          style={{ marginTop: 16 }}
          title={
            <Row justify="space-between" align="middle" wrap>
              <Col xs={24} sm={16} md={16}>
                <Text strong style={{ fontSize: '16px' }}>Detailed Transactions</Text>
              </Col>
              <Col xs={24} sm={8} md={8} style={{ textAlign: 'right', marginTop: '8px' }}>
                <Text type="secondary">{formatINR(totalCount)} entries</Text>
              </Col>
            </Row>
          }
        >
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <Table
              rowKey={(record) => record._id || record.id || record.date}
              dataSource={billItems}
              columns={columns}
              scroll={{ x: 'max-content' }}
              size="small"
              pagination={{ 
                current: currentPage,
                pageSize: pageSize,
                total: totalCount,
                showSizeChanger: true, 
                pageSizeOptions: [5, 10, 20, 50, 100],
                responsive: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${formatINR(total)} items`
              }}
              onChange={handleTableChange}
              loading={billInfo.isLoading || billInfo.isFetching}
              bordered
              className="dashboard-table-autoheight dashboard-table-dynamic-width"
              sticky
            />
          </div>
        </Card>
      </Card>
    </div>
  );
}
