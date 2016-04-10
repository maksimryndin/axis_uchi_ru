//Parameters
var quizCanvas = document.querySelector("#quiz");
var container = document.querySelector("#quiz_container");
var cx = quizCanvas.getContext("2d");
var scale = quizCanvas.width / 875;
var quizCanvasHeight = 0.5 * quizCanvas.width;
quizCanvas.height = quizCanvasHeight;
var imgWidth = quizCanvas.width;
var imgHeight = 83 * scale;
var inputWidth = 19; //width of input in px
var step = 38.8 * scale; //unit on sprite
var xRulerStart = 35 * scale; //x-coordinate of number line
var yRulerStart = quizCanvasHeight - 63 * scale; //y-coordinate of number line
var fontSize = 30 * scale; //font size in px
var xText = quizCanvas.width / 2;
var yText = 10;
cx.font = String(fontSize) + "px" + " Arial";
cx.textAlign = "center";
cx.textBaseline = "top";
cx.fillStyle = "black";
cx.strokeStyle = "magenta";
var img = document.createElement("img");
img.src = "sprite.png";


function createQuiz(a, b) {
    img.addEventListener("load", function() {
           cx.drawImage(img, 0, quizCanvasHeight - imgHeight, imgWidth, imgHeight);
           Quiz(a, b);
        })
};


function Quiz(a, b) {
    var quizText = a + " + " + b + " = ?";

    var sum1 = new Summand(cx, a, xRulerStart);
    cx.fillText(quizText, quizCanvas.width / 2, 10);

    sum1.summandInput.addEventListener("input", function(){
        var firstAnswer = sum1.checkAnswer(sum1.summandInput.value, a, quizText, quizCanvas.width / 2 - 63 * scale);
        if (firstAnswer) {
            var sum2 = new Summand(cx, b, sum1.xEnd);
            sum2.summandInput.addEventListener("input", function(){
                var secondAnswer = sum2.checkAnswer(sum2.summandInput.value, b, quizText, quizCanvas.width / 2 - 12 * scale);
                if (secondAnswer) {
                    quizText = a + " + " + b + " =";
                    checkResult(cx, quizText, a, b);
                }
            });
        }
    });
}


function createArrow(xHead, yHead, parentAngle, angle, size) {
    var hypotenuse = size * Math.abs(Math.cos(angle)); //Length of arrow tails
    var angle1 = (parentAngle + Math.PI - angle);
    var angle2 = (parentAngle + Math.PI + angle);
    var xLeftTail = xHead + hypotenuse * Math.cos(angle1);
    var yLeftTail = yHead + hypotenuse * Math.sin(angle1);
    var xRightTail = xHead + hypotenuse * Math.cos(angle2);
    var yRightTail = yHead + hypotenuse * Math.sin(angle2);

    return {xLeftTail: xLeftTail, yLeftTail: yLeftTail,
            xRightTail: xRightTail, yRightTail: yRightTail};
}


function createArrowedArc(context, xStart, xEnd, xControl, xDistance, yStart, yControl) {
    var parentAngle = Math.atan2(yStart - yControl, xEnd - xControl);
    var arrow = createArrow(xEnd, yStart, parentAngle, Math.PI/8, 10);

    context.beginPath();
    context.moveTo(xStart,yStart);
    context.moveTo(xStart, yStart);
    context.quadraticCurveTo(xControl, yControl, xEnd, yStart);
    context.lineTo(arrow.xLeftTail, arrow.yLeftTail);
    context.moveTo(arrow.xRightTail, arrow.yRightTail);
    context.lineTo(xEnd, yStart);
    context.stroke();
    context.closePath();

}


function InputOnCanvas(x, y) {
    this.input = document.createElement("input");
    this.input.x = x;
    this.input.y = y;
    this.input.type = "text";
    this.input.style.position = "absolute";
    this.input.style.left = x + "px";
    this.input.style.top = y + "px";
    this.input.style.width = String(inputWidth) + "px";
    container.appendChild(this.input);
}


function Summand(context, number, xStart) {
    this.context = context;
    this.xStart = xStart;
    this.xDistance = number * step;
    this.xControl = xStart + this.xDistance / 2;
    this.xEnd = xStart + this.xDistance;
    this.yControl = yRulerStart - this.xDistance * 0.5;

    var x = this.xControl -  (inputWidth)/2 - 3 * scale // 3*scale is a visual correction
    var y = 0.5 * yRulerStart + 0.5 * this.yControl - 2 * inputWidth; //Top point of quadratic Bezier curve
    var inp = new InputOnCanvas(x, y);
    this.summandInput = inp.input;
    this.draw();
}


Summand.prototype.draw = function() {
    createArrowedArc(this.context, this.xStart, this.xEnd, this.xControl,
                     this.xDistance, yRulerStart, this.yControl);

    this.summandInput.focus();

}


Summand.prototype.checkAnswer = function (userInput, rightAnswer, quizText, numPos) {
    this.context.clearRect(0, 0, quizCanvas.width, yText + fontSize);
    if ((Number(userInput) == rightAnswer)) {
        this.context.fillStyle="black";
        this.summandInput.style.display = "none";
        this.context.fillText(rightAnswer,
            this.summandInput.x + fontSize / 2, this.summandInput.y);
    } else {
        this.context.fillStyle="orange";
        this.context.fillRect(numPos, yText -  0.1 * fontSize, fontSize * 0.8, 1.1 * fontSize); //Constants are added for visual correction
        this.context.fillStyle="black";
    }
    this.context.fillText(quizText, xText, yText);
    return Number(userInput) == rightAnswer;
}


function checkResult(context, quizText, a, b) {
    context.clearRect(0, 0, quizCanvas.width, yText + fontSize);
    context.fillText(quizText, xText, yText);
    var resultInputObj = new InputOnCanvas(xText + 50 * scale, yText * scale);
    var resultInputElement = resultInputObj.input;
    resultInputElement.focus();
    resultInputElement.addEventListener("input", function() {
        var userInput = resultInputElement.value;
        if ((Number(userInput) == a + b)) {
            resultInputElement.style.display = "none";
            context.clearRect(0, 0, quizCanvas.width, yText + fontSize);
            context.fillStyle="black";
            context.fillText(quizText + ' ' + userInput,
                xText, yText);
        } else {
            resultInputElement.style.color="red";
            context.fillStyle="black";
        };
    });
}
