const baseURL = new URL(window.location.href).host;
var socket = io(baseURL);

const checkBox = (id) => {
    const box = document.getElementById(`checkbox${id}`);
    const checked = box.checked;
    socket.emit("input", {device: "checkbox", id, value: checked});
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