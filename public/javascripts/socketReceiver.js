const baseURL = new URL(window.location.href).host;
var socket = io(baseURL);

const logger = document.getElementById("log");

socket.on("broadcast", (data) => {
    console.log(data);
    var node = document.createElement("LI"); 
    var textnode = document.createTextNode(JSON.stringify(data));
    node.appendChild(textnode);
    logger.appendChild(node);
})