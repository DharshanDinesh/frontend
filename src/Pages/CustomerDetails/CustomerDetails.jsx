/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Row,
  message,
  DatePicker,
  Col,
  Table,
  Space,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import "../Bill/Bill.css";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { helperApi } from "../../Utils/API/helperAPI";
import { useQuery } from "@tanstack/react-query";
import { DeleteOutlined } from "@ant-design/icons";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

const { RangePicker } = DatePicker;

export const CustomerForm = () => {
  const [loading, setLoading] = useState(false);
  const [fileBase64, setFileBase64] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);

  const [form] = Form.useForm();

  const hotelInfo = useQuery({
    queryKey: ["hotel"],
    queryFn: () => helperApi("hotel"),
  });
  const sourceInfo = useQuery({
    queryKey: ["customers"],
    queryFn: () => helperApi("customers"),
  });
  const [stayName, setStayName] = useState(null);

  const handleValuesChange = (_changedValues, allValues) => {
    setStayName(allValues.stayName); // Update state on form value change
  };
  const convertPdfToImage = async (pdfBytes) => {
    let pdfData;

    // Check if pdfBytes is a URL or a base64 string
    if (pdfBytes.url) {
      const response = await fetch(pdfBytes.url);
      pdfData = await response.arrayBuffer();
    } else {
      // Assume pdfBytes is a base64 string
      const cleanBase64 = pdfBytes.replace(
        /^data:application\/pdf;base64,/,
        ""
      );
      const pdfDataArray = Uint8Array.from(atob(cleanBase64), (c) =>
        c.charCodeAt(0)
      );
      pdfData = pdfDataArray.buffer;
    }

    const loadingTask = getDocument({ data: pdfData });
    const pdfDoc = await loadingTask.promise;
    const imageUrls = [];

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: 2 }); // Adjust scale as needed

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext("2d");

      // Render the page into the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      const imageUrl = canvas.toDataURL("image/jpeg");
      imageUrls.push(imageUrl);
    }

    return imageUrls; // Return the array of image URLs
  };
  const processImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;

      // Handle WebP and other image file types
      if (fileType === "image/webp") {
        const reader = new FileReader();

        reader.onload = () => {
          const img = document.createElement("img");
          img.src = reader.result; // WebP base64 data URL
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const convertedDataUrl = canvas.toDataURL("image/jpeg"); // Convert to jpeg/png
            resolve({
              url: convertedDataUrl,
              fileType: "image/jpeg",
              name: file.name,
            });
          };
          img.onerror = (error) => reject("Error loading image: " + error);
        };

        reader.onerror = (error) => reject("File reading error: " + error);
        reader.readAsDataURL(file); // Convert file to Base64 to load into <img> element
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result, fileType: file.type, name: file.name });
        };
        reader.onerror = (error) => reject("File reading error: " + error);
        reader.readAsDataURL(file);
      }
    });
  };
  const handleFileChange = async (info) => {
    try {
      const files = info.fileList;
      const base64Files = await Promise.all(
        files.map((file) => processImageToBase64(file.originFileObj))
      );
      const removeNoNPdfFromUpload = base64Files.filter(
        (d) => d.fileType !== "application/pdf"
      );

      const pdfList = base64Files.filter(
        (d) => d.fileType === "application/pdf"
      );
      const pdfbase64 = await Promise.all(
        pdfList.map((file) => convertPdfToImage(file))
      );
      const objStructure = pdfbase64?.[0]?.map((d) => ({ url: d })) ?? [];

      setFileBase64([...removeNoNPdfFromUpload, ...objStructure]); // Store the array of Base64 files
    } catch (error) {
      console.error(error);
      message.error("Error converting files to Base64.");
    }
  };
  const onPreview = async (file) => {
    let src = file.url || file.preview;

    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }

    // Open the file in a new window
    const previewWindow = window.open();
    if (previewWindow) {
      const isPDF = file.type === "application/pdf";
      previewWindow.document.write(`
        <html>
          <head><title>${file.name}</title></head>
          <body>
            ${
              isPDF
                ? `<embed src="${src}" type="application/pdf" width="100%" height="100%" />`
                : `<img src="${src}" style="max-width: 100%; height: auto;" />`
            }
          </body>
        </html>
      `);
      previewWindow.document.close(); // Close the document to render the HTML
    }
  };
  const onRemove = (file) => {
    // Remove the file from the fileBase64 array based on its name
    setFileBase64((prev) => prev.filter((base64, index) => index !== file.uid));
  };
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        file: fileBase64,
        checkIn: dayjs(values?.CheckInOut?.[0]),
        checkOut: dayjs(values?.CheckInOut?.[1]),
        dateOfEntry: dayjs(),
      };
      delete formData["CheckInOut"];

      // Send POST request to the server
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/customers`,
        formData
      );
      response.status === 201 && form.resetFields();
      response.status === 201 && setApiResponse(response.data);
      response.status === 201 && sourceInfo.refetch();

      message.success("Customer info submitted successfully!");
    } catch (error) {
      message.error("Error submitting customer info.");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    const data = await axios.delete(
      `${import.meta.env.VITE_API_URL}/${"customers"}/${id}`
    );
    data.status === 200 && sourceInfo.refetch();
  };
  const columns = [
    {
      title: "Date of Entry",
      dataIndex: "dateOfEntry",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Stay Name",
      dataIndex: "stayName",
      key: "stayName",
    },
    {
      title: "Room No.",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Check-In",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Check-Out",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Files",
      dataIndex: "file",
      key: "file",
      render: (file, data) => {
        // eslint-disable-next-line no-unsafe-optional-chaining
        return <PDFGenerator base64PdfImages={file} info={data} />;
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "_id",
      align: "center",
      render: (a, b) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<DeleteOutlined />}
            danger
            loading={false}
            onClick={() => handleDelete(a, b)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div style={{ padding: "20px" }}>
      <div className="bill_container_title">Create Customer Entry</div>
      <Row justify="center">
        <Form
          form={form}
          layout="horizontal"
          onFinish={onFinish}
          onValuesChange={handleValuesChange} // Track value changes
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[
              {
                required: true,
                type: "address",
                message: "Please input a valid address!",
              },
            ]}
          >
            <Input placeholder="Enter address" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please input your phone number!" },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            label="Check In - Check Out"
            name="CheckInOut"
            rules={[
              { required: true, message: "Please enter CheckIn - CheckOut!" },
            ]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            label="Stay Name"
            name="stayName"
            rules={[{ required: true, message: "Please enter Stay Name!" }]}
          >
            <Select
              options={
                Array.isArray(hotelInfo?.data)
                  ? hotelInfo?.data?.map((item) => ({
                      label: item.name,
                      value: item.name,
                      key: item._id,
                    }))
                  : []
              }
            />
          </Form.Item>
          <Form.Item
            label="Room Number"
            name="roomNumber"
            rules={[{ required: true, message: "Please enter Room No." }]}
          >
            <Select
              options={
                stayName && Array.isArray(hotelInfo?.data)
                  ? hotelInfo?.data
                      ?.find((val) => val.name === stayName)
                      ?.rooms?.map((item) => ({
                        label: item.name,
                        value: item.name,
                        key: item._id,
                      }))
                  : []
              }
            />
          </Form.Item>
          <Form.Item
            name="file"
            label="Upload File"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Please upload a file!" }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              showUploadList={true}
              multiple
              accept="image/*,.pdf" // Accept all image formats and PDF
              onRemove={onRemove}
              onPreview={onPreview}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Row justify="space-evenly">
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Submit
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Row>
      <Row justify={"space-evenly"}>
        <Col xs={24} sm={24} md={24} lg={24} span={4}>
          <Table
            columns={columns}
            dataSource={sourceInfo.data}
            loading={sourceInfo.isFetching}
            rowKey="_id"
          />
        </Col>
      </Row>
    </div>
  );
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30, // Add more padding for a cleaner look
    fontFamily: "Helvetica", // Set a clean, readable font
    fontSize: 12, // Standard font size
  },
  header: {
    fontSize: 20, // Larger title size for section header
    textAlign: "center", // Center the title
    marginBottom: 20, // Add space below the title
    fontWeight: "bold", // Make the title bold
  },
  textSection: {
    marginBottom: 30, // Add more space between the text and images
    padding: 15, // Add padding inside the text section
    border: "1px solid #000", // Add a border around the text section
    borderRadius: 5, // Round the corners for a nicer appearance
    backgroundColor: "#f9f9f9", // Light background color to differentiate the section
  },
  flexContainer: {
    flexDirection: "row",
    margin: 5,
    alignItems: "center",
  },
  textTitle: {
    fontSize: 14, // Slightly larger font for the field names
    width: "30%",
    marginRight: "3%",
  },
  textValue: {
    fontSize: 14, // Normal font size for the values
    width: "50%",
  },
  imageSection: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow wrapping of images
    justifyContent: "center", // Center the images in the section
    alignItems: "center", // Center images vertically
    padding: 10,
    backgroundColor: "#f1f1f1", // Light background for the image section
    borderRadius: 5, // Slightly rounded corners for a modern look
  },
  image: {
    width: "50%", // Adjust the size for consistency
    height: "auto",
    margin: "5 0", // Space between images
    border: "1px solid #ccc", // Add a light border to images
    borderRadius: 5, // Slightly rounded corners
  },
});

const MyDocument = (props) => {
  const {
    name = "",
    address = "",
    checkIn = "",
    checkOut = "",
    phoneNumber = "",
    stayName = "",
    roomNumber = "",
    // eslint-disable-next-line no-unsafe-optional-chaining
  } = props?.info ?? {};
  console.log(props);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.header}>Guest Information</Text>

        {/* Text Section */}
        <View style={styles.textSection}>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Name:</Text>
            <Text style={styles.textValue}>{name}</Text>
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Address:</Text>
            <Text style={styles.textValue}>{address}</Text>
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Phone Number:</Text>
            <Text style={styles.textValue}>{phoneNumber}</Text>
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Stay Name:</Text>
            <Text style={styles.textValue}>{stayName}</Text>
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Room Number:</Text>
            <Text style={styles.textValue}>{roomNumber}</Text>
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Check-In:</Text>
            <Text style={styles.textValue}>
              {dayjs(checkIn).format("DD-MM-YYYY")}
            </Text>
          </View>
          <View style={styles.flexContainer}>
            <Text style={styles.textTitle}>Check-Out:</Text>
            <Text style={styles.textValue}>
              {dayjs(checkOut).format("DD-MM-YYYY")}
            </Text>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.imageSection}>
          {props?.base64PdfImages.length > 0 &&
            props?.base64PdfImages
              .filter((d) => d.fileType !== "application/pdf")
              .map((imageSrc, index) => (
                <Image key={index} style={styles.image} src={imageSrc.url} />
              ))}
        </View>
      </Page>
    </Document>
  );
};

// Component to trigger the PDF download
const PDFGenerator = (props) => (
  <div>
    <PDFDownloadLink document={<MyDocument {...props} />} fileName="sample.pdf">
      {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
    </PDFDownloadLink>
  </div>
);
