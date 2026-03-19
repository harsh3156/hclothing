import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`
    };

    await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmationEmail = async (email, orderDetails) => {
    const { orderId, items, totalAmount, address, paymentMethod, estimatedDelivery } = orderDetails;

    // Build the items table rows
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>
    `).join("");

    const mailOptions = {
        from: `"H Clothing" <${process.env.GMAIL_EMAIL}>`,
        to: email,
        subject: `Order Confirmed! Order ID: #${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #28a745;">Order Confirmed! ✅</h2>
                    <p style="color: #555;">Thank you for shopping with us. Your order has been successfully placed.</p>
                </div>

                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> #${orderId}</p>
                    <p><strong>Payment Method:</strong> ${paymentMethod || "COD"}</p>
                    ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>` : ""}
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #eee;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="text-align: right; font-size: 18px; font-weight: bold; margin-bottom: 20px;">
                    Total Amount: ₹${totalAmount}
                </div>

                <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #555;">
                    <p><strong>Shipping Address:</strong></p>
                    <p>${address.name}<br>${address.street}, ${address.city}<br>${address.state}, ${address.pinCode}<br>Phone: ${address.phone}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}/orders" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
                </div>

                <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #888;">
                    <p>Need help? Contact our support at support@ecommerce.com</p>
                    <p>&copy; ${new Date().getFullYear()} Ecommerce Store. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
        console.error("Failed to send order confirmation email:", error);
        // We don't throw error here to avoid breaking the order flow
    }
};