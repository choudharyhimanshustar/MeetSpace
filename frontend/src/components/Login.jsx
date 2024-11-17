import { useState } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_BACKEND_URL;
export default function Login() {
  const [email, setEmail] = useState("himanshuch3003@gmail.com");
  const [password, setPassword] = useState("123");
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      if (!BASE_URL) alert("Backend URL not set");
      const response = await axios.post(
        `http://localhost:5000/login`,
        { email: email, password: password },
        { withCredentials: true }
      );
      const data = response.data;

      if (data.error) {
        alert(data.error);
      } else {
        localStorage.setItem("token", data.token);
        console.log("User Login Successfully");
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  function handleSignUP() {
    console.log("SignUP btn clicked");
    navigate("/SignUP");
  }

  return (
    <div className="Login">
      <form className="LoginForm">
        <label>Email</label>
        <input
          type="email"
          required={true}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email"
        />

        <label>Password</label>
        <input
          type="password"
          required={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
        />
      </form>
      <div className="buttonCSS">
        <button onClick={handleClick}>Login</button>
        <button onClick={handleSignUP}>SignUp</button>
      </div>
    </div>
  );
}
