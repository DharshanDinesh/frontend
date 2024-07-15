import { useState } from "react";
import { Button, Input, Table } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Column } = Table;

const DailyIncomeExpenseCalculator = () => {
  const [entries, setEntries] = useState([]);
  const [income, setIncome] = useState("");
  const [expense, setExpense] = useState("");

  const handleAddEntry = () => {
    if (income !== "" && expense !== "") {
      const newEntry = {
        income: parseFloat(income),
        expense: parseFloat(expense),
        totalGain: parseFloat(income) - parseFloat(expense),
      };
      setEntries([...entries, newEntry]);
      setIncome("");
      setExpense("");
    }
  };

  const handleExportToExcel = () => {
    // Calculate total sums
    const totalIncome = entries.reduce(
      (total, entry) => total + entry.income,
      0
    );
    const totalExpense = entries.reduce(
      (total, entry) => total + entry.expense,
      0
    );
    const totalGain = totalIncome - totalExpense;

    // Prepare data for export
    const data = [
      ...entries,
      { income: "Total", expense: "", totalGain: "" }, // Placeholder row for total
      { income: totalIncome, expense: totalExpense, totalGain },
    ];

    const ws = XLSX.utils.json_to_sheet(data, {
      header: ["Income", "Expense", "Total Gain"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Income Expense");

    // Set column widths for better visibility
    ws["!cols"] = [{ width: 15 }, { width: 15 }, { width: 15 }];

    // Generate Excel file and save using FileSaver
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer]), "DailyIncomeExpenseReport.xlsx");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Daily Income and Expense Calculator</h2>
      <Input
        type="number"
        placeholder="Enter Income"
        value={income}
        onChange={(e) => setIncome(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <Input
        type="number"
        placeholder="Enter Expense"
        value={expense}
        onChange={(e) => setExpense(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <Button
        type="primary"
        onClick={handleAddEntry}
        style={{ marginBottom: "10px", marginRight: "10px" }}
      >
        Add Entry
      </Button>
      <Button
        type="primary"
        onClick={handleExportToExcel}
        style={{ marginBottom: "10px" }}
      >
        Export to Excel
      </Button>
      <Table dataSource={entries}>
        <Column title="Income" dataIndex="income" key="income" />
        <Column title="Expense" dataIndex="expense" key="expense" />
        <Column title="Total Gain" dataIndex="totalGain" key="totalGain" />
      </Table>
    </div>
  );
};

export default DailyIncomeExpenseCalculator;
