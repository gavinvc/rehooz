import React, { useState } from "react";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    city: "",
    password: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isRegister
        ? "https://rehooz-app-491933218528.us-east4.run.app/backend/register.php"
        : "https://rehooz-app-491933218528.us-east4.run.app/backend/login.php";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.status === "success") {
      if (isRegister) {
        alert("Account created! You can log in now.");
        setIsRegister(false);
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Welcome back, " + data.user.username + "!");
        window.location.href = "/home";
      }
    } else {
      alert(data.message || "Error occurred");
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
