import { useState,useCallback,useEffect } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../Context/SocketProvider";
export default function Temp() {
    const [roomID, setroomID] = useState();
    const navigate=useNavigate();
    const socket = useSocket();
    function isExpired(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (payload.exp * 1000) < Date.now();
    }
    const handleClick = async () => {
        const token = await localStorage.getItem('token');
        console.log(token);
        if (token === null || isExpired(token)) {
            navigate('/login');
        }
        try {
            const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
            const email = decoded.email;
            const response = await
                axios.get(`${process.env.REACT_APP_BACKEND_URL}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true,  // Ensures cookies/auth headers are sent with the request
                });
            console.log(response);
            socket.emit("room:join", { email, roomID });
        } catch (error) {
            if (error) {
                console.log(error);
                navigate('/login');
            }
        }
    }
    const handleJoinRoom = useCallback(
        (data) => {
            const { email, roomID } = data;
            navigate(`/room/${roomID}`);
        },
        [navigate]
    );

    useEffect(() => {
        socket.on("room:join", handleJoinRoom);
        return () => {
            socket.off("room:join", handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);
    return (
        <div className="Login">
            <form className="LoginForm">
                <label>Enter Code</label>
                <input
                    type="text"
                    required="true"
                    value={roomID}
                    onChange={(e) => setroomID(e.target.value)}
                    placeholder="Enter RoomID" />


            </form>
            <div className="SignUpbtn">
                <button onClick={() => handleClick()}>Join Call</button>
            </div>
        </div>
    )
}