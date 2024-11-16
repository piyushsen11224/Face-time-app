const socket = io("/");
const videoGrid = document.getElementById("video-grid");
var myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    console.log("Incoming :", myVideoStream);
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
      console.log("Incoming call from:", call.peer);
      call.answer(stream); // Answer the call with the local stream
      call.on("stream", (userVideoStream) => {
        console.log("Adding stream to video tag", userVideoStream);
        addVideoStream(video, userVideoStream);
      });
    });

    console.log("Ankur");
    socket.on("user-connected", (userId) => {
      console.log("User connected:", userId);
      connectToNewUser(userId, stream);
    });
    // input value
    let text = $("input");
    // when press enter send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  })
  .catch((err) => {
    console.error("Failed to get media stream:", err);
  });
console.log(ROOM_ID);
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  console.log("Peer ID:", id);
  socket.emit("join-room", ROOM_ID, id);
});
function connectToNewUser(userId, stream) {
  console.log("Connecting to new user:", userId);

  var call = myPeer.call(userId, stream);
  console.log("call:", call);
  if (!call) {
    console.error("Call failed to initialize");
    return;
  }

  const video = document.createElement("video");
  call.answer(stream);
  console.log("Answering call with stream:", stream);
  addVideoStream(video, stream);
  console.log(userVideoStream);
  call.on("stream", (userVideoStream) => {
    console.log("Received stream from user:", userId, userVideoStream);
    addVideoStream(video, userVideoStream); // This should be triggered
  });
  video.remove();
  call.on("close", () => {
    console.log("Call with user closed:", userId);
    video.remove();
  });

  call.on("error", (err) => {
    console.error("Error in call:", err);
  });

  peers[userId] = call; // Track the call
}

function addVideoStream(video, stream) {
  console.log("Adding video stream:", stream); // Debugging

  if (!stream) {
    console.error("Stream is undefined or null");
    return;
  }

  // Check if videoGrid is available
  if (!videoGrid) {
    console.error("videoGrid element not found in the DOM.");
    return;
  }

  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    console.log("Video metadata loaded, playback started.");
  });

  videoGrid.append(video); // Append video to the grid
  console.log("Video added to grid:", videoGrid.innerHTML); // Debugging
}

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
