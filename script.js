import {
  FaceLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

const canvas = document.getElementById("output-canvas");
const ctx = canvas.getContext("2d");

const button = document.getElementById("kamera-ac");
const video = document.getElementById("camera");

let faceLandmarker;

console.log("MediaPipe indiçılgınlık");
button.addEventListener("click", async function () {

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    video.srcObject = stream;
    await video.play(); 

predictWebcam();

});
async function createFaceLandmarker() {

    console.log("1");

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    console.log("2");

   faceLandmarker = await FaceLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
            },
            runningMode: "VIDEO",
            numFaces: 1
        }
    );

    console.log("3");

    console.log(faceLandmarker);
}

createFaceLandmarker();

function predictWebcam() {
    function drawPoint(point, color) {

    ctx.beginPath();

    ctx.fillStyle = color;

    ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();
    }
    if (video.readyState < 2) {
    requestAnimationFrame(predictWebcam);
    return;
}
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

const results = faceLandmarker.detectForVideo(
    video,
    performance.now()
);
   

    console.log(results.faceLandmarks.length);
    if (results.faceLandmarks.length > 0) {

    const landmarks = results.faceLandmarks[0];
    drawPoint(landmarks[33], "lime");
drawPoint(landmarks[263], "cyan");
drawPoint(landmarks[1], "red");
drawPoint(landmarks[152], "yellow");

    for (const point of landmarks) {

        ctx.beginPath();

        ctx.arc(
            point.x * canvas.width,
            point.y * canvas.height,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}

    requestAnimationFrame(predictWebcam);

}