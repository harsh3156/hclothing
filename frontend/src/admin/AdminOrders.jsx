import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAllOrdersAPI, updateOrderStatusAPI } from "../api/orders";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // State for Search, Filter & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // 🆕 Date Filter states
  const [dateFilter, setDateFilter] = useState("all"); // all | week | custom
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const updateableStatusOptions = ["Pending", "Confirmed", "Shipped", "Delivered"];

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrdersAPI(user.token);
      const sortedOrders = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!user) return;
    setUpdating(orderId);
    try {
      await updateOrderStatusAPI(user.token, orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update status");
      fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  const formatUserDisplay = (order) => {
    if (!order.user) return "Guest/Deleted User";
    const name = order.user.name || "Unknown Name";
    const email = order.user.email || "No Email";
    return (
      <>
        <strong>{name}</strong>
        <br />
        <small>{email}</small>
      </>
    );
  };

  // 🧭 Filtering, Searching, Date Filter, Sorting
  const filteredOrders = useMemo(() => {
    let list = orders;

    // 🧠 Filter by Status
    list = list.filter((order) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "Canceled/Other")
        return order.status === "Cancelled" || order.status === "Canceled";
      return order.status === filterStatus;
    });

    // 🔍 Search by name/email/orderID
    const search = searchTerm.toLowerCase();
    if (search) {
      list = list.filter(
        (order) =>
          order._id.toLowerCase().includes(search) ||
          (order.user?.name || "").toLowerCase().includes(search) ||
          (order.user?.email || "").toLowerCase().includes(search)
      );
    }

    // 📅 Date Filtering
    const now = new Date();
    if (dateFilter === "week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      list = list.filter(
        (order) =>
          new Date(order.createdAt) >= sevenDaysAgo &&
          new Date(order.createdAt) <= now
      );
    } else if (dateFilter === "custom" && fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      list = list.filter(
        (order) =>
          new Date(order.createdAt) >= start && new Date(order.createdAt) <= end
      );
    }

    // 🧭 Sort orders
    list.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    return list;
  }, [orders, searchTerm, filterStatus, sortOrder, dateFilter, fromDate, toDate]);

  return (
    <div className="admin-orders">
      <h2>All Orders ({filteredOrders.length} found)</h2>

      {/* 🔍 Controls Section */}
      <div className="orders-controls">
        <input
          type="text"
          placeholder="Search by ID, User Name, or Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter-select"
        >
          <option value="all">Filter by Status (All)</option>
          {updateableStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
          <option value="Canceled/Other">Canceled/Failed Orders</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="status-filter-select"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
        </select>

        {/* 📅 Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="status-filter-select"
        >
          <option value="all">All Dates</option>
          <option value="week">Last 7 Days</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilter === "custom" && (
          <div className="date-range">
            <label>From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <label>To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading && <p>Loading orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && filteredOrders.length === 0 && (
        <p>No orders found for the selected filters.</p>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Details</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{formatUserDisplay(order)}</td>
                <td className={`order-status-cell status-${order.status.toLowerCase()}`}>
                  {order.status}
                </td>
                <td>₹{(order.totalAmount || 0).toFixed(2)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={order.status}
                    disabled={
                      updating === order._id ||
                      order.status === "Delivered" ||
                      order.status === "Cancelled" ||
                      order.status === "Canceled"
                    }
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {!updateableStatusOptions.includes(order.status) && (
                      <option value={order.status} disabled>
                        {order.status}
                      </option>
                    )}
                    {updateableStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updating === order._id && <span className="updating-loader"> ⏳</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
