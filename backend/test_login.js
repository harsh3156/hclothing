import axios from "axios";

const testLogin = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/users/login", {
            email: "h1@gmail.com",
            password: "admin123"
        });
        console.log("Login Success:", response.data);
    } catch (err) {
        console.log("Login Failed:", err.response ? err.response.data : err.message);
    }
};

// I don't know the password. Let me reset it first.
testLogin();
