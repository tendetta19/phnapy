// script.js

// List of predefined images to be used in the puzzle
const images = [
    'image1.jpg',
    'image2.jpg',
    // Add more image paths as needed
];

// Configuration
const MIN_ROWS = 2; // Minimum number of rows
const MAX_ROWS = 10; // Maximum number of rows
const MIN_COLS = 2; // Minimum number of columns
const MAX_COLS = 10; // Maximum number of columns

// Get DOM elements
const container = document.getElementById('puzzle-container');
const nextButton = document.getElementById('next-puzzle');
const debugButton = document.getElementById('debug-puzzle'); // Debug Button
const customPuzzleForm = document.getElementById('custom-puzzle-form');
const customImageInput = document.getElementById('custom-image');
const numRowsInput = document.getElementById('num-rows');
const numColsInput = document.getElementById('num-cols');
const statusMessage = document.getElementById('status-message'); // Status message box
const timerDisplay = document.getElementById('timer'); // Timer display

// Game state
let currentImageIndex = -1;
let rows = 0;
let cols = 0;
let pieces = [];
let isCustomPuzzle = false; // Flag to determine if the current puzzle is custom
let statusTimeout; // To manage status message timeout
let timerInterval; // To store the interval ID for the timer
let elapsedSeconds = 0; // To track elapsed time
let startTime; // To store the time when the puzzle starts

// Initialize the first puzzle when the window loads
window.onload = loadNextPuzzle;

// Event listener for "Next Puzzle" button
nextButton.addEventListener('click', loadNextPuzzle);

// Event listener for "Debug Puzzle" button
debugButton.addEventListener('click', loadDebugPuzzle);

// Event listener for custom puzzle form submission
customPuzzleForm.addEventListener('submit', handleCustomPuzzle);

// Function to load the next predefined puzzle
function loadNextPuzzle() {
    isCustomPuzzle = false;
    container.innerHTML = '';
    setGridSize(4, 4); // Default grid size for predefined puzzles (e.g., 4x4)
    pieces = [];

    if (images.length === 0) {
        alert('No predefined images available.');
        return;
    }

    currentImageIndex = (currentImageIndex + 1) % images.length;
    const imageSrc = images[currentImageIndex];
    console.log(`Selected image: ${imageSrc}`);

    loadImageAndCreatePuzzle(imageSrc, rows, cols);

    // Start the timer
    startTime = new Date();
    startTimer();
    console.log('Timer started.');
}

// Function to handle custom puzzle creation
function handleCustomPuzzle(event) {
    event.preventDefault();

    const file = customImageInput.files[0];
    const numRows = parseInt(numRowsInput.value);
    const numCols = parseInt(numColsInput.value);

    if (!file) {
        alert('Please upload an image.');
        return;
    }

    if (
        isNaN(numRows) || numRows < MIN_ROWS || numRows > MAX_ROWS ||
        isNaN(numCols) || numCols < MIN_COLS || numCols > MAX_COLS
    ) {
        alert(`Please enter number of rows between ${MIN_ROWS} and ${MAX_ROWS} and number of columns between ${MIN_COLS} and ${MAX_COLS}.`);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageSrc = e.target.result;
        console.log(`Custom puzzle created with ${numRows} rows x ${numCols} columns.`);
        isCustomPuzzle = true;
        setGridSize(numRows, numCols);
        loadImageAndCreatePuzzle(imageSrc, numRows, numCols);

        // Start the timer
        startTime = new Date();
        startTimer();
        console.log('Timer started.');
    };
    reader.onerror = function() {
        alert('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Function to load a debug 2x2 puzzle
function loadDebugPuzzle() {
    if (images.length === 0) {
        alert('No images available for debug puzzle.');
        return;
    }
    isCustomPuzzle = false;
    container.innerHTML = '';
    setGridSize(2, 2); // 2x2 grid = 4 pieces
    pieces = [];
    const imageSrc = images[0]; // Using the first image for debug
    console.log('Loading debug 2x2 puzzle');
    loadImageAndCreatePuzzle(imageSrc, rows, cols);

    // Start the timer
    startTime = new Date();
    startTimer();
    console.log('Timer started.');
}

// Function to set CSS variables for grid size
function setGridSize(numRows, numCols) {
    rows = numRows;
    cols = numCols;
    container.style.setProperty('--rows', rows);
    container.style.setProperty('--cols', cols);
    console.log(`Grid size set to ${rows} rows x ${cols} columns`);
}

// Function to load an image and create the puzzle
function loadImageAndCreatePuzzle(imageSrc, numRows, numCols) {
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

        console.log(`Grid size: ${rows} rows x ${cols} columns`);

        if (rows <= 1 || cols <= 1) { // Extra safety
            console.error('Invalid grid dimensions. Rows and columns must be greater than 1.');
            alert('Failed to create puzzle. Grid dimensions invalid.');
            return;
        }

        // Create puzzle pieces
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
                piece.dataset.row = y;
                piece.dataset.col = x;

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
            enableUnlock(piece); // Enable unlocking
        });

        console.log('Puzzle pieces appended and draggable.');
    };

    img.onerror = () => {
        console.error('Failed to load image. Please check the image paths and ensure the images exist.');
        alert('Failed to load image. Please check the image paths and ensure the images exist.');
    };
}

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to get a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

        // Bring the dragged piece to the front
        element.style.zIndex = 3; // Above grid lines and locked pieces
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
        element.style.zIndex = 2; // Reset z-index
        snapToGrid(element);
    }
}

// Enable unlocking of a locked piece via double-click
function enableUnlock(element) {
    element.addEventListener('dblclick', () => {
        if (element.classList.contains('locked')) {
            element.classList.remove('locked');
            showStatusMessage('Status: Piece has been unlocked');
        }
    });
}

// Function to snap a piece to the nearest grid slot
function snapToGrid(piece) {
    const containerRect = container.getBoundingClientRect();
    const pieceRect = piece.getBoundingClientRect();

    const pieceCenterX = pieceRect.left + pieceRect.width / 2 - containerRect.left;
    const pieceCenterY = pieceRect.top + pieceRect.height / 2 - containerRect.top;

    // Calculate which grid slot the piece center is closest to
    const slotWidth = containerRect.width / cols;
    const slotHeight = containerRect.height / rows;

    let closestCol = Math.floor(pieceCenterX / slotWidth);
    let closestRow = Math.floor(pieceCenterY / slotHeight);

    // Ensure the closest grid slot is within bounds
    closestCol = Math.min(Math.max(closestCol, 0), cols - 1);
    closestRow = Math.min(Math.max(closestRow, 0), rows - 1);

    const slotLeft = closestCol * slotWidth;
    const slotTop = closestRow * slotHeight;

    const toleranceX = slotWidth * 0.3; // 30% of slot width
    const toleranceY = slotHeight * 0.3; // 30% of slot height

    const distanceX = Math.abs(parseFloat(piece.style.left) - slotLeft);
    const distanceY = Math.abs(parseFloat(piece.style.top) - slotTop);

    if (distanceX < toleranceX && distanceY < toleranceY) {
        // Snap to the slot
        piece.style.left = `${slotLeft}px`;
        piece.style.top = `${slotTop}px`;
        checkPiecePosition(piece, closestRow, closestCol);
    }
}

// Check if the piece is in the correct grid slot
function checkPiecePosition(piece, row, col) {
    const correctRow = parseInt(piece.dataset.correctY);
    const correctCol = parseInt(piece.dataset.correctX);

    if (row === correctRow && col === correctCol) {
        // Correct placement
        piece.classList.add('locked');

        // Show status message
        showStatusMessage('Status: Piece has been locked into place');

        // Check if all pieces are locked
        checkWinCondition();
    }
}

// Function to show status message
function showStatusMessage(message) {
    // Update message text
    statusMessage.textContent = message;

    // Make the status message visible
    statusMessage.classList.add('visible');
    statusMessage.classList.remove('hidden');

    // Clear any existing timeout
    if (statusTimeout) {
        clearTimeout(statusTimeout);
    }

    // Hide the message after 5 seconds
    statusTimeout = setTimeout(() => {
        statusMessage.classList.remove('visible');
        statusMessage.classList.add('hidden');
    }, 5000);
}

// Check if all pieces are in the correct position
function checkWinCondition() {
    const lockedPieces = document.querySelectorAll('.piece.locked');
    if (lockedPieces.length === rows * cols) {
        setTimeout(() => {
            // Stop the timer
            stopTimer();

            // Calculate elapsed time
            const endTime = new Date();
            const timeTaken = (endTime - startTime) / 1000; // Time in seconds
            console.log(`Time taken to complete the puzzle: ${timeTaken} seconds`);

            // Display congratulations alert
            alert('Congratulations! You have completed the puzzle.');

            // Determine which YouTube link to open based on time taken
            if (timeTaken < 300) { // Less than 5 minutes (300 seconds)
                window.open('https://www.youtube.com/watch?v=gb95JNajKaY', '_blank');
            } else {
                window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            }
        }, 100);
    }
}

// Function to start the timer
function startTimer() {
    elapsedSeconds = 0;
    timerDisplay.textContent = 'Time: 00:00';
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        timerDisplay.textContent = `Time: ${pad(minutes)}:${pad(seconds)}`;
    }, 1000);
}

// Function to stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Helper function to pad numbers with leading zeros
function pad(number) {
    return number < 10 ? '0' + number : number;
}


 