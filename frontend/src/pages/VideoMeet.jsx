import io from "socket.io-client";
import React, { useState, useRef, useEffect } from "react";
import Styles from "../style/videoComponent.module.css";

import { TextField, Button, IconButton, colors, Badge } from "@mui/material";
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { Route, useNavigate } from "react-router-dom";
import server from "../environment";

const server_url = server;
var Connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeet() {
  var socketRef = useRef();
  var socketIdRef = useRef();

  let localVidioRef = useRef();
  let localStreamRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessagse] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    let videoOk = false;
    let audioOk = false;

    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoOk = true;
      camStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Camera permission error:", err.name, err.message);
    }
    setVideoAvailable(videoOk);

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioOk = true;
      micStream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Mic permission error:", err.name, err.message);
    }
    setAudioAvailable(audioOk);

    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

    if (videoOk || audioOk) {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoOk,
          audio: audioOk,
        });
        window.localStream = userMediaStream;
        localStreamRef.current = userMediaStream;
        if (localVidioRef.current) {
          localVidioRef.current.srcObject = userMediaStream;
        }
      } catch (err) {
        console.error("Final stream error:", err.name, err.message);
      }
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let blackSilence = (...args) => new MediaStream([black(...args), silence()]);

  // FIXED: doc7 ki working logic, localVidioRef aur Connections naming ke sath
 let getUserMediaSuccess = (stream) => {
    try {
        window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
        console.log(e);
    }

    window.localStream = stream;
    localStreamRef.current = stream;
    localVidioRef.current.srcObject = stream;

    const newVideoTrack = stream.getVideoTracks()[0];
    const newAudioTrack = stream.getAudioTracks()[0];

    for (let id in Connections) {
        if (id === socketIdRef.current) continue;

        let senders = Connections[id].getSenders();
        let videoSender = senders.find(s => s.track && s.track.kind === "video");
        let audioSender = senders.find(s => s.track && s.track.kind === "audio");

        if (videoSender && newVideoTrack) {
            videoSender.replaceTrack(newVideoTrack).catch(e => console.log(e));
        }
        if (audioSender && newAudioTrack) {
            audioSender.replaceTrack(newAudioTrack).catch(e => console.log(e));
        }

        // agar koi sender mila hi nahi (purani connection addStream se bani thi), fallback
        if (!videoSender && !audioSender) {
            Connections[id].addStream(stream);
            Connections[id].createOffer().then((description) => {
                Connections[id]
                    .setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit(
                            "signal",
                            id,
                            JSON.stringify({ sdp: Connections[id].localDescription })
                        );
                    })
                    .catch((e) => console.log(e));
            });
        }
    }
};

  // FIXED: localVideoref -> localVidioRef, aur condition video || audio
  let getUserMedia = () => {
    if (video || audio) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVidioRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }

      let blackSilenceStream = blackSilence();
      window.localStream = blackSilenceStream;
      localStreamRef.current = blackSilenceStream;
      localVidioRef.current.srcObject = blackSilenceStream;

      for (let id in Connections) {
        if (id === socketIdRef.current) continue;
        try {
          Connections[id].addStream(blackSilenceStream);
          Connections[id].createOffer().then((description) => {
            Connections[id]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: Connections[id].localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      console.log("My socket id:", socketIdRef.current);
    });

    socketRef.current.on("chat-message", addMessage);

    socketRef.current.on("user-left", (id) => {
      setVideos((videos) => videos.filter((video) => video.socketId !== id));
    });

    socketRef.current.on("user-joined", (id, clients) => {
      clients.forEach((socketListId) => {
        if (Connections[socketListId]) return;

        Connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

        Connections[socketListId].onicecandidate = (event) => {
          if (event.candidate != null) {
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({ ice: event.candidate })
            );
          }
        };

        Connections[socketListId].onaddstream = (event) => {
          console.log("Stream received from", socketListId);
          setVideos((videos) => {
            const videoExists = videos.find((v) => v.socketId === socketListId);
            let updatedVideos;
            if (videoExists) {
              updatedVideos = videos.map((v) =>
                v.socketId === socketListId ? { ...v, stream: event.stream } : v
              );
            } else {
              updatedVideos = [
                ...videos,
                {
                  socketId: socketListId,
                  stream: event.stream,
                  autoPlay: true,
                  playsinline: true,
                },
              ];
            }
            videoRef.current = updatedVideos;
            return updatedVideos;
          });
        };

        if (localStreamRef.current) {
          Connections[socketListId].addStream(localStreamRef.current);
        } else {
          window.localStream = blackSilence();
          localStreamRef.current = window.localStream;
          Connections[socketListId].addStream(window.localStream);
        }
      });

      if (id === socketIdRef.current) {
        for (let id2 in Connections) {
          if (id2 === socketIdRef.current) continue;

          try {
            Connections[id2].addStream(localStreamRef.current);
          } catch (e) {
            console.log(e);
          }

          Connections[id2].createOffer().then((description) => {
            Connections[id2]
              .setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: Connections[id2].localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        }
      }
    });
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        Connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              Connections[fromId]
                .createAnswer()
                .then((description) => {
                  Connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: Connections[fromId].localDescription,
                        })
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        Connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let routeTo= useNavigate();

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
    setAskForUsername(false);
  };

  let handleVideo = () => {
    setVideo(!video);
  }
  let handleAudio = () => {
    setAudio(!audio)
  }


let getDisplayMediaSuccess = (stream) => {
    console.log("HERE")
    try {
        window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) { console.log(e) }

    window.localStream = stream
    localStreamRef.current = stream
    localVidioRef.current.srcObject = stream

    const newVideoTrack = stream.getVideoTracks()[0];

    for (let id in Connections) {
        if (id === socketIdRef.current) continue

        let senders = Connections[id].getSenders();
        let videoSender = senders.find(s => s.track && s.track.kind === "video");

        if (videoSender && newVideoTrack) {
            // FIXED: replaceTrack use karo, koi naya offer/answer nahi chahiye
            videoSender.replaceTrack(newVideoTrack).catch(e => console.log(e));
        } else {
            // fallback agar sender na mile
            Connections[id].addStream(window.localStream)
            Connections[id].createOffer().then((description) => {
                Connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': Connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }
    }

    stream.getTracks().forEach(track => track.onended = () => {
        setScreen(false)

        try {
            let tracks = localVidioRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { console.log(e) }

        let blackSilenceStream = blackSilence()
        window.localStream = blackSilenceStream
        localStreamRef.current = blackSilenceStream
        localVidioRef.current.srcObject = blackSilenceStream

        getUserMedia()
    })
}
      let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }
     let handleEndCall = () => {
        try {
            let tracks = localVidioRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        routeTo("/home")
    }


  const addMessage = (data, sender, socketIdSender) => {
    setMessagse((prevMessages) => [
        ...prevMessages,
        { sender: sender, data: data, isSelf: socketIdSender === socketIdRef.current }
    ]);
    if (socketIdSender !== socketIdRef.current) {
        setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
};

     let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }
  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={getMedia}>
            Connect
          </Button>
          <div className={Styles.lobbyVideoBox}>
            <video
              className={Styles.lobbyVideo}
              ref={(ref) => {
                localVidioRef.current = ref;
                if (ref && localStreamRef.current) {
                  ref.srcObject = localStreamRef.current;
                }
              }}
              autoPlay
              muted
            ></video>
          </div>
        </div>
      ) : (
        <div className={Styles.meetVideoContainer}>

          {showModal ? <div className={Styles.chatRoom}>

    <div className={Styles.chatContainer}>
        <h1>Chat</h1>

        <div className={Styles.chattingDisplay}>

                       {messages.length !== 0 ? messages.map((item, index) => {
                return (
                    <div className={item.isSelf ? Styles.msgSelf : Styles.msgOther} key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                    </div>
                )
            }) : <p>No Messages Yet</p>}

        </div>

        <div className={Styles.chattingArea}>
            <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
            <Button variant='contained' onClick={sendMessage}>Send</Button>
        </div>

    </div>
</div> : <></>}
                    


          <div className={Styles.buttonContainers}>
            <IconButton onClick={handleVideo}>
              {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ?
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton> : <></>}

            <Badge badgeContent={newMessages} max={999} color='secondary'>
              <IconButton onClick={()=> setShowModel(!showModal)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>

          </div>
          <video
            className={Styles.meetUserVideo}
            ref={(ref) => {
              localVidioRef.current = ref;
              if (ref && localStreamRef.current) {
                ref.srcObject = localStreamRef.current;
              }
            }}
            autoPlay
            muted
          ></video>
          <div className={Styles.conferenceView}>
  {videos.map((video) => (
    <div className={Styles.videoTile} key={video.socketId}>
      <video
        className={Styles.remoteVideo}
        data-socket={video.socketId}
        ref={(ref) => {
          if (ref && video.stream) {
            ref.srcObject = video.stream;
          }
        }}
        autoPlay
      ></video>
    </div>
  ))}
</div>
        </div>
      )}
    </div>
  );
}