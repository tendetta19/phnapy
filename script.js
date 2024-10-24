// script.js

// List of predefined images to be used in the puzzle
const images = [
    'image1.jpg',
    'image2.jpg'
    // Add more image paths as needed
];

// Configuration
const MIN_PIECES = 10;
const MAX_PIECES = 50;

// Get DOM elements
const container = document.getElementById('puzzle-container');
const nextButton = document.getElementById('next-puzzle');
const customPuzzleForm = document.getElementById('custom-puzzle-form');
const customImageInput = document.getElementById('custom-image');
const numPiecesInput = document.getElementById('num-pieces');

// Game state
let currentImageIndex = -1;
let rows = 0;
let cols = 0;
let pieces = [];
let isCustomPuzzle = false; // Flag to determine if the current puzzle is custom

// Initialize the first puzzle
loadNextPuzzle();

// Event listener for "Next Puzzle" button
nextButton.addEventListener('click', loadNextPuzzle);

// Event listener for custom puzzle form submission
customPuzzleForm.addEventListener('submit', handleCustomPuzzle);

// Function to load the next predefined puzzle
function loadNextPuzzle() {
    isCustomPuzzle = false;
    container.innerHTML = '';
    pieces = [];

    currentImageIndex = (currentImageIndex + 1) % images.length;
    const imageSrc = images[currentImageIndex];
    console.log(`Selected image: ${imageSrc}`);

    loadImageAndCreatePuzzle(imageSrc, getRandomInt(MIN_PIECES, MAX_PIECES));
}

// Function to handle custom puzzle creation
function handleCustomPuzzle(event) {
    event.preventDefault();

    const file = customImageInput.files[0];
    const numPieces = parseInt(numPiecesInput.value);

    if (!file) {
        alert('Please upload an image.');
        return;
    }

    if (isNaN(numPieces) || numPieces < MIN_PIECES || numPieces > MAX_PIECES) {
        alert(`Please enter a number of pieces between ${MIN_PIECES} and ${MAX_PIECES}.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageSrc = e.target.result;
        console.log(`Custom puzzle created with ${numPieces} pieces.`);
        isCustomPuzzle = true;
        loadImageAndCreatePuzzle(imageSrc, numPieces);
    };
    reader.onerror = function() {
        alert('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Function to load an image and create the puzzle
function loadImageAndCreatePuzzle(imageSrc, numPieces) {
    container.innerHTML = '';
    pieces = [];

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        console.log('Image loaded successfully.');
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Adjust container padding-bottom to maintain aspect ratio
        const aspectRatio = (originalHeight / originalWidth) * 100;
        container.style.paddingBottom = `${aspectRatio}%`;
        console.log(`Set container aspect ratio to ${aspectRatio}%`);

        // Determine number of pieces
        const actualNumPieces = Math.min(Math.max(numPieces, MIN_PIECES), MAX_PIECES);
        console.log(`Number of pieces: ${actualNumPieces}`);
        const grid = determineGrid(actualNumPieces);
        rows = grid.rows;
        cols = grid.cols;
        console.log(`Grid size: ${rows} rows x ${cols} columns`);

        if (rows <= 0 || cols <= 0) {
            console.error('Invalid grid dimensions. Rows and columns must be greater than 0.');
            return;
        }

        // Create pieces
        const pieceWidth = 100 / cols; // Percentage width
        const pieceHeight = 100 / rows; // Percentage height

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.style.width = `${pieceWidth}%`;
                piece.style.height = `${pieceHeight}%`;
                piece.style.backgroundImage = `url(${imageSrc})`;
                piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
                piece.style.backgroundPosition = `${(-x * 100) / (cols - 1)}% ${(-y * 100) / (rows - 1)}%`;
                piece.dataset.correctX = x;
                piece.dataset.correctY = y;

                pieces.push(piece);
            }
        }

        console.log(`Created ${pieces.length} puzzle pieces.`);

        // Shuffle and place pieces randomly
        shuffleArray(pieces);
        pieces.forEach(piece => {
            container.appendChild(piece);
            randomizePosition(piece);
            enableDrag(piece);
        });

        console.log('Puzzle pieces appended and draggable.');
    };

    img.onerror = () => {
        console.error('Failed to load image. Please check the image paths and ensure the images exist.');
        alert('Failed to load image. Please check the image paths and ensure the images exist.');
    };
}

// Function to determine grid (rows and cols) based on desired number of pieces
function determineGrid(desiredPieces) {
    // Ensure a minimum grid size to avoid 1-row or 1-column puzzles
    const MIN_ROWS = 3;
    const MIN_COLS = 3;

    let factors = [];
    for (let i = MIN_ROWS; i <= Math.sqrt(desiredPieces); i++) {
        if (desiredPieces % i === 0) {
            factors.push([i, desiredPieces / i]);
        }
    }

    // If exact factors found, choose one randomly
    if (factors.length > 0) {
        const selected = factors[Math.floor(Math.random() * factors.length)];
        console.log(`Exact grid found: ${selected[0]} rows x ${selected[1]} cols`);
        return { rows: selected[0], cols: selected[1] };
    }

    // If no exact factors, find the closest grid with minimum rows and columns
    let closest = [MIN_ROWS, Math.ceil(desiredPieces / MIN_ROWS)];
    let minDiff = Math.abs(closest[0] * closest[1] - desiredPieces);

    for (let rows = MIN_ROWS; rows <= desiredPieces; rows++) {
        let cols = Math.ceil(desiredPieces / rows);
        let totalPieces = rows * cols;
        let diff = Math.abs(totalPieces - desiredPieces);
        if (diff < minDiff) {
            minDiff = diff;
            closest = [rows, cols];
        }
        if (minDiff === 0) break;
    }

    console.log(`Closest grid without exact factors: ${closest[0]} rows x ${closest[1]} cols`);
    return { rows: closest[0], cols: closest[1] };
}

// Function to get a random integer between min and max (inclusive), but never returns 1
function getRandomInt(min, max) {
    let randomInt;

    // Keep generating a random number until it's not 1
    do {
        randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (randomInt === 1);

    return randomInt;
}


// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Randomize the position of a piece within the container
function randomizePosition(piece) {
    const containerRect = container.getBoundingClientRect();

    const pieceWidth = containerRect.width / cols;
    const pieceHeight = containerRect.height / rows;

    const maxLeft = containerRect.width - pieceWidth;
    const maxTop = containerRect.height - pieceHeight;

    const left = Math.random() * maxLeft;
    const top = Math.random() * maxTop;

    piece.style.left = `${left}px`;
    piece.style.top = `${top}px`;
}

// Enable drag-and-drop for a piece
function enableDrag(element) {
    let offsetX, offsetY;
    let initialX, initialY;
    let isDragging = false;

    // Mouse Events
    element.addEventListener('mousedown', onMouseDown);

    // Touch Events
    element.addEventListener('touchstart', onTouchStart, { passive: false });

    function onMouseDown(e) {
        if (element.classList.contains('locked')) {
            return; // Do not initiate drag if the piece is locked
        }
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        moveDrag(e.clientX, e.clientY);
    }

    function onMouseUp(e) {
        if (!isDragging) return;
        endDrag();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Touch Handlers
    function onTouchStart(e) {
        if (element.classList.contains('locked')) {
            return; // Do not initiate drag if the piece is locked
        }
        e.preventDefault();
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }

    function onTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
    }

    function onTouchEnd(e) {
        if (!isDragging) return;
        endDrag();
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }

    function startDrag(clientX, clientY) {
        isDragging = true;
        const rect = element.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        initialX = parseFloat(element.style.left);
        initialY = parseFloat(element.style.top);

        // Bring the dragged piece to the front
        element.style.zIndex = 1000;
    }

    function moveDrag(clientX, clientY) {
        const containerRect = container.getBoundingClientRect();

        let left = clientX - containerRect.left - offsetX;
        let top = clientY - containerRect.top - offsetY;

        // Keep within bounds
        left = Math.max(0, Math.min(left, containerRect.width - element.offsetWidth));
        top = Math.max(0, Math.min(top, containerRect.height - element.offsetHeight));

        element.style.left = `${left}px`;
        element.style.top = `${top}px`;
    }

    function endDrag() {
        isDragging = false;
        element.style.zIndex = 1; // Reset z-index
        checkPiecePosition(element);
    }
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

    const toleranceX = pieceWidth * 0.1; // 10% of piece width
    const toleranceY = pieceHeight * 0.1; // 10% of piece height

    if (
        Math.abs(currentX - correctX) < toleranceX &&
        Math.abs(currentY - correctY) < toleranceY
    ) {
        // Snap to correct position
        piece.style.left = `${correctX}px`;
        piece.style.top = `${correctY}px`;
        piece.classList.add('locked');

        // Check if all pieces are locked
        checkWinCondition();
    }
}

// Check if all pieces are in the correct position
function checkWinCondition() {
    const lockedPieces = document.querySelectorAll('.piece.locked');
    if (lockedPieces.length === rows * cols) {
        setTimeout(() => {
            alert('AMANDUM');
        }, 100);
    }
}
