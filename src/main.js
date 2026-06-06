import init, {decrypt_func, encrypt_func,Algorithms} from "./pkg/crypto_app_lib.js";

const isWeb = !window.__TAURI_INTERNALS__;

// DOM Element Selectors
const encBtn = document.querySelector("#encrypt_btn");
const decBtn = document.querySelector("#decrypt_btn");
const copyBtn = document.querySelector("#copy_btn");
const textIn = document.querySelector("#text_input");
const textOut = document.querySelector("#text_output");
const keyInput = document.querySelector("#key");
const errorMsg = document.querySelector("#error_msg");
const statusBox = document.querySelector("#status_box");
const hintIcon = document.querySelector("#img_hint");

// Global tracker for UI toast timeout to prevent race conditions during rapid clicks
let messageTimeout = null;
// Initialize WASM once on startup if running in a web environment
if (isWeb) {
    init().catch(err => showMessage({text: `WASM Initialization failed: ${err}`}));
}

async function handleEncrypt() {
    const textValue = textIn.value.trim();
    const keyValue = keyInput.value;
    const selectedAlgo = getSelectedAlgorithm();
    if (!validateInputs(textValue, keyValue)) return;
    if (isWeb) {
        try {
            const algo = (selectedAlgo === "Chacha" ? Algorithms.Chacha : Algorithms.Aes);

            textOut.value = encrypt_func(textValue, keyValue, algo);
            copyBtn.disabled = false; // Encryption Trigger
            showMessage({
                text: "Successful encryption!",
                type: "success"
            });
        } catch (e) {
            showMessage({
                text: `WASM Error: Encryption failed<br><code>${e}</code>`,
                role: "alert",
                time: 6500
            });
        }
    } else {
        // Retrieve the safe invoke method from Tauri v2 core bridge
        const {invoke} = window.__TAURI__.core;
        try {
            textOut.value = await invoke("encrypt_func", {
                text: textValue,
                key: keyValue,
                algorithm: selectedAlgo
            });
            copyBtn.disabled = false; // Encryption Trigger

            showMessage({
                text: "Successful encryption!",
                type: "success"
            });
        } catch (e) {
            showMessage({
                text: `Tauri error: Encryption failed<br><code>${e}</code>`,
                role: "alert",
                time: 6500
            });
        }
    }
}

async function handleDecrypt() {
    const textValue = textIn.value.trim();
    const keyValue = keyInput.value;
    const selectedAlgo = getSelectedAlgorithm();
    if (!validateInputs(textValue, keyValue)) return;
    if (isWeb) {
        try {
            const algo = (selectedAlgo === "Chacha" ? Algorithms.Chacha : Algorithms.Aes);
            textOut.value = decrypt_func(textValue, keyValue, algo);
            showMessage({
                text: "Successful decryption!",
                type: "success"
            });
        } catch (e) {
            showMessage({
                text: `WASM Error: Decryption failed<br><code>${e}</code>`,
                role: "alert",
                time: 6500
            });
        }
    } else {
        // Retrieve the safe invoke method from Tauri v2 core bridge
        const {invoke} = window.__TAURI__.core;
        try {
            textOut.value = await invoke("decrypt_func", {
                text: textValue,
                key: keyValue,
                algorithm: getSelectedAlgorithm()
            });

            showMessage({
                text: "Successful decryption!",
                type: "success"
            });
        } catch (e) {
            showMessage({
                text: `Tauri error: Decryption failed<br><code>${e}</code>`,
                role: "alert",
                time: 6500
            });

        }
    }
}

/**
 * Handles global toast notifications for errors, success, and info messages.
 * Synchronizes with CSS transition classes.
 */
function showMessage({text, type = "error", time = 3500, role = "status"}) {
    // Clear any active timeout to reset the animation cycle smoothly
    if (messageTimeout) clearTimeout(messageTimeout);

    errorMsg.innerHTML = text;
    statusBox.setAttribute("role", role);

    // Dynamic UI styling based on the toast notification type
    if (type === "success") {
        errorMsg.style.color = "#0d8b49";
        hintIcon.setAttribute("src", "assets/done.svg");
    } else if (type === "error") {
        errorMsg.style.color = "#eb3341";
        hintIcon.setAttribute("src", "assets/error.svg");
    } else {
        errorMsg.style.color = "var(--text-dark)";
        hintIcon.setAttribute("src", "assets/clipboard.png");
    }

    // Trigger the slide-in CSS animation
    statusBox.classList.add("show");

    // Automatically hide the status box after the specified duration
    messageTimeout = setTimeout(() => {
        statusBox.classList.remove("show");
    }, time);
}

/**
 * Helper function to parse the active radio button selection.
 * @returns {string} The lowercase name of the algorithm ("aes" or "chacha")
 */
function getSelectedAlgorithm() {
    const checkedRadio = document.querySelector("input[name='encrypt_algo']:checked");
    return checkedRadio ? checkedRadio.value : "Aes";
}

/**
 * Basic client-side validation to block empty payloads before invoking Rust commands.
 */
function validateInputs(text, key) {
    if (!text) {
        showMessage({text: "Input text cannot be empty"});
        return false;
    }
    if (!key) {
        showMessage({text: "Cipher key is required"});
        return false;
    }
    return true;
}


// --- Event Listeners ---

// Clipboard Operations
copyBtn.addEventListener('click', async () => {
    const textToCopy = textOut.value;
    if (!textToCopy) return;

    try {
        await navigator.clipboard.writeText(textToCopy);
        showMessage({
            text: "Copied to clipboard successfully!",
            type: "normal"
        });
    } catch (e) {
        showMessage({
            text: `Copy operation failed<br><code>${e}</code>`,
            role: "alert",
            time: 6500
        });
    }
});

// Encryption Trigger
encBtn.addEventListener("click", handleEncrypt);

// Decryption Trigger
decBtn.addEventListener('click', handleDecrypt);


