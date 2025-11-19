import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Backend base URL (Cloud Run service)
const API_BASE_URL =
  "https://rehooz-app-491933218528.us-east4.run.app/backend";

export default function Login({ setUser }) {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    city: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister
      ? `${API_BASE_URL}/register.php`
      : `${API_BASE_URL}/login.php`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error response:", text);
        alert("Server error while contacting backend.");
        return;
      }

      const data = await res.json();

      if (data.status === "success") {
        if (isRegister) {
          alert("Account created! You can log in now.");
          setIsRegister(false);
        } else {
          // Save to localStorage AND update App state
          localStorage.setItem("user", JSON.stringify(data.user));
          if (setUser) {
            setUser(data.user);
          }

          alert("Welcome back, " + data.user.username + "!");
          navigate("/home");
        }
      } else {
        alert(data.message || "Error occurred");
      }
    } catch (err) {
      console.error("Network / parse error:", err);
      alert("Network error contacting backend.");
    }
  };

  return (
    <div className="App-body">
      <h2>{isRegister ? "Create an Account" : "Login to Rehooz"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        {isRegister && (
          <>
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
            />
          </>
        )}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" style={{ marginTop: "10px" }}>
          {isRegister ? "Sign Up" : "Login"}
        </button>
      </form>

      <p style={{ marginTop: "15px" }}>
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{
            background: "none",
            color: "#2196F3",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </div>
  );
}
