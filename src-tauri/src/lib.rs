use aes_gcm::{aead::Aead, Aes256Gcm, KeyInit, Nonce as AesNonce};
use base64::{engine::general_purpose, Engine as _};
use chacha20poly1305::{ChaCha20Poly1305, Nonce as ChaNonce};
use rand::Rng; 
use sha2::{Digest, Sha256};
use tauri::generate_handler;

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
enum Algorithms {
    Aes,
    Chacha,
}

#[tauri::command]
fn encrypt_func(text: String, key: String, algorithm: Algorithms) -> Result<String, String> {
    let key_hash = Sha256::digest(key.as_bytes());

    let nonce_bytes: [u8; 12] = rand::thread_rng().gen();

    let ciphertext = match algorithm {
        Algorithms::Aes => {
            let cipher = Aes256Gcm::new_from_slice(&key_hash).expect("Valid 32-byte key");
            let nonce = AesNonce::from_slice(&nonce_bytes);
            cipher
                .encrypt(nonce, text.as_bytes())
                .map_err(|e| e.to_string())?
        }
        Algorithms::Chacha => {
            let cipher = ChaCha20Poly1305::new_from_slice(&key_hash).expect("Valid 32-byte key");
            let nonce = ChaNonce::from_slice(&nonce_bytes);
            cipher
                .encrypt(nonce, text.as_bytes())
                .map_err(|e| e.to_string())?
        }
    };

    let mut combined = Vec::with_capacity(nonce_bytes.len() + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(general_purpose::STANDARD.encode(combined))
}

#[tauri::command]
fn decrypt_func(text: String, key: String, algorithm: Algorithms) -> Result<String, String> {
    let combined = general_purpose::STANDARD
        .decode(text.trim())
        .map_err(|_| "The encrypted text format is invalid!".to_string())?;

    if combined.len() < 12 {
        return Err("The encrypted text is too short!".to_string());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let key_hash = Sha256::digest(key.as_bytes());

    let decrypted_bytes = match algorithm {
        Algorithms::Aes => {
            let cipher = Aes256Gcm::new_from_slice(&key_hash).expect("Valid 32-byte key");
            let nonce = AesNonce::from_slice(nonce_bytes);
            cipher
                .decrypt(nonce, ciphertext)
                .map_err(|_| "The key, algorithm, or data is corrupted.".to_string())?
        }
        Algorithms::Chacha => {
            let cipher = ChaCha20Poly1305::new_from_slice(&key_hash).expect("Valid 32-byte key");
            let nonce = ChaNonce::from_slice(nonce_bytes);
            cipher
                .decrypt(nonce, ciphertext)
                .map_err(|_| "The key, algorithm, or data is corrupted.".to_string())?
        }
    };

    String::from_utf8(decrypted_bytes).map_err(|_| "Decrypted data is not valid UTF-8.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(generate_handler![encrypt_func, decrypt_func])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}