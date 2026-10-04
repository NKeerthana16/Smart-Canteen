/**
 * Smart Canteen Frontend Data Initialization
 * Uses MongoDB backend REST APIs as the source of truth.
 */

// Initialize empty cart in LocalStorage if missing
function initLocalStorage() {
    if (!localStorage.getItem("cart")) {
        localStorage.setItem("cart", JSON.stringify([]));
    }
}

// Run storage initialization
initLocalStorage();
