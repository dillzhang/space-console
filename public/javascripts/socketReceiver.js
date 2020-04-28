const baseURL = new URL(window.location.href).host;
var socket = io(baseURL);

socket.on("broadcast", (data) => {
    console.log(data);
})