import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUP.css'
export default function SignUP() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const handleSignUP = async () => {
        try {
            const response = await
                axios.post(`${process.env.REACT_APP_BACKEND_URL}/SignUP`, {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: password
                })
            const data = response.data;
            if (data.error) {
                console.log(data.error);
            }
            else {
                console.log(data.user._id);
                console.log("User Registered Successfully");
                navigate('/login');
            }
        } catch (err) {
            console.log(err);
        }
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
                    placeholder="Enter Email" />
                <label>Enter First Name</label>
                <input
                    type="text"
                    placeholder="Enter First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} />

                <label>Enter Last Name</label>
                <input
                    type="text"
                    placeholder="Enter Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)} />

                <label>Password</label>
                <input
                    type="text"
                    required="true"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password" />
            </form>
            <div className="SignUpbtn">
                <button onClick={() => handleSignUP()} >SignUp</button>
            </div>

        </div >
    )
}