// Lấy các phần tử cần thiết từ DOM
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Cài đặt sự kiện khi video play
video.addEventListener('play', function() {
    // Xác định kích thước của video
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Thiết lập kích thước của canvas để phù hợp với video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Sử dụng requestAnimationFrame để vẽ hình ảnh liên tục từ video lên canvas
    function drawFrame() {
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        // Lấy hình ảnh của frame hiện tại từ canvas
        const frameData = ctx.getImageData(0, 0, videoWidth, videoHeight);

        // Hiển thị hình ảnh biên cạnh của frame
        const edgeImageData = detectEdges(frameData);

        // Vẽ hình ảnh biên cạnh lên canvas
        ctx.putImageData(edgeImageData, 0, 0);

        // Lặp lại với frame tiếp theo
        requestAnimationFrame(drawFrame);
    }

    // Bắt đầu vẽ frame
    drawFrame();
});

// Hàm detectEdges() để xác định hình ảnh biên cạnh của frame
function detectEdges(frameData) {
    const threshold = 50; // Ngưỡng để xác định biên cạnh

    // Ma trận phép chập Sobel cho phát hiện biên cạnh theo chiều ngang
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    // Ma trận phép chập Sobel cho phát hiện biên cạnh theo chiều dọc
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    const width = frameData.width;
    const height = frameData.height;
    const data = frameData.data;

    const resultData = new Uint8ClampedArray(data.length);

    // Lặp qua từng pixel trong frame
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sumX = 0;
            let sumY = 0;

            // Áp dụng phép chập Sobel cho từng pixel
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixelIndex = ((y + i) * width + (x + j)) * 4;
                    const weightX = sobelX[i + 1][j + 1];
                    const weightY = sobelY[i + 1][j + 1];

                    sumX += weightX * data[pixelIndex];
                    sumY += weightY * data[pixelIndex];
                }
            }

            // Tính toán gradient và kiểm tra ngưỡng để xác định biên cạnh
            const gradientMagnitude = Math.sqrt(sumX * sumX + sumY * sumY);
            const edgeValue = gradientMagnitude > threshold ? 255 : 0;

            // Gán giá trị biên cạnh cho pixel tương ứng
            const pixelIndex = (y * width + x) * 4;
            resultData[pixelIndex] = edgeValue; // red
            resultData[pixelIndex + 1] = edgeValue; // green
            resultData[pixelIndex + 2] = edgeValue; // blue
            resultData[pixelIndex + 3] = 255; // alpha (không trong suốt)
        }
    }

    // Tạo ImageData mới từ dữ liệu biên cạnh đã tính toán
    return new ImageData(resultData, width, height);
}

// Xử lý sự kiện khi video tạm dừng
video.addEventListener('pause', function() {
    console.log('Video is paused');
    // Hiển thị thông báo
    var pauseMessage = document.getElementById('pauseMessage');
    pauseMessage.style.display = "block";
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(function() {
        pauseMessage.style.display = "none";
    }, 3000);
});

// Xử lý sự kiện khi thời gian của video thay đổi
video.addEventListener('timeupdate', function() {
    console.log('Current time: ' + video.currentTime);
    drawImageOnCanvas();
});

// Phát video
function playVideo() {
    video.play();
}

// Tạm dừng video
function pauseVideo() {
    video.pause();
}

// Bắt đầu từ đầu video
function restartVideo() {
    video.currentTime = 0;
}

// Đợi video được tải xong
video.onloadeddata = function() {
    console.log('Video is loaded');
};