import React, { useCallback, useEffect } from "react";
import Navbar from "./Navbar";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../Context/SocketProvider";
import { nanoid } from "nanoid";

export default function Home() {
  const navigate = useNavigate();
  const roomID = nanoid(6);
  const socket = useSocket();

  const newCall = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) {
        console.error("Backend URL is not defined.");
        return;
      }

      const response = await axios.get(`${backendUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const email = response.data.email; // Assuming email is returned from the backend
      socket.emit("room:join", { email, roomID });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access. Redirecting to login.");
        navigate("/login");
      } else {
        console.error("An error occurred:", error.message);
      }
    }
  };

  const joinCall = () => {
    navigate("/temp");
  };

  const handleJoinRoom = useCallback(
    (data) => {
      const { roomID } = data;
      navigate(`/room/${roomID}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="HomeCSS">
      <Navbar />
      <div className="HomeSubCSS">
        <div className="HomeBtnCSS">
          <h2>MeetSpace</h2>
          <b>Video Calls for Everyone</b>
          <button onClick={newCall}>
            <b>New Call</b>
          </button>
          <button onClick={joinCall}>
            <b>Join with Code</b>
          </button>
        </div>
        <img
          src="https://i.pinimg.com/originals/fa/d7/81/fad78147db700c8e1c47efb0ac586fcb.gif"
          className="bannerImg"
          alt="Banner for MeetSpace"
        />
      </div>
    </div>
  );
}
