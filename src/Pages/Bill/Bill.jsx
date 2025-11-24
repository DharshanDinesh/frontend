/* eslint-disable react/prop-types */
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Typography
} from "antd";

import {
  WarningOutlined,
  CalculatorOutlined,
  ClearOutlined,
  SaveOutlined,
  PlusOutlined,
  CheckCircleOutlined ,
  DeleteOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useRef } from "react";
import "./Bill.css";
import dayjs from "dayjs";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { helperApi } from "../../Utils/API/helperAPI";
import { Loader } from "../../Components/Loader/Loader";
import { toast } from "react-toastify";

export function Bill() {
  const [form] = Form.useForm();
  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [isSubmitEnabled, enableSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dummy, setDummy] = useState(false);
  const { Title, Text } = Typography;
  const taxCalculationsSectionRef = useRef(null);

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
    }
    else if (key === "amount_credited_to" && accountInfo.isSuccess) {
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
    toast.error(<Msg title="Error occurred" text="Unable to create entry. Please try again." />, {
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
  const validateAmounts = () => {
    const formValues = form.getFieldsValue();
    const netProfit = formValues.net_profit || 0;
    const creditedAccounts = formValues.creditedAccounts || [];

    // Calculate total credited amount
    const totalCreditedAmount = creditedAccounts.reduce((sum, account) => {
      return sum + (Number(account?.amount) || 0);
    }, 0);

    // Enable submit if amounts match
    enableSubmit(Math.abs(totalCreditedAmount - netProfit) < 0.01); // Using small epsilon for float comparison
  };

  const handleChangeInFileds = () => {
    setDummy((prev) => !prev);

    // Update commission percentage when booking_from changes
    const bookingFrom = form.getFieldValue('booking_from');
    if (bookingFrom) {
      const sourceData = sourceInfo?.data?.find(
        source => source.name === bookingFrom
      );
      form.getFieldValue(undefined)
      setCommissionPercentage(sourceData?.commission || 0);
    }

    // Validate amounts whenever fields change
    validateAmounts();
  };

  // Watch for changes in booking_from
  useEffect(() => {
    const bookingFrom = form.getFieldValue('booking_from');
    if (bookingFrom) {
      const sourceData = sourceInfo?.data?.find(
        source => source.name === bookingFrom
      );
      setCommissionPercentage(sourceData?.commission || 0);
    }
  }, [form.getFieldValue('booking_from'), sourceInfo.data]);

  const handleCalculateIncome = async () => {
    try {
      // Define required fields
      const requiredFields = {
        tenant_name: "Tenant Name",
        stay_name: "Stay Name",
        room_no: "Room No",
        date_of_booking: "Date of Booking",
        booking_from: "Booking From",
        gst_transction: "GST Transaction",
        total_without_taxes: "Total Without Taxes",
        tax_slab: "Tax Percentage / Slab"
      };

      // Get current form values
      const formValues = form.getFieldsValue();

      // Check for required fields
      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!formValues[field] && formValues[field] !== false) {
          missingFields.push(label);
        }
      });

      // If any required fields are missing, show error and return
      if (missingFields.length > 0) {
        toast.error(
          <Msg
            title="Required Fields Missing"
            text={`Please fill in the following fields: ${missingFields.join(', ')}`}
          />,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        return;
      }

      const totalWithoutTaxes = Number(formValues.total_without_taxes) || 0;
      const taxSlab = Number(formValues.tax_slab) || 0;
      const bookingFrom = formValues.booking_from;

      // Calculate GST amount
      const totalTaxAmount = (totalWithoutTaxes * taxSlab) / 100;

      // Calculate total with taxes
      const totalWithTaxes = totalWithoutTaxes + totalTaxAmount;

      // Find commission percentage from source info
      const sourceData = sourceInfo.data.find(
        source => source.name === bookingFrom
      );
      const sourceCommission = sourceData?.commission || 0;

      // Calculate commission amount
      const commissionAmount = (totalWithoutTaxes * sourceCommission) / 100;

      // Calculate commission GST (18%)
      const commissionGST = (commissionAmount * 18) / 100;

      // Calculate total commission amount
      const totalCommissionAmount = commissionAmount + commissionGST;

      // Calculate TCS (0.5% of total without taxes)
      const tcsAmount = (totalWithoutTaxes * 0.5) / 100;

      // Calculate TDS (0.1% of total without taxes)
      const tdsAmount = (totalWithoutTaxes * 0.1) / 100;

      // Calculate net profit
      const netProfit = totalWithTaxes - totalCommissionAmount - tcsAmount - tdsAmount;

      // Update form values
      await form.setFieldsValue({
        totalTaxAmount: totalTaxAmount,
        totalWithTaxes: totalWithTaxes,
        commission_amount: commissionAmount,
        commission_amount_gst: commissionGST,
        total_commission_amount: totalCommissionAmount,
        commissionPercentage: sourceCommission,
        tcs_amount: tcsAmount,
        tds_amount: tdsAmount,
        net_profit: netProfit
      });

      // Force form to update
      setDummy(prev => !prev);

      // Validate amounts after calculation
      validateAmounts();

      // Use Promise.resolve to ensure we scroll after React has updated the DOM
      Promise.resolve().then(() => {
        // Ensure we're executing this after React has processed state updates
        requestAnimationFrame(() => {
          if (taxCalculationsSectionRef.current) {
            const yOffset = -100; // Offset for header
            const element = taxCalculationsSectionRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
              top: y,
              behavior: 'smooth'
            });
          }
        });
      });
    } catch (error) {
      console.error('Calculation error:', error);
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
      // Format the credited accounts array
      creditedAccounts: values.creditedAccounts?.map(account => ({
        account: account.account,
        amount: Number(account.amount),
      })) || [],
      isIncome: true,
    };
    console.log(apiBody);
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/billv2`,
        apiBody
      );
      setLoading(false);
      response.status === 201 && toastSuccess();
      if (!response.status === 201) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error('Error submitting form:', error?.message || 'An unknown error occurred');
      toastError();
      setLoading(false);
    }
  };

  if (
    sourceInfo.isFetching ||
    accountInfo.isFetching || hotelInfo.isFetching
  ) {
    return <Loader />;
  }
  return (
    <div className="bill_container">
      <Title level={2} className="bill_container_title">Income Entry</Title>
      <Form
        form={form}
        name="dynamic_rule"
        layout="vertical"
        size="large"
        requiredMark="optional"
      >
        <div className="bill_sections_container">
          <div className="bill_container_section">
            <div style={{ padding: '16px' }}>
              {/* Booking Details Section */}
              <Row gutter={[16, 16]}>
                {/* Tenant Name */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item
                    label={<Text strong>Tenant Name</Text>}
                    name="tenant_name"
                    rules={[{ required: true, message: 'Please enter Tenant Name' }]}
                  >
                    <Input
                      placeholder="Enter tenant name"
                      onChange={(e) => handleChangeInFileds(e.target.value, 'tenant_name', 'bookingDetails')}
                      style={{ height: '42px' }}
                    />
                  </Form.Item>
                </Col>

                {/* Stay Name */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item
                    label={<Text strong>Stay Name</Text>}
                    name="stay_name"
                    rules={[{ required: true, message: 'Please select Stay Name' }]}
                  >
                    <Select
                      options={findOptions('stay_name')}
                      onSelect={(e) => handleChangeInFileds(e, 'stay_name', 'bookingDetails')}
                      placeholder="Select stay name"
                    />
                  </Form.Item>
                </Col>

                {/* Room No */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item
                    label={<Text strong>Room No</Text>}
                    name="room_no"
                    rules={[{ required: true, message: 'Please select Room No' }]}
                  >
                    <Select
                      options={findOptions('room_no')}
                      onSelect={(e) => handleChangeInFileds(e, 'room_no', 'bookingDetails')}
                      placeholder="Select room number"
                    />
                  </Form.Item>
                </Col>
                {/* Booking From */}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item
                    label={<Text strong>Booking From</Text>}
                    name="booking_from"
                    rules={[{ required: true, message: 'Please select Booking Source' }]}
                  >
                    <Select
                      options={findOptions('booking_from')}
                      onSelect={(e) => handleChangeInFileds(e, 'booking_from', 'bookingDetails')}
                      placeholder="Select booking source"
                    />
                  </Form.Item>
                </Col>

                {/* Date of Booking */}
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                  <Form.Item
                    label={<Text strong>Date of Booking</Text>}
                    name="date_of_booking"
                    rules={[{ required: true, message: 'Please select Booking Date' }]}
                  >
                    <DatePicker.RangePicker
                      style={{ width: '100%' }}
                      format={'DD/MM/YYYY'}
                      onChange={(dates) => handleChangeInFileds(dates, 'date_of_booking', 'bookingDetails')}
                    />
                  </Form.Item>
                </Col>



                {/* GST Transaction */}
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                  <Form.Item
                    label={<Text strong>GST Transaction</Text>}
                    name="gst_transction"
                    rules={[{ required: true, message: 'Please select GST Transaction' }]}
                    initialValue={true}
                  >
                    <Radio.Group onChange={(e) => handleChangeInFileds(e.target.value, 'gst_transction', 'bookingDetails')}>
                      <Radio value={true}>Yes</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                  <Form.Item
                    label={<Text strong>Total Without Taxes</Text>}
                    name="total_without_taxes"
                    rules={[{ required: true, message: 'Please enter total amount' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter amount"
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                  <Form.Item
                    label={<Text strong>Tax Percentage / Slab (%)</Text>}
                    name="tax_slab"
                    rules={[{ required: true, message: 'Please enter tax percentage' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter tax percentage"
                      min={0}
                      max={100}
                      formatter={value => `${value}%`}
                      parser={value => value.replace('%', '')}
                      size="large"
                    />
                  </Form.Item>
                </Col>

              </Row>

              {/* Calculate Button */}
              <div className="section-card" style={{ textAlign: 'center', margin: '32px 0', background: '#f0f7ff' }}>
                <Space direction="vertical" size="large" style={{ width: '100%', alignItems: 'center' }}>
                  <Button
                    type="primary"
                    icon={<CalculatorOutlined />}
                    onClick={handleCalculateIncome}
                    size="large"
                    style={{
                      height: '52px',
                      padding: '0 48px',
                      fontSize: '16px',
                      boxShadow: '0 4px 12px rgba(22, 119, 255, 0.2)',
                      borderRadius: '8px'
                    }}
                  >
                    Calculate Income
                  </Button>
                  <div style={{
                    fontSize: '13px',
                    color: '#1677ff',
                    padding: '12px 24px',
                    background: 'white',
                    borderRadius: '8px',
                    maxWidth: '700px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}>
                    <Text type="secondary" strong>Required fields:</Text>
                    <br />
                    Tenant Name • Stay Name • Room No • Date of Booking • Booking From • GST Transaction • Total Without Taxes • Tax Percentage
                  </div>
                </Space>
              </div>

              {/* Results Sections */}
              <div className="calculation-results" style={{ display: form.getFieldValue('totalTaxAmount') ? 'block' : 'none' }}>
                {/* Tax Calculations Section */}
                <div ref={taxCalculationsSectionRef} style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #91caff' }}>
                  <h4 style={{ color: '#1677ff', marginBottom: '16px' }}>Tax Calculations</h4>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={<Text strong>Total Tax Amount (GST)</Text>}
                          name="totalTaxAmount"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#1677ff' }}>
                            <Form.Item noStyle name="totalTaxAmount">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Total Without Taxes × Tax Slab%
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={<Text strong>Total with Taxes and Fees</Text>}
                          name="totalWithTaxes"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#1677ff' }}>
                            <Form.Item noStyle name="totalWithTaxes">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Total Without Taxes + Total Tax Amount
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Commission Calculations Section */}
                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                  <h4 style={{ color: '#52c41a', marginBottom: '16px' }}>Commission Calculations</h4>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={
                            <span>
                              Commission Amount
                              {commissionPercentage > 0 && (
                                <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                                  ({commissionPercentage}%)
                                </span>
                              )}
                            </span>
                          }
                          name="commission_amount"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#52c41a' }}>
                            <Form.Item noStyle name="commission_amount">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Total Without Taxes × {commissionPercentage}%
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={<Text strong>GST (18%) on Commission Amount</Text>}
                          name="commission_amount_gst"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#52c41a' }}>
                            <Form.Item noStyle name="commission_amount_gst">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Commission Amount × 18%
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={<Text strong>Total Commission Amount</Text>}
                          name="total_commission_amount"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#52c41a' }}>
                            <Form.Item noStyle name="total_commission_amount">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Commission Amount + Commission GST
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Other Tax Deductions Section */}
                <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#fff7e6', borderRadius: '8px', border: '1px solid #ffd591' }}>
                  <h4 style={{ color: '#fa8c16', marginBottom: '16px' }}>Other Tax Deductions</h4>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={<Text strong>TCS Amount (0.5%)</Text>}
                          name="tcs_amount"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#fa8c16' }}>
                            <Form.Item noStyle name="tcs_amount">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Total Without Taxes × 0.5%
                        </div>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <Form.Item
                          label={<Text strong>TDS Amount (0.1%)</Text>}
                          name="tds_amount"
                        >
                          <div style={{ fontSize: '18px', fontWeight: '500', color: '#fa8c16' }}>
                            <Form.Item noStyle name="tds_amount">
                              <InputNumber
                                style={{ width: '100%' }}
                                disabled
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              />
                            </Form.Item>
                          </div>
                        </Form.Item>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                          = Total Without Taxes × 0.1%
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Final Profit Section */}
                <div style={{ padding: '20px', backgroundColor: '#f9f0ff', borderRadius: '8px', border: '1px solid #d3adf7' }}>
                  <h4 style={{ color: '#722ed1', marginBottom: '16px' }}>Final Profit Calculation</h4>
                  <div className="calculation-box" style={{ background: 'white', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <Form.Item
                      label={<Text strong>Net Profit</Text>}
                      name="net_profit"
                    >
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#722ed1' }}>
                        <Form.Item noStyle name="net_profit">
                          <InputNumber
                            style={{ width: '100%' }}
                            disabled
                            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          />
                        </Form.Item>
                      </div>
                    </Form.Item>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                      = Total with Taxes and Fees - Total Commission Amount - TCS Amount - TDS Amount
                    </div>
                  </div>
                </div>



          {/* Credit Distribution Section */}
          <div style={{ 
            marginBottom: '24px',
            padding: '24px',
            backgroundColor: '#fcfcfc',
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ 
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Title level={4} style={{ margin: 0, color: '#262626' }}>
                Credit Distribution
              </Title>
              <Text type="secondary">
                Distribute the net profit amount across accounts
              </Text>
            </div>

            <Form.List name="creditedAccounts" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} style={{
                      padding: '20px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      position: 'relative'
                    }}>
                      <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                          <Form.Item
                            {...restField}
                            label={<Text strong>Account</Text>}
                            name={[name, 'account']}
                            rules={[{ required: true, message: 'Please select account' }]}
                          >
                            <Select
                              size="large"
                              options={findOptions('amount_credited_to')}
                              onSelect={(e) => handleChangeInFileds(e, 'amount_credited_to', 'accountDetails')}
                              placeholder="Select account for credit"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                          <Form.Item
                            {...restField}
                            label={<Text strong>Amount</Text>}
                            name={[name, 'amount']}
                            rules={[{ required: true, message: 'Please enter amount' }]}
                          >
                            <InputNumber
                              size="large"
                              style={{ width: '100%' }}
                              placeholder="Enter credit amount"
                              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/₹\s?|(,*)/g, '')}
                              onChange={() => {
                                setTimeout(validateAmounts, 0);
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {fields.length > 1 && (
                        <Button
                          type="text"
                          onClick={() => remove(name)}
                          icon={<DeleteOutlined />}
                          danger
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '12px'
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      size="large"
                      style={{
                        height: '52px',
                        padding: '0 48px',
                        fontSize: '16px',
                        borderColor: '#1677ff',
                        color: '#1677ff',
                        boxShadow: '0 4px 12px rgba(22, 119, 255, 0.1)',
                        borderRadius: '8px'
                      }}
                    >
                      Add Another Account
                    </Button>
                  </div>
                </div>
              )}
            </Form.List>
          </div>

          {/* Submit Button Section */}
          <div className="submit-section"
           style={{
            padding: '24px',
            backgroundColor: isSubmitEnabled ? '#f6ffed' : '#fff2f0',
            borderRadius: '12px',
            marginTop: '32px',
            transition: 'all 0.3s ease',
            boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <Row gutter={[24, 24]} justify="space-between" align="middle">
              <Col xs={24} sm={12}>
                <div style={{
                  color: isSubmitEnabled ? '#52c41a' : '#ff4d4f',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {isSubmitEnabled ? (
                    <>
                      <CheckCircleOutlined style={{ fontSize: '20px' }} />
                      <Text strong style={{ color: '#52c41a' }}>
                        Amounts balanced - ready to submit
                      </Text>
                    </>
                  ) : (
                    <>
                      <WarningOutlined style={{ fontSize: '20px' }} />
                      <Text strong style={{ color: '#ff4d4f' }}>
                        Total credited amount must equal net profit
                      </Text>
                    </>
                  )}
                </div>
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                <Space size="large">
                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClearForm}
                    size="large"
                    style={{
                      height: '48px',
                      padding: '0 32px',
                      fontSize: '15px',
                      borderRadius: '8px'
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    disabled={!isSubmitEnabled}
                    loading={loading}
                    size="large"
                    style={{
                      height: '48px',
                      padding: '0 40px',
                      fontSize: '15px',
                      borderRadius: '8px',
                      boxShadow: isSubmitEnabled ? '0 4px 12px rgba(82, 196, 26, 0.2)' : 'none'
                    }}
                  >
                    Submit Entry
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
              </div>
            </div>
          </div>



      
        </div>
      </Form>
    </div>
  );
}


