import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAllOrdersAPI } from "../api/orders";
import "./Reports.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const DAYS = 30;
const COLORS = ["#1a237e", "#ff6b6b", "#f6b93b", "#1abc9c", "#9b59b6", "#ff7043"];

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
};

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await getAllOrdersAPI(user.token);

        // ✅ Step 1: Filter out 'Admin Cancel' orders at the source
        const filtered = (res.data || []).filter((o) => {
          const status = o.status?.toLowerCase() || "";
          return !status.includes("admin cancel");
        });

        setOrders(filtered);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // --- Metrics ---
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // --- Orders by Status (Normalized for Pie Chart) ---
  // This logic groups all 'Cancel' variations into one label for the chart.
  const ordersByStatus = orders.reduce((acc, o) => {
    let s = o.status || "Unknown";
    
    // 1. Normalize the status string to handle casing and slight spelling variations
    let normalizedStatus = s.trim().toUpperCase();

    // 2. Combine all variations of 'Canceled' and 'Cancelled' into a single label
    if (normalizedStatus.includes("CANCEL")) {
        normalizedStatus = "CANCELED"; 
    }
    // 3. Optional: Group variations like 'CONFIRMED' and 'Confirmed' 
    //    (You can add more grouping logic here if needed)
    else if (normalizedStatus.includes("CONFIRM")) {
        normalizedStatus = "CONFIRMED";
    }
    else if (normalizedStatus.includes("DELIVER")) {
        normalizedStatus = "DELIVERED";
    }
    else if (normalizedStatus.includes("PENDING")) {
        normalizedStatus = "PENDING";
    }

    // 4. Update the accumulator
    acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
    return acc;
  }, {});
  
  // --- Product Metrics ---
  const productMap = {};
  orders.forEach((o) => {
    (o.items || []).forEach((it) => {
      const pid = it.product?._id || it.productId || it.product;
      if (!pid) return;
      const name = it.product?.name || it.name || "Unknown";
      const qty = it.quantity || 0;
      const revenue = (it.price || 0) * qty;
      if (!productMap[pid]) productMap[pid] = { id: pid, name, qtySold: 0, revenue: 0 };
      productMap[pid].qtySold += qty;
      productMap[pid].revenue += revenue;
    });
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 5);

  const topProductsByRevenue = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // --- Revenue by Day ---
  const revenueByDay = {};
  for (let i = 0; i < DAYS; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    revenueByDay[d.toISOString().slice(0, 10)] = 0;
  }
  orders.forEach((o) => {
    const d = formatDate(o.createdAt || o.updatedAt || new Date());
    if (revenueByDay.hasOwnProperty(d)) revenueByDay[d] += o.totalAmount || 0;
  });

  const revenueByDayArr = Object.keys(revenueByDay)
    .sort()
    .map((k) => ({ date: k, revenue: revenueByDay[k] }));

  // --- CSV Download ---
  const downloadCSV = () => {
    const headers = ["Rank", "Product Name", "Quantity Sold", "Revenue"];
    const rows = topProducts.map(
      (p, i) => `${i + 1},${p.name},${p.qtySold},${p.revenue.toFixed(2)}`
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>📊 Admin Reports</h2>
        <button className="download-btn" onClick={downloadCSV}>
          ⬇️ Download Report
        </button>
      </div>

      {loading && <p>Loading reports...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary */}
          <div className="summary-section">
            <div className="summary-card peach">
              <h3>Total Revenue</h3>
              <p>₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="summary-card navy">
              <h3>Total Orders</h3>
              <p>{orders.length}</p>
            </div>
            <div className="summary-card peach">
              <h3>Total Products Sold</h3>
              <p>{Object.values(productMap).reduce((sum, p) => sum + p.qtySold, 0)}</p>
            </div>
            {ordersByStatus["USER CANCELLED"] && (
              <div className="summary-card orange">
                <h3>User Cancelled</h3>
                <p>{ordersByStatus["USER CANCELLED"]}</p>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="chart-section">
            <div className="chart-card">
              <h3>Revenue Trend (Last {DAYS} days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByDayArr}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#1a237e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Orders by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(ordersByStatus).map(([status, value], i) => ({
                      // Use a cleaner name for display
                      name: status.replace('CANCELED', 'Canceled'), 
                      value,
                      fill: COLORS[i % COLORS.length],
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Top Products (by Revenue)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsByRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#ffb07c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="table-section">
            <h3>Top 5 Products (by Quantity Sold)</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Qty Sold</th>
                  <th>Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.qtySold}</td>
                    <td>{p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;