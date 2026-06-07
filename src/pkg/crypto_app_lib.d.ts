/* tslint:disable */
/* eslint-disable */

/**
 * Supported AEAD Cryptography Algorithms mapping directly to frontend radio inputs.
 */
export enum Algorithms {
    Aes = 0,
    Chacha = 1,
}

/**
 * Decrypts a standard Base64 string back into readable UTF-8 text.
 * Extracts the first 12 bytes as the nonce and authenticates data integrity before decryption.
 */
export function decrypt_func(text: string, key: string, algorithm: Algorithms): string;

/**
 * Encrypts raw text using the selected algorithm.
 * Automatically hashes the key via SHA-256 and prepends a cryptographically secure 12-byte nonce.
 */
export function encrypt_func(text: string, key: string, algorithm: Algorithms): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly decrypt_func: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly encrypt_func: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
