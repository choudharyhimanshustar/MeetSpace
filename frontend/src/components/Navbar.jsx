import React from "react";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "react-router-dom";
export default function Navbar() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentTime = new Date().toLocaleString('en-US', options);
    const navigate=useNavigate();
    console.log(currentTime);
    function handleClick() {
        localStorage.removeItem('token');
        navigate('/login');
    }
    return (<div className="NavbarCSS">
        <h3>MeetSpace</h3>
        <div>
            <h3>{currentTime}</h3>
            <button className="logOutCss" onClick={handleClick}><IoMdLogOut /></button>
        </div>

    </div>)
}