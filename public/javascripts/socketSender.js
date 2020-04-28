const baseURL = new URL(window.location.href).host;
var socket = io(baseURL);

const buttonPush = (id) => {
    socket.emit("input", {device: "button", id, value: 1})
}

const sliderUpdate = (id) => {
    const range = document.getElementById(`range${id}`);
    const rangeValue = range.value;
    const value = document.getElementById(`value${id}`);
    value.innerHTML = rangeValue;

    socket.emit("input", {device: "slider", id, value: rangeValue})
}

const sendData = (data) => {
    socket.emit("input", data);
}

const clicker = () => {
    console.log("clicked");
    sendData("I've been clicked");
}