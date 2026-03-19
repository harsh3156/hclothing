import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TrackOrder.css";

const TrackOrder = () => {
    const { trackingId: urlTrackingId } = useParams();
    const [trackingId, setTrackingId] = useState(urlTrackingId || "");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOrder = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`http://localhost:5000/api/orders/track/${id}`);
            setOrder(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to find order. Please check your Tracking ID.");
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (urlTrackingId) {
            fetchOrder(urlTrackingId);
        }
    }, [urlTrackingId]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (trackingId.trim()) {
            navigate(`/track/${trackingId.trim()}`);
            fetchOrder(trackingId.trim());
        }
    };

    const statuses = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
    const currentStatusIndex = order ? statuses.indexOf(order.status) : -1;

    return (
        <div className="track-order-container">
            <h1>Track Your Order</h1>
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Enter Tracking ID (e.g. ORD-2026...)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Track"}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {order && (
                <div className="order-status-card">
                    <div className="order-header">
                        <h2>Order Status: <span className={`status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>{order.status}</span></h2>
                        <p><strong>Tracking ID:</strong> {order.trackingId}</p>
                    </div>

                    <div className="tracking-timeline">
                        {statuses.map((status, index) => (
                            <div key={status} className={`timeline-item ${index <= currentStatusIndex ? 'active' : ''} ${index === currentStatusIndex ? 'current' : ''}`}>
                                <div className="timeline-marker">
                                    {index < currentStatusIndex ? "✓" : index + 1}
                                </div>
                                <div className="timeline-content">
                                    <p className="status-label">{status}</p>
                                    {index === currentStatusIndex && <p className="status-date">Updated on: {new Date(order.updatedAt).toLocaleDateString()}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="order-details-summary">
                        <h3>Order Summary</h3>
                        <div className="items-mini-list">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="mini-item">
                                    {item.product?.name || item.name} x {item.quantity}
                                </div>
                            ))}
                        </div>
                        <p className="total-price">Total Amount: ₹{order.totalAmount}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;
