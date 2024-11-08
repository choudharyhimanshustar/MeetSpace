import React, { useCallback, useEffect } from 'react'
import Navbar from './Navbar'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useSocket } from "../Context/SocketProvider";
import { nanoid } from 'nanoid';

export default function Home() {
    const navigate = useNavigate();
    const roomID = nanoid(6);
    const socket = useSocket();
    function isExpired(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (payload.exp * 1000) < Date.now();
    }
    const newCall = async () => {
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
            socket.emit("room:join", { email, roomID });
        } catch (error) {
            if (error) {
                console.log(error);
                navigate('/login');
            }
        }
    }

    const joinCall = async () => {
        navigate('/temp');
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

    return (<div className='HomeCSS'>
        <Navbar />
        <div className='HomeSubCSS'>
            <div className='HomeBtnCSS'>
                <h2>MeetSpace</h2>
                <b>Video Calls for Everyone</b>
                <button onClick={() => newCall()}><b>New Call</b></button>
                <button onClick={() => joinCall()}><b>Join with Code</b></button>
            </div>
            <img src="https://i.pinimg.com/originals/fa/d7/81/fad78147db700c8e1c47efb0ac586fcb.gif" className='bannerImg' />
        </div>
    </div>)
}
