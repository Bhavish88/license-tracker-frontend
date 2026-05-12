/* =========================
   HELPER: SMOOTH SCROLL
========================= */
function smoothScroll(targetId) {
    const section = document.querySelector(targetId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

/* =========================
   NAVBAR LINKS
========================= */
document.getElementById("nav-home")?.addEventListener("click", (e) => {
    e.preventDefault();
    smoothScroll("#home");
});

document.getElementById("nav-features")?.addEventListener("click", (e) => {
    e.preventDefault();
    smoothScroll("#features");
});

document.getElementById("nav-how")?.addEventListener("click", (e) => {
    e.preventDefault();
    smoothScroll("#how");
});

/* =========================
   NAVBAR BUTTONS
========================= */
document.getElementById("nav-login")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

document.getElementById("nav-register")?.addEventListener("click", () => {
    window.location.href = "register.html";
});

/* =========================
   HERO BUTTONS
========================= */
document.getElementById("hero-get-started")?.addEventListener("click", () => {
    window.location.href = "register.html";
});

document.getElementById("hero-login")?.addEventListener("click", () => {
    window.location.href = "login.html";
});

/* =========================
   MOBILE NAV TOGGLE + OVERLAY
========================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");
const navOverlay = document.getElementById("navOverlay");

menuToggle?.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    navOverlay.classList.toggle("active");
});

/* Close menu when clicking overlay */
navOverlay?.addEventListener("click", () => {
    navLinks.classList.remove("active");
    navOverlay.classList.remove("active");
});

/* Close menu when clicking a nav link */
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        navOverlay.classList.remove("active");
    });
});

/* =========================
   NAVBAR SCROLL EFFECT
========================= */
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});
