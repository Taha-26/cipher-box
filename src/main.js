
const { invoke } = window.__TAURI__.core;


const encBtn = document.querySelector("#encrypt_btn");
const decBtn = document.querySelector("#decrypt_btn");
const copyBtn = document.querySelector("#copy_btn");
const textIn = document.querySelector("#text_input");
const textOut = document.querySelector("#text_output");
const keyInput = document.querySelector("#key");
const errorMsg = document.querySelector("#error_msg");
const statusBox = document.querySelector("#status_box");
const hintIcon = document.querySelector("#img_hint");

let messageTimeout = null;

function showMessage({ text, type = "error", time = 3500, role = "status" }) {
    if (messageTimeout) clearTimeout(messageTimeout);


    errorMsg.innerHTML = text;
    statusBox.setAttribute("role", role);

    if (type === "success") {
        errorMsg.style.color = "#0d8b49";
        hintIcon.setAttribute("src", "assets/done.svg");
    } else if (type === "error") {
        errorMsg.style.color = "#eb3341";
        hintIcon.setAttribute("src", "assets/error.svg");
    } else {
        errorMsg.style.color = "#3b3b3b";
        hintIcon.setAttribute("src", "assets/clipboard.png");
    }
    statusBox.classList.add("show");

    messageTimeout = setTimeout(() => {
        statusBox.classList.remove("show");
    }, time);
}

function getSelectedAlgorithm() {
    const checkedRadio = document.querySelector("input[name='encrypt_algo']:checked");
    return checkedRadio ? checkedRadio.value.toLowerCase() : "aes";
}

function validateInputs(text, key) {
    if (!text) {
        showMessage({ text: "Input text cannot be empty" });
        return false;
    }
    if (!key) {
        showMessage({ text: "Cipher key is required" });
        return false;
    }
    return true;
}

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

decBtn.addEventListener('click', async () => {
    const textValue = textIn.value.trim();
    const keyValue = keyInput.value;

    if (!validateInputs(textValue, keyValue)) return;

    try {
        const result = await invoke("decrypt_func", {
            text: textValue,
            key: keyValue,
            algorithm: getSelectedAlgorithm()
        });

        textOut.value = result;
        copyBtn.disabled = false;

        showMessage({
            text: "Successful decryption!",
            type: "success"
        });
    } catch (e) {
        showMessage({
            text: `Decryption failed<br><code>${e}</code>`,
            role: "alert",
            time: 6500
        });
    }
});

encBtn.addEventListener("click", async () => {
    const textValue = textIn.value.trim();
    const keyValue = keyInput.value;

    if (!validateInputs(textValue, keyValue)) return;

    try {
        const result = await invoke("encrypt_func", {
            text: textValue,
            key: keyValue,
            algorithm: getSelectedAlgorithm()
        });

        textOut.value = result;
        copyBtn.disabled = false;

        showMessage({
            text: "Successful encryption!",
            type: "success"
        });
    } catch (e) {
        showMessage({
            text: `Encryption failed<br><code>${e}</code>`,
            role: "alert",
            time: 6500
        });
    }
});
