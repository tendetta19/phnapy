// script.js
const rows = 4; // Number of rows
const cols = 6; // Number of columns
const container = document.getElementById('puzzle-container');
const imageSrc = 'image.jpg'; // Path to your image

// Load the image
const img = new Image();
img.src = imageSrc;
img.onload = () => {
    const originalWidth = img.width;
    const originalHeight = img.height;

    // Adjust container padding-bottom to maintain aspect ratio
    const aspectRatio = (originalHeight / originalWidth) * 100;
    container.style.paddingBottom = aspectRatio + '%';

    // Create pieces
    const pieceWidth = 100 / cols; // Percentage width
    const pieceHeight = 100 / rows; // Percentage height
    let pieces = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const piece = document.createElement('div');
            piece.classList.add('piece');
            piece.style.width = pieceWidth + '%';
            piece.style.height = pieceHeight + '%';

            // Set background image and position
            piece.style.backgroundImage = `url(${imageSrc})`;
            piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
            piece.style.backgroundPosition = `${(-x * 100) / (cols - 1)}% ${(-y * 100) / (rows - 1)}%`;

            piece.dataset.correctX = x;
            piece.dataset.correctY = y;

            pieces.push(piece);
        }
    }

    // Shuffle and place pieces randomly
    pieces = shuffleArray(pieces);
    pieces.forEach(piece => {
        container.appendChild(piece);
        randomizePosition(piece);
        enableDrag(piece);
    });
};

// Shuffle function
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Randomize position of pieces within the container
function randomizePosition(piece) {
    const containerRect = container.getBoundingClientRect();

    const pieceWidth = containerRect.width / cols;
    const pieceHeight = containerRect.height / rows;

    const maxLeft = containerRect.width - pieceWidth;
    const maxTop = containerRect.height - pieceHeight;

    const left = Math.random() * maxLeft;
    const top = Math.random() * maxTop;

    piece.style.left = left + 'px';
    piece.style.top = top + 'px';
}

// Enable drag-and-drop
function enableDrag(element) {
    let offsetX, offsetY;
    let initialX, initialY;

    const onMouseDown = (e) => {
        e.preventDefault();
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        initialX = parseFloat(element.style.left);
        initialY = parseFloat(element.style.top);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        const containerRect = container.getBoundingClientRect();

        let left = e.clientX - containerRect.left - offsetX;
        let top = e.clientY - containerRect.top - offsetY;

        // Keep within bounds
        left = Math.max(0, Math.min(left, containerRect.width - element.offsetWidth));
        top = Math.max(0, Math.min(top, containerRect.height - element.offsetHeight));

        element.style.left = left + 'px';
        element.style.top = top + 'px';
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        checkPiecePosition(element);
    };

    element.addEventListener('mousedown', onMouseDown);

    // Touch events for mobile support
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;

        initialX = parseFloat(element.style.left);
        initialY = parseFloat(element.style.top);

        document.addEventListener('touchmove', onTouchMove);
        document.addEventListener('touchend', onTouchEnd);
    });

    const onTouchMove = (e) => {
        const touch = e.touches[0];
        const containerRect = container.getBoundingClientRect();

        let left = touch.clientX - containerRect.left - offsetX;
        let top = touch.clientY - containerRect.top - offsetY;

        // Keep within bounds
        left = Math.max(0, Math.min(left, containerRect.width - element.offsetWidth));
        top = Math.max(0, Math.min(top, containerRect.height - element.offsetHeight));

        element.style.left = left + 'px';
        element.style.top = top + 'px';
    };

    const onTouchEnd = () => {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        checkPiecePosition(element);
    };
}

// Check if the piece is in the correct position
function checkPiecePosition(piece) {
    const containerRect = container.getBoundingClientRect();
    const pieceWidth = containerRect.width / cols;
    const pieceHeight = containerRect.height / rows;

    const currentX = parseFloat(piece.style.left);
    const currentY = parseFloat(piece.style.top);

    const correctX = piece.dataset.correctX * pieceWidth;
    const correctY = piece.dataset.correctY * pieceHeight;

    const tolerance = pieceWidth * 0.1; // 10% of piece width

    if (Math.abs(currentX - correctX) < tolerance && Math.abs(currentY - correctY) < tolerance) {
        piece.style.left = correctX + 'px';
        piece.style.top = correctY + 'px';
        piece.removeEventListener('mousedown', enableDrag);
        piece.removeEventListener('touchstart', enableDrag);
        piece.style.cursor = 'default';
        piece.style.zIndex = 0; // Lower z-index when placed
        checkWinCondition();
    }
}

// Check if all pieces are in the correct position
function checkWinCondition() {
    const pieces = document.querySelectorAll('.piece');
    for (let piece of pieces) {
        if (piece.style.cursor !== 'default') {
            return;
        }
    }
    setTimeout(() => alert('Congratulations! You have completed the puzzle.'), 100);
}
