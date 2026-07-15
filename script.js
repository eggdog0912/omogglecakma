import {
    FaceLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

// =========================
// LANDMARK GRUPLARI
// =========================

const LEFT_EYE = [
    33, 7, 163, 144, 145, 153, 154, 155,
    133, 173, 157, 158, 159, 160, 161, 246
];

const RIGHT_EYE = [
    263, 249, 390, 373, 374, 380, 381, 382,
    362, 398, 384, 385, 386, 387, 388, 466
];

const FACE_OVAL = [
    [10, 338],
    [338, 297],
    [297, 332],
    [332, 284],
    [284, 251],
    [251, 389],
    [389, 356],
    [356, 454],
    [454, 323],
    [323, 361],
    [361, 288],
    [288, 397],
    [397, 365],
    [365, 379],
    [379, 378],
    [378, 400],
    [400, 377],
    [377, 152],
    [152, 148],
    [148, 176],
    [176, 149],
    [149, 150],
    [150, 136],
    [136, 172],
    [172, 58],
    [58, 132],
    [132, 93],
    [93, 234],
    [234, 127],
    [127, 162],
    [162, 21],
    [21, 54],
    [54, 103],
    [103, 67],
    [67, 109],
    [109, 10]
];

// =========================
// HTML ELEMANLARI
// =========================

const canvas = document.getElementById("output-canvas");
const ctx = canvas.getContext("2d");

const button = document.getElementById("kamera-ac");
const video = document.getElementById("camera");
const closeButton = document.getElementById("camera-close");

// =========================
// DEĞİŞKENLER
// =========================

let faceLandmarker;

// =========================
// BUTONLAR
// =========================

button.addEventListener("click", async function () {

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    video.srcObject = stream;

    await video.play();

    predictWebcam();

});

closeButton.addEventListener("click", function () {

    if (!video.srcObject) return;

    const tracks = video.srcObject.getTracks();

    tracks.forEach(track => track.stop());

    video.srcObject = null;

});

// =========================
// MEDIAPIPE KURULUMU
// =========================

async function createFaceLandmarker() {

    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

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

    console.log("FaceLandmarker hazır!");

}

createFaceLandmarker();

// =========================
// ÇİZİM FONKSİYONLARI
// =========================

function drawPoint(point, color, size = 8) {

  

    ctx.beginPath();

    ctx.fillStyle = color;

    ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        size,
        0,
        Math.PI * 2
    );

    ctx.fill();

}
  function drawLine(point1, point2, color) {

    ctx.beginPath();

    ctx.strokeStyle = color;

    ctx.lineWidth = 2;

    ctx.moveTo(
        point1.x * canvas.width,
        point1.y * canvas.height
    );

    ctx.lineTo(
        point2.x * canvas.width,
        point2.y * canvas.height
    );

    ctx.stroke();

}
function drawConnections(landmarks, connections, color) {

    for (const connection of connections) {

        const start = landmarks[connection[0]];
        const end = landmarks[connection[1]];

        drawLine(start, end, color);

    }

}

function drawLandmarkGroup(landmarks, indices, color) {

    for (const index of indices) {

        const point = landmarks[index];

        if (!point) continue;

        drawPoint(point, color);

    }

}

// =========================
// MATEMATİK
// =========================

function distance(point1, point2) {

    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    return Math.sqrt(dx * dx + dy * dy);

}

// =========================
// ANA DÖNGÜ
// =========================

function predictWebcam() {

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

    if (results.faceLandmarks.length > 0) {

        const landmarks = results.faceLandmarks[0];
        drawLine(
    landmarks[33],
    landmarks[263],
    "red"
);
  

        // Gözleri renklendir
            for (const point of landmarks) {

            drawPoint(point, "white", 2);

        }

        drawLandmarkGroup(landmarks, LEFT_EYE, "lime");
        drawLandmarkGroup(landmarks, RIGHT_EYE, "cyan");
        drawConnections(landmarks, FACE_OVAL, "orange");

        // İstersen bütün landmarkları da gösterebilirsin


        // İlk ölçüm

        const eyeDistance = distance(
            landmarks[33],
            landmarks[263]
        );

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";

        ctx.fillText(
            "Eye Distance: " + eyeDistance.toFixed(3),
            20,
            40
        );

    }

    requestAnimationFrame(predictWebcam);

}