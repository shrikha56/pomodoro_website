document.addEventListener("DOMContentLoaded", () => {
    const start = document.getElementById("start");
    const reset = document.getElementById("reset");
    const timer = document.getElementById("timer");
    const setTimeButton = document.getElementById("set-time");
    const audio = document.getElementById("alarm-sound");
    const chatButton = document.getElementById("chat");
    const chatForm = document.querySelector("#chatForm");
    const closeButton = document.querySelector(".cancel");
    const sendButton = document.querySelector(".btn[type='submit']");
    const messageInput = document.getElementById("msg");




    console.log(start, reset, timer, setTimeButton, chatButton, chatForm); // Debugging

    if (!start || !reset || !timer || !setTimeButton || !chatButton || !chatForm) {
        console.error("One or more elements not found! Check HTML IDs.");
        return;
    }

    let workTime = 1500; // 25 minutes
    let breakTime = 300; // 5 minutes
    let timeleft = workTime;
    let interval = null;
    let isWorkSession = true;
    let isRunning = false;

    // Enable sound playback
    const enableAudio = () => {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
        }).catch(error => console.log("Autoplay prevented, waiting for user interaction."));
    };
    document.addEventListener("click", enableAudio, { once: true });

    const playSound = () => {
        let count = 0;
    
        const playLoop = () => {
            if (count < 4) {
                audio.currentTime = 0; // Restart sound from beginning
                audio.play().then(() => {
                    count++;
                    audio.onended = playLoop; // Play next when current finishes
                }).catch(error => console.log("Autoplay prevented:", error));
            }
        };
    
        playLoop();
    };

    // Update timer display
    const updateTimer = () => {
        const minutes = Math.floor(timeleft / 60);
        const seconds = timeleft % 60;
        timer.innerHTML = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const toggleTimer = () => {
        if (isRunning) {
            clearInterval(interval);
            interval = null;
            isRunning = false;
            start.innerText = "Start";
            start.style.backgroundColor = "rgb(47, 255, 78)";
        } else {
            interval = setInterval(() => {
                if (timeleft > 0) {
                    timeleft--;
                    updateTimer();
                } else {
                    clearInterval(interval);
                    isRunning = false;
    
                    playSound(); // 🔥 Beeping sound first
    
                    setTimeout(() => {
                        if (isWorkSession) {
                            alert("Take a break!");
                            timeleft = breakTime;
                        } else {
                            alert("Time for work!");
                            timeleft = workTime;
                        }
    
                        isWorkSession = !isWorkSession;
                        updateTimer();
                        toggleTimer(); // ✅ Start next session AFTER alert
                    }, 3000); // 🔥 Wait 3 seconds before alert
                }
            }, 1000);
    
            isRunning = true;
            start.innerText = "Stop";
            start.style.backgroundColor = "rgb(227, 0, 0)";
        }
    };
    

    // Reset timer
    const resetTimer = () => {
        clearInterval(interval);
        isRunning = false;
        isWorkSession = true;
        timeleft = workTime;
        start.innerText = "Start";
        start.style.backgroundColor = "rgb(47, 255, 78)";
        updateTimer();
    };

    // Set custom time
    const chooseTime = () => {
        let newWorkTime = parseInt(prompt("Enter new time in minutes for your work session:"));
        let newBreakTime = parseInt(prompt("Enter new time in minutes for your break:"));

        if (!isNaN(newWorkTime) && newWorkTime > 0 && !isNaN(newBreakTime) && newBreakTime > 0) {
            workTime = newWorkTime * 60;
            breakTime = newBreakTime * 60;
            timeleft = workTime;
            isWorkSession = true;
            isRunning = false;
            clearInterval(interval);
            start.innerText = "Start";
            start.style.backgroundColor = "rgb(47, 255, 78)";
            updateTimer();
        } else {
            alert("Invalid input. Please enter a valid number greater than 0.");
        }
    };

    // Toggle chat form
    const toggleForm = () => {
        chatForm.style.display = (chatForm.style.display === "block") ? "none" : "block";
    };
    

    // Event Listeners
    start.addEventListener("click", toggleTimer);
    reset.addEventListener("click", resetTimer);
    setTimeButton.addEventListener("click", chooseTime);
    chatButton.addEventListener("click", toggleForm);
    closeButton.addEventListener("click", function () {
        chatForm.style.display = "none";
    });
   


    sendButton.addEventListener("click", function () {
        const message = messageInput.value.trim();  // ✅ Semicolon is fine here, but the function isn't closed yet.
    
        if (message !== "") {
            let messages = JSON.parse(localStorage.getItem("messages")) || [];
            messages.push({ text: message, sender: "You" });
            localStorage.setItem("messages", JSON.stringify(messages));
    
            console.log("Sent message:", message);
            messageInput.value = ""; // Clear input after sending
    
            // Display message in chat UI (if implemented)
            displayMessages();
        } else {
            alert("Please enter a message!");
        }
    });  
    async function fetchMessages() {
        try {
            const response = await fetch("http://localhost:5000/messages");
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
    
            const messages = await response.json();
    
            // Store messages in localStorage
            localStorage.setItem("serverMessages", JSON.stringify(messages));
    
            console.log("Received messages:", messages);
    
            // Display messages in chat UI (if implemented)
            displayMessages();
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }
    function displayMessages() {
        const chatContainer = document.getElementById("chatForm"); // Update to your chat display element
        if (!chatContainer) return;
    
        chatContainer.innerHTML = "<h1>Chat</h1>";
    
        let localMessages = JSON.parse(localStorage.getItem("messages")) || [];
        let serverMessages = JSON.parse(localStorage.getItem("serverMessages")) || [];
    
        let allMessages = [...serverMessages, ...localMessages];
    
        allMessages.forEach(msg => {
            const messageElement = document.createElement("p");
            messageElement.textContent = `${msg.sender || "Server"}: ${msg.text}`;
            chatContainer.appendChild(messageElement);
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
        fetchMessages();
        displayMessages();
    });

   
    if (timer) updateTimer();

    
});  
 

