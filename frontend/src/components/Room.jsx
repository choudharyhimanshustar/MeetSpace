import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../Service/peer";
import { useSocket } from "../Context/SocketProvider";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { PiPhoneDisconnectLight } from "react-icons/pi";
import { CiMicrophoneOff } from "react-icons/ci";
import { IoMicOutline } from "react-icons/io5";
import { GoDeviceCameraVideo } from "react-icons/go";
import { BsCameraVideoOff } from "react-icons/bs";

import './Room.css'

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [isCalling, setIsCalling] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [remoteStreamVideoEnabled, setRemoteStreamVideoEnabled] = useState(true);
    const [remoteStreamAudioEnabled, setRemoteStreamAudioEnabled] = useState(true);
  

    const { roomId } = useParams();
    const navigate = useNavigate();
   
    let stream = "";

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setRemoteSocketId(id);
    }, []);

    const openCam = useCallback(async () => {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        setMyStream(stream);
    }, []);
    const handleCallUser = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setIsCalling(true);
    }, [remoteSocketId, socket]);

    const handleIncommingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            console.log(`Incoming Call`, from, offer);
            const ans = await peer.getAnswer(offer);
            socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            peer.setLocalDescription(ans);
            console.log("Call Accepted!");
            sendStreams();
        },
        [sendStreams]
    );

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
            const ans = await peer.getAnswer(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );
    const toggleVideo = async () => {
        if (myStream) {
            console.log(myStream)
            const videoTrack = myStream.getVideoTracks()[0];
            console.log(videoTrack);
            setIsVideoEnabled((prevState) => {
                const newState = !prevState;
                videoTrack.enabled = newState;  // Update the video track based on new state
                return newState;
            });
            socket.emit("video:toggle", {
                to: remoteSocketId,
                isVideoEnabled: videoTrack.enabled,
            });
        }
    };

    const toggleAudio = async () => {
        if (myStream) {
            const audioTrack = myStream.getAudioTracks()[0];
            setIsAudioEnabled((prevState) => {
                const newState = !prevState;
                audioTrack.enabled = newState;  // Update the audio track based on new state
                return newState;
            });
            socket.emit("audio:toggle", {
                to: remoteSocketId,
                isAudioEnabled: audioTrack.enabled,
            });
        }
    };
    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);
    function CallDisconnect() {

        // Stop all tracks in myStream  
        if (myStream) {
            myStream.getTracks().forEach((track) => track.stop());
            setMyStream(null);
            console.log(myStream);
        }

        // Stop all tracks in remoteStream
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            setRemoteStream(null);
        }

        navigate('/');
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);

    useEffect(() => {
        openCam();
        socket.on("user:joined", handleUserJoined);
        socket.on("incomming:call", handleIncommingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        socket.on("call:disconnected", CallDisconnect);
        socket.on("video:toggle", ({ isVideoEnabled }) => {
            // Set a local state for the remote peer's video status
            console.log("This is for toggle video");

            setRemoteStreamVideoEnabled(!remoteStreamVideoEnabled); // Add this new state
        });
        socket.on("audio:toggle", ({ isAudioEnabled }) => {
            // Set a local state for the remote peer's audio status
            setRemoteStreamAudioEnabled(!remoteStreamAudioEnabled); // Add this new state
        });
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incomming:call", handleIncommingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
            socket.off("call:disconnected", CallDisconnect);
            socket.off("video:toggle");
            socket.off("audio:toggle");
        };
    }, [
        socket,
        handleUserJoined,
        handleIncommingCall,
        handleCallAccepted,
        handleNegoNeedIncomming,
        handleNegoNeedFinal,
    ]);


    function disconnectCall() {

        // Stop all tracks in myStream
        if (myStream) {
            myStream.getTracks().forEach((track) => track.stop());
            setMyStream(null);
            console.log(myStream);
        }

        // Stop all tracks in remoteStream
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            setRemoteStream(null);
        }
        socket.emit("call:disconnected", ({ to: remoteSocketId }));
        navigate('/');
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }

    return (
        <div className="RoomPageCSS">
            {!isCalling && (<><h1>Room Page</h1>
                <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
                <p>This is your joining code:<b>{roomId}</b></p>
                {/*  {myStream && <button onClick={sendStreams}>Send Stream</button>} */}
                {remoteSocketId && <button onClick={handleCallUser}
                    className="CallBtnCSS">CALL</button>}</>
            )}

            <div className="videoCallDiv">
                {myStream && (
                    <>
                        {isVideoEnabled && (
                            <ReactPlayer
                                playing
                                muted
                                url={myStream}
                                width="15%"
                                height="15%"
                                style={{
                                    position: "relative",
                                    left: "82%",
                                }}
                            />
                        )}
                        <div className="DisconnectCall">
                            <button
                                onClick={disconnectCall}><PiPhoneDisconnectLight /></button>
                            <button onClick={toggleVideo} >
                                {isVideoEnabled ? <BsCameraVideoOff /> : <GoDeviceCameraVideo />}
                            </button>
                            <button onClick={toggleAudio} >
                                {isAudioEnabled ? <CiMicrophoneOff /> : <IoMicOutline />}
                            </button>
                            
                        </div>
                        
                    </>
                )}
                {remoteStream && remoteStreamVideoEnabled && (
                    <ReactPlayer
                        playing
                        muted={!remoteStreamAudioEnabled}
                        url={remoteStream}
                        width="60%"
                        height="60%"
                        style={{
                            position: "relative",
                            right: "5%",
                        }}
                    />
                )}



            </div>

        </div>
    );
};

export default RoomPage;
