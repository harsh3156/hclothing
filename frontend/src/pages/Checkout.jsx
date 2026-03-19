import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./Checkout.css";

const SHIPPING_FEE = 50.0;
const FREE_SHIPPING_THRESHOLD = 5000;

const Checkout = () => {
  const { user, removeOrderedItems } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Items passed from cart page
  const items = location.state?.items || [];
  const initialSubtotal =
    location.state?.subtotal ||
    items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    paymentMethod: "COD",
  });

  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper: Dynamically loads the official Razorpay Checkout SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- Price calculations ---
  const calculatedShippingFee =
    initialSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = initialSubtotal + calculatedShippingFee;

  // --- Input handler with restrictions ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict name to alphabets and spaces only
    if (name === "name") {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
      setForm({ ...form, name: filteredValue });
      return;
    }

    // Restrict phone to numbers only
    if (name === "phone") {
      const filteredValue = value.replace(/[^0-9]/g, "");
      setForm({ ...form, phone: filteredValue });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // --- Validation ---
  const validateForm = () => {
    const { name, email, phone, address } = form;

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      return "Please fill in all delivery details (Name, Email, Phone, Address).";
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return "Name should contain only letters and spaces.";
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return "Please enter a valid 10-digit phone number.";
    }

    // ✅ Must be a valid Gmail address with at least one letter and one number before @gmail.com
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d._%+-]+@gmail\.com$/.test(email.trim())) {
      return "Please enter a valid Gmail address (e.g., user123@gmail.com).";
    }

    // ✅ Address validation (letters, numbers, commas, dots, hyphens, spaces)
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(address.trim())) {
      return "Address should contain only letters, numbers, commas, dots, and hyphens.";
    }

    if (items.length === 0 || initialSubtotal === 0) {
      return "Your cart is empty or subtotal is zero.";
    }

    return null;
  };

  // --- Handle Order Placement ---
  const handleOrder = async () => {
    setError(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (form.paymentMethod === "COD") {
       await placeOrderBackend("COD");
    } else if (form.paymentMethod === "Razorpay") {
       await handleOnlinePayment();
    }
  };

  const placeOrderBackend = async (paymentMethod, paymentDetails = null) => {
    setIsProcessing(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          price: i.product.price,
          selectedSize: i.selectedSize,
          quantity: i.quantity,
          image: i.product.image,
        })),
        totalAmount: grandTotal,
        subtotal: initialSubtotal,
        shippingFee: calculatedShippingFee,
        recipientName: form.name.trim(),
        recipientEmail: form.email.trim(),
        recipientPhone: form.phone.trim(),
        deliveryAddress: form.address.trim(),
        paymentMethod: paymentMethod,
      };

      const res = await axios.post("http://localhost:5000/api/orders", orderData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // If Razorpay, we also need to verify the payment using this order's ID
      if (paymentMethod === "Razorpay" && paymentDetails) {
        const verifyRes = await axios.post("http://localhost:5000/api/payment/verify-payment", {
          razorpay_order_id: paymentDetails.razorpay_order_id,
          razorpay_payment_id: paymentDetails.razorpay_payment_id,
          razorpay_signature: paymentDetails.razorpay_signature,
          systemOrderId: res.data.order._id,
        }, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (!verifyRes.data.success) {
           throw new Error("Payment verification failed.");
        }
      }

      if (removeOrderedItems)
        removeOrderedItems(
          items.map((i) => ({
            product: i.product._id,
            selectedSize: i.selectedSize,
          }))
        );

      alert(
        `✅ Order placed successfully! Total: ₹${grandTotal.toFixed(
          2
        )}. You selected ${paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}.`
      );

      navigate("/orders", { state: { orderPlaced: true } });
    } catch (err) {
      const backendError =
        err.response?.data?.message ||
        "Failed to place order due to a server error. Please try again.";
      setError(backendError);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    setIsProcessing(true);
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      setError("Failed to load Razorpay SDK. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Fetch Razorpay Key ID
      const { data: { key } } = await axios.get("http://localhost:5000/api/payment/get-key", {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // 2. Create the order in Razorpay
      const { data: orderData } = await axios.post("http://localhost:5000/api/payment/create-order", {
        amount: grandTotal
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!orderData.success) {
        setError("Failed to create Razorpay order.");
        setIsProcessing(false);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Ecommerce Store",
        description: "Order Checkout",
        order_id: orderData.order.id,

        handler: async function (response) {
           // On success, we create the order in our DB and verify payment
           await placeOrderBackend("Razorpay", {
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature
           });
        },
        modal: {
          ondismiss: function() {
              setIsProcessing(false);
          }
        },
        theme: {
          color: "#3399cc"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        setError(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });

    } catch (err) {
      console.error("Checkout error:", err);
      setError("Something went wrong initializing the payment window. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  // --- Conditional rendering ---
  if (!user) {
    return (
      <div className="checkout-status error">Please log in to checkout.</div>
    );
  }

  if (items.length === 0) {
    return <div className="checkout-status">Your cart is empty.</div>;
  }

  // --- UI ---
  return (
    <div className="checkout-page-wrapper">
      {/* ⬅️ Back to Cart Button */}
      <button
        onClick={handleBackToCart}
        className="back-to-cart-btn"
        disabled={isProcessing}
      >
        ← Back to Cart
      </button>

      {/* Main Checkout Container */}
      <div className="checkout-container">
        {/* LEFT SIDE: Delivery details */}
        <div className="checkout-left">
          <h2>Delivery Details</h2>
          {error && <p className="error-message">{error}</p>}

          <label>Name:</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            disabled={isProcessing}
          />

          <label>Email:</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Gmail address"
            disabled={isProcessing}
          />

          <label>Phone:</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit Phone Number"
            disabled={isProcessing}
          />

          <label>Address:</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full Delivery Address"
            disabled={isProcessing}
          />

          <h3>Payment Method</h3>
          <div className="payment-options">
            <label style={{ display: 'block', margin: '10px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={form.paymentMethod === "COD"}
                onChange={handleChange}
                disabled={isProcessing}
              />
              Cash On Delivery (COD)
            </label>
            <label style={{ display: 'block', margin: '10px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name="paymentMethod"
                value="Razorpay"
                checked={form.paymentMethod === "Razorpay"}
                onChange={handleChange}
                disabled={isProcessing}
              />
              Online Payment (Credit/Debit Card, UPI, NetBanking)
            </label>
          </div>
        </div>

        {/* RIGHT SIDE: Order Summary */}
        <div className="checkout-right">
          <h2>Order Summary</h2>
          <div className="items-list">
            {items.map((item) => (
              <div
                key={item.product._id + item.selectedSize}
                className="checkout-item"
              >
                <img
                  src={`http://localhost:5000/public/images/${item.product.image}`}
                  alt={item.product.name}
                />
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p>Size: {item.selectedSize || "N/A"}</p>
                  <p>Qty: {item.quantity}</p>
                  <p>Price: ₹{item.product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="price-breakup">
            <p>
              <span>Subtotal:</span> <span>₹{initialSubtotal.toFixed(2)}</span>
            </p>
            <p className={calculatedShippingFee === 0 ? "free-shipping" : ""}>
              <span>Shipping:</span>
              <span>
                {calculatedShippingFee === 0
                  ? "FREE (Above ₹5000)"
                  : `₹${calculatedShippingFee.toFixed(2)}`}
              </span>
            </p>
            <h3 className="grand-total">
              <span>Grand Total:</span> <span>₹{grandTotal.toFixed(2)}</span>
            </h3>
          </div>

          <button
            onClick={handleOrder}
            disabled={isProcessing || items.length === 0}
          >
            {isProcessing
              ? "Processing Order..."
              : `Place Order (₹${grandTotal.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
