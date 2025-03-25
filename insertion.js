const barsContainer = document.getElementById("bars-container");
const logContainer = document.getElementById("log-container");
const codeText = document.getElementById("code-display-text");
const speedSlider = document.getElementById("speed");
let delay = 300;


// Utility function to log messages
const logMessage = (message) => {
    const log = document.createElement("p");
    log.textContent = message;
    logContainer.appendChild(log);
};

// Generate random bars
const generateBars = () => {
    const barscontainer = document.getElementById("bar-container");
    if (!barscontainer) {
        console.error("Bar container not found!");
        return;
    }
    barscontainer.innerHTML = "";
    let arraySize = Math.floor(Math.random() * 20) + 6; // Random size between 6 and 25
    let numbers = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
    createBars(numbers);
};

function createBars(numbers) {
    const barscontainer = document.getElementById("bar-container");
    barscontainer.innerHTML = ""; // Clear old bars
    numbers.forEach(value => {
        let bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${Math.min(value, 100)}%`; // Clamp height to 100%
        let label = document.createElement("div");
        label.classList.add("bar-label");
        label.textContent = value;
        bar.appendChild(label);
        barscontainer.appendChild(bar);
    });
}

function updateBar(index, height, color = "rgb(5, 139, 248)") {
    const bars = document.querySelectorAll(".bar");
    if (index < bars.length) {
        bars[index].style.height = `${Math.min(height, 100)}%`;
        bars[index].style.backgroundColor = color;
    }
}

// Event listener for the Generate Bars button
document.getElementById("generate-bars").addEventListener("click", generateBars);

// Add custom array from user
const addArray = () => {
    const input = document.getElementById("user-array").value;
    const values = input.split(",").map((num) => parseInt(num.trim()));
    barsContainer.innerHTML = "";
    values.forEach((value) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value}%`;
        bar.textContent = value;
        barsContainer.appendChild(bar);
    });
};

// Highlight code
const highlightCode = (lineNumber) => {
    const lines = codeText.textContent.split("\n");
    const highlighted = lines.map((line, index) =>
        index === lineNumber ? `<span class="highlight">${line}</span>` : line
    );
    codeText.innerHTML = highlighted.join("\n");
};

// Insertion Sort with Animation
const insertionSort = async () => {
    const bars = document.querySelectorAll(".bar");
    logMessage("Starting Insertion Sort...");
    for (let i = 1; i < bars.length; i++) {
        let keyHeight = bars[i].style.height;
        let keyValue = bars[i].textContent;
        let j = i - 1;

        bars[i].style.backgroundColor = "red";
        highlightCode(2);
        await new Promise((resolve) => setTimeout(resolve, delay));

        while (j >= 0 && parseInt(bars[j].textContent) > parseInt(keyValue)) {
            bars[j + 1].style.height = bars[j].style.height;
            bars[j + 1].textContent = bars[j].textContent;
            bars[j].style.backgroundColor = "yellow";

            highlightCode(5);
            await new Promise((resolve) => setTimeout(resolve, delay));
            j--;
        }

        bars[j + 1].style.height = keyHeight;
        bars[j + 1].textContent = keyValue;
        bars[i].style.backgroundColor = "rgb(5, 139, 248)";
        logMessage(`Moved ${keyValue} to position ${j + 2}`);
    }
    logMessage("Insertion Sort Completed!");
};

// Event listeners
document.getElementById("generate-bars").addEventListener("click", generateBars);
document.getElementById("add-array").addEventListener("click", addArray);
document.getElementById("start-sorting").addEventListener("click", insertionSort);
speedSlider.addEventListener("input", () => (delay = speedSlider.value));

// Initialize with random bars
generateBars();
