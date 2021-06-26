//A lot of the code for painting is derived from this signal R example:
//https://github.com/aspnet/SignalR-samples/tree/master/WhiteBoard

const paintConnection = new signalR.HubConnectionBuilder()
    .withUrl("/paintHub")
    .build();

paintConnection.start();

paintConnection.on("paint", (previousX, previousY, x, y, color) => {
    drawCanvas(previousX, previousY, x, y, color);
});

paintConnection.on("clearCanvas", () => {
    clearCanvas();
});

const canvas = get("canvas");
const canvasContext = canvas.getContext("2d");

let canvasX = $(canvas).offset().left;
let canvasY = $(canvas).offset().top;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

$(canvas).on("mousedown", (clickEvent) => {
    let _x = parseInt(clickEvent.clientX - canvasX);
    let _y = parseInt(clickEvent.clientY - canvasY);

    lastMouseX = _x;
    mouseX = _x;
    lastMouseY = _y;
    mouseY = _y;

    isMouseDown = true;
});

$(canvas).on("mouseup", () => {
    isMouseDown = false;
});

function drawCanvas(previousX, previousY, x, y, color) {
    canvasContext.beginPath();

    canvasContext.globalCompositeOperation = "source-over";
    canvasContext.strokeStyle = color
    canvasContext.lineWidth = 5;
    canvasContext.moveTo(previousX, previousY);
    canvasContext.lineTo(x, y);
    canvasContext.lineJoin = canvasContext.lineCap = "round";

    canvasContext.stroke();
};

$(canvas).on("mousemove", (e) => {
    let color = $("select[id=colors]").val();

    mouseX = parseInt(e.clientX - canvasX);
    mouseY = parseInt(e.clientY - canvasY);

    if ((lastMouseX > 0 && lastMouseY > 0) && isMouseDown) {
        drawCanvas(mouseX, mouseY, lastMouseX, lastMouseY, color);
        paintConnection.invoke("Paint", lastMouseX, lastMouseY, mouseX, mouseY, color);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
});


function clearMousePositions() {
    lastMouseX = 0;
    lastMouseY = 0;
}

function clearCanvas() {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

get("clearCanvas").addEventListener("click", (event) => {
    event.preventDefault();

    paintConnection.invoke("ClearCanvas")
        .catch((err) => {
            return console.log(err.toString());
        });
});