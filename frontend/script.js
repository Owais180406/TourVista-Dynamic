const VIDEO_LIBRARY = {
  dubai: "./assets/videos/dubai.mp4",
  istanbul: "./assets/videos/istanbul.mp4",
  maldives: "./assets/videos/maldives.mp4",
  switzerland: "./assets/videos/switzerland.mp4",
  thailand: "./assets/videos/thailand.mp4",
  bali: "./assets/videos/bali.mp4",
  pakistan: "./assets/videos/pakistan.mp4"
};


/* =========================================================
   TOURVISTA
   Frontend JavaScript
   Compatible with TourVista Express backend
   ========================================================= */

"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const API_BASE = (
    window.TOURVISTA_API ||
    (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000"
            : ""
    )
).replace(/\/$/, "");


/* =========================================================
   STATE
   ========================================================= */

const state = {
    country: null,
    countries: [],
    domesticTours: [],
    internationalTours: [],
    allTours: [],
    filteredTours: [],
    search: "",
    type: "all",
    sort: "featured",
    selectedTour: null,
    loading: false
};


/* =========================================================
   DOM
   ========================================================= */

const elements = {
    countryButton: document.getElementById("countryButton"),
    heroCountryButton: document.getElementById("heroCountryButton"),

    countryFlag: document.getElementById("countryFlag"),
    countryName: document.getElementById("countryName"),

    marketFlag: document.getElementById("marketFlag"),
    marketCountryName: document.getElementById("marketCountryName"),

    heroCountryText: document.getElementById("heroCountryText"),

    domesticCount: document.getElementById("domesticCount"),
    internationalCount: document.getElementById("internationalCount"),

    domesticTours: document.getElementById("domesticTours"),
    internationalTours: document.getElementById("internationalTours"),

    domesticSection: document.getElementById("domesticSection"),
    internationalSection: document.getElementById("internationalSection"),

    domesticEmpty: document.getElementById("domesticEmpty"),
    internationalEmpty: document.getElementById("internationalEmpty"),

    domesticDescription: document.getElementById("domesticDescription"),

    tourSearch: document.getElementById("tourSearch"),
    tourType: document.getElementById("tourType"),
    tourSort: document.getElementById("tourSort"),

    loadingState: document.getElementById("loadingState"),
    errorState: document.getElementById("errorState"),
    errorMessage: document.getElementById("errorMessage"),
    retryButton: document.getElementById("retryButton"),

    countryModal: document.getElementById("countryModal"),
    countryList: document.getElementById("countryList"),
    closeCountryModal: document.getElementById("closeCountryModal"),

    bookingModal: document.getElementById("bookingModal"),
    closeBookingModal: document.getElementById("closeBookingModal"),

    bookingForm: document.getElementById("bookingForm"),
    bookingTourId: document.getElementById("bookingTourId"),
    bookingTourName: document.getElementById("bookingTourName"),
    bookingTourMeta: document.getElementById("bookingTourMeta"),
    bookingTourImage: document.getElementById("bookingTourImage"),
    bookingCountry: document.getElementById("bookingCountry"),

    bookingName: document.getElementById("bookingName"),
    bookingEmail: document.getElementById("bookingEmail"),
    bookingPhone: document.getElementById("bookingPhone"),
    bookingGuests: document.getElementById("bookingGuests"),
    bookingDate: document.getElementById("bookingDate"),
    bookingSubmit: document.getElementById("bookingSubmit"),

    toast: document.getElementById("toast"),
    toastTitle: document.getElementById("toastTitle"),
    toastMessage: document.getElementById("toastMessage"),

    currentYear: document.getElementById("currentYear"),

    mobileMenuButton: document.getElementById("mobileMenuButton"),
    mobileNav: document.getElementById("mobileNav")
};


/* =========================================================
   HELPERS
   ========================================================= */

function apiUrl(path) {
    return `${API_BASE}${path}`;
}


async function apiRequest(path, options = {}) {

    const response = await fetch(apiUrl(path), {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {

        const message =
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`;

        throw new Error(message);
    }

    return data;
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatPrice(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Price on request";
    }

    return `$${number.toLocaleString("en-US")}`;
}


function normalizeTour(tour, type) {

    return {
        ...tour,

        id: String(
            tour.id ??
            tour.tour_id ??
            `${type}-${Math.random().toString(36).slice(2)}`
        ),

        title:
            tour.title ||
            tour.name ||
            "Unnamed tour",

        destination:
            tour.destination ||
            tour.location ||
            "Unknown destination",

        country:
            tour.country ||
            tour.country_name ||
            "",

        countryCode:
            tour.countryCode ||
            tour.country_code ||
            "",

        description:
            tour.description ||
            "Discover a memorable travel experience.",

        image:
            tour.image ||
            tour.image_url ||
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",

        price: Number(tour.price) || 0,

        duration:
            tour.duration ||
            "Flexible",

        type:
            tour.type ||
            type,

        featured:
            tour.featured !== false
    };
}


function isValidDate(dateString) {

    if (!dateString) {
        return false;
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return date >= today;
}


function setMinBookingDate() {

    if (!elements.bookingDate) {
        return;
    }

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    elements.bookingDate.min = `${year}-${month}-${day}`;
}


function showToast(title, message, type = "success") {

    if (!elements.toast) {
        return;
    }

    elements.toastTitle.textContent = title;
    elements.toastMessage.textContent = message;

    const icon = elements.toast.querySelector(".toast-icon");

    if (icon) {
        icon.textContent = type === "error" ? "!" : "✓";
    }

    elements.toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 4500);
}


function setLoading(loading) {

    state.loading = loading;

    if (elements.loadingState) {
        elements.loadingState.classList.toggle("hidden", !loading);
    }
}


function setError(message = "") {

    const hasError = Boolean(message);

    if (elements.errorState) {
        elements.errorState.classList.toggle("hidden", !hasError);
    }

    if (elements.errorMessage && hasError) {
        elements.errorMessage.textContent = message;
    }
}


function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");
}


function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    const anyModalOpen = [
        elements.countryModal,
        elements.bookingModal
    ].some(item => item && !item.classList.contains("hidden"));

    if (!anyModalOpen) {
        document.body.classList.remove("modal-open");
    }
}


/* =========================================================
   COUNTRY STORAGE
   ========================================================= */

function getSavedCountry() {

    try {
        return localStorage.getItem("tourvista_country");
    } catch {
        return null;
    }
}


function saveCountry(countryCode) {

    try {
        localStorage.setItem(
            "tourvista_country",
            countryCode
        );
    } catch {
        // Storage can be disabled by browser settings.
    }
}


/* =========================================================
   COUNTRY
   ========================================================= */

async function loadCountries() {

    const data = await apiRequest("/api/countries");

    state.countries = Array.isArray(data)
        ? data
        : Array.isArray(data?.countries)
            ? data.countries
            : [];

    renderCountryList();
}


async function detectCountry() {

    const savedCountry = getSavedCountry();

    if (savedCountry) {

        const saved = state.countries.find(
            country =>
                country.code === savedCountry
        );

        if (saved) {
            state.country = saved;
            return saved;
        }
    }


    try {

        const data = await apiRequest("/api/location");

        const code =
            data?.countryCode ||
            data?.country_code ||
            data?.code;

        const detected = state.countries.find(
            country =>
                country.code === code
        );

        if (detected) {
            state.country = detected;
            saveCountry(detected.code);
            return detected;
        }

    } catch (error) {

        console.warn(
            "Automatic country detection failed:",
            error.message
        );
    }


    // Safe fallback.
    const pakistan = state.countries.find(
        country => country.code === "PK"
    );

    state.country =
        pakistan ||
        state.countries[0] ||
        null;

    if (state.country) {
        saveCountry(state.country.code);
    }

    return state.country;
}


function updateCountryUI() {

    if (!state.country) {
        return;
    }

    const name =
        state.country.name ||
        "Your country";

    const flag =
        state.country.flag ||
        "🌍";


    if (elements.countryName) {
        elements.countryName.textContent = name;
    }

    if (elements.countryFlag) {
        elements.countryFlag.textContent = flag;
    }

    if (elements.marketCountryName) {
        elements.marketCountryName.textContent = name;
    }

    if (elements.marketFlag) {
        elements.marketFlag.textContent = flag;
    }

    if (elements.heroCountryText) {

        elements.heroCountryText.textContent =
            `Showing domestic experiences in ${name}`;
    }

    if (elements.domesticDescription) {

        elements.domesticDescription.textContent =
            `Explore unforgettable places within ${name}.`;
    }
}


function renderCountryList() {

    if (!elements.countryList) {
        return;
    }

    if (!state.countries.length) {

        elements.countryList.innerHTML = `
            <p style="color:#6d7772;font-size:13px;">
                No countries available.
            </p>
        `;

        return;
    }


    elements.countryList.innerHTML =
        state.countries.map(country => {

            const active =
                state.country &&
                state.country.code === country.code;

            return `
                <button
                    class="country-option ${active ? "active" : ""}"
                    type="button"
                    data-country-code="${escapeHtml(country.code)}"
                >

                    <span class="country-option-flag">
                        ${escapeHtml(country.flag || "🌍")}
                    </span>

                    <span class="country-option-info">

                        <strong>
                            ${escapeHtml(country.name)}
                        </strong>

                        <small>
                            ${escapeHtml(country.code)}
                        </small>

                    </span>

                </button>
            `;

        }).join("");
}


async function selectCountry(countryCode) {

    const selected = state.countries.find(
        country =>
            country.code === countryCode
    );

    if (!selected) {
        return;
    }

    state.country = selected;

    saveCountry(selected.code);

    updateCountryUI();
    renderCountryList();

    closeModal(elements.countryModal);

    await loadTours();

    showToast(
        "Country updated",
        `TourVista is now showing domestic tours for ${selected.name}.`
    );
}


function openCountryModal() {

    renderCountryList();
    openModal(elements.countryModal);
}


/* =========================================================
   TOURS
   ========================================================= */

async function loadTours() {

    if (!state.country?.code) {
        return;
    }

    setError("");
    setLoading(true);

    try {

        const data = await apiRequest(
            `/api/tours?country=${encodeURIComponent(state.country.code)}`
        );


        const domestic = Array.isArray(data?.domestic)
            ? data.domestic
            : [];

        const international = Array.isArray(data?.international)
            ? data.international
            : [];


        state.domesticTours =
            domestic.map(tour =>
                normalizeTour(tour, "domestic")
            );


        state.internationalTours =
            international.map(tour =>
                normalizeTour(tour, "international")
            );


        state.allTours = [
            ...state.domesticTours,
            ...state.internationalTours
        ];


        updateCounts();

        applyFilters();

    } catch (error) {

        console.error("Tour loading error:", error);

        state.domesticTours = [];
        state.internationalTours = [];
        state.allTours = [];

        renderTours();

        setError(
            error.message ||
            "Unable to load tours. Please try again."
        );

    } finally {

        setLoading(false);
    }
}


function updateCounts() {

    if (elements.domesticCount) {
        elements.domesticCount.textContent =
            state.domesticTours.length;
    }

    if (elements.internationalCount) {
        elements.internationalCount.textContent =
            state.internationalTours.length;
    }
}


function applyFilters() {

    const query =
        state.search.trim().toLowerCase();

    let tours = [...state.allTours];


    // Type
    if (state.type !== "all") {

        tours = tours.filter(
            tour =>
                tour.type === state.type
        );
    }


    // Search
    if (query) {

        tours = tours.filter(tour => {

            const searchable = [
                tour.title,
                tour.destination,
                tour.country,
                tour.description,
                tour.duration
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(query);
        });
    }


    // Sort
    switch (state.sort) {

        case "price-low":

            tours.sort(
                (a, b) =>
                    a.price - b.price
            );

            break;


        case "price-high":

            tours.sort(
                (a, b) =>
                    b.price - a.price
            );

            break;


        case "duration-short":

            tours.sort(
                (a, b) =>
                    getDurationNumber(a.duration) -
                    getDurationNumber(b.duration)
            );

            break;


        case "duration-long":

            tours.sort(
                (a, b) =>
                    getDurationNumber(b.duration) -
                    getDurationNumber(a.duration)
            );

            break;


        default:

            tours.sort(
                (a, b) =>
                    Number(b.featured) -
                    Number(a.featured)
            );

            break;
    }


    state.filteredTours = tours;

    renderTours();
}


function getDurationNumber(duration) {

    const match =
        String(duration || "").match(/\d+/);

    return match
        ? Number(match[0])
        : 999;
}


/* =========================================================
   TOUR RENDERING
   ========================================================= */

function renderTours() {

    const domestic = state.filteredTours.filter(
        tour => tour.type === "domestic"
    );

    const international = state.filteredTours.filter(
        tour => tour.type === "international"
    );


    renderTourGroup(
        elements.domesticTours,
        domestic,
        elements.domesticEmpty
    );


    renderTourGroup(
        elements.internationalTours,
        international,
        elements.internationalEmpty
    );


    updateCategoryVisibility(
        domestic.length,
        international.length
    );
}


function renderTourGroup(container, tours, emptyElement) {

    if (!container) {
        return;
    }


    if (!tours.length) {

        container.innerHTML = "";

        if (emptyElement) {
            emptyElement.classList.remove("hidden");
        }

        return;
    }


    if (emptyElement) {
        emptyElement.classList.add("hidden");
    }


    container.innerHTML =
        tours.map(createTourCard).join("");


    attachImageFallbacks(container);
}


function updateCategoryVisibility(
    domesticCount,
    internationalCount
) {

    const filterIsDomestic =
        state.type === "domestic";

    const filterIsInternational =
        state.type === "international";


    if (elements.domesticSection) {

        elements.domesticSection.classList.toggle(
            "hidden",
            filterIsInternational
        );
    }


    if (elements.internationalSection) {

        elements.internationalSection.classList.toggle(
            "hidden",
            filterIsDomestic
        );
    }


    if (
        domesticCount === 0 &&
        internationalCount === 0 &&
        state.allTours.length > 0
    ) {

        if (elements.domesticSection) {
            elements.domesticSection.classList.remove("hidden");
        }

        if (elements.internationalSection) {
            elements.internationalSection.classList.remove("hidden");
        }
    }
}


function createTourCard(tour) {

    const safeId =
        encodeURIComponent(tour.id);

    const safeImage =
        escapeHtml(tour.image);

    const badge =
        tour.type === "domestic"
            ? "Domestic"
            : "International";


    return `
        <article
            class="tour-card"
            data-tour-id="${safeId}"
        >

            <div class="tour-image-wrap">

                <img
                    class="tour-image"
                    src="${safeImage}"
                    alt="${escapeHtml(tour.title)}"
                    loading="lazy"
                    data-tour-image
                >

                <span class="tour-badge">
                    ${badge}
                </span>

                <span class="tour-price">
                    ${formatPrice(tour.price)}
                </span>

            </div>


            <div class="tour-content">

                <div class="tour-location">
                    <span>⌖</span>
                    ${escapeHtml(tour.destination)}
                </div>


                <h4>
                    ${escapeHtml(tour.title)}
                </h4>


                <p class="tour-description">
                    ${escapeHtml(tour.description)}
                </p>


                <div class="tour-meta">

                    <span class="tour-meta-item">
                        <strong>Duration:</strong>
                        ${escapeHtml(tour.duration)}
                    </span>

                    <span class="tour-meta-item">
                        <strong>Type:</strong>
                        ${badge}
                    </span>

                </div>


                <button
                    class="tour-book"
                    type="button"
                    data-book-tour="${safeId}"
                >
                    View & book
                </button>

            </div>

        </article>
    `;
}


function attachImageFallbacks(container) {

    const images =
        container.querySelectorAll("[data-tour-image]");


    images.forEach(image => {

        image.addEventListener(
            "error",
            () => {

                if (
                    image.dataset.fallbackApplied === "true"
                ) {
                    return;
                }

                image.dataset.fallbackApplied = "true";

                image.src =
                    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";
            },
            { once: true }
        );
    });
}


/* =========================================================
   BOOKING
   ========================================================= */

function findTourById(tourId) {

    return state.allTours.find(
        tour =>
            String(tour.id) === String(tourId)
    );
}


function openBooking(tourId) {

    const tour = findTourById(tourId);

    if (!tour) {

        showToast(
            "Tour unavailable",
            "This tour could not be found.",
            "error"
        );

        return;
    }


    state.selectedTour = tour;


    elements.bookingTourId.value =
        tour.id;

    elements.bookingTourName.textContent =
        tour.title;

    elements.bookingTourMeta.textContent =
        `${tour.destination} · ${tour.duration}`;

    elements.bookingTourImage.src =
        tour.image;

    elements.bookingTourImage.alt =
        tour.title;

    elements.bookingCountry.value =
        state.country?.code || "";


    setMinBookingDate();

    openModal(elements.bookingModal);
}


function validateBookingForm() {

    const fields = [
        elements.bookingName,
        elements.bookingEmail,
        elements.bookingPhone,
        elements.bookingGuests,
        elements.bookingDate
    ];


    fields.forEach(field => {

        if (field) {
            field.classList.remove("input-error");
        }
    });


    let valid = true;


    if (
        !elements.bookingName.value.trim() ||
        elements.bookingName.value.trim().length < 2
    ) {

        elements.bookingName.classList.add("input-error");
        valid = false;
    }


    const email =
        elements.bookingEmail.value.trim();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        elements.bookingEmail.classList.add("input-error");
        valid = false;
    }


    if (
        elements.bookingPhone.value.trim().length < 5
    ) {

        elements.bookingPhone.classList.add("input-error");
        valid = false;
    }


    const guests =
        Number(elements.bookingGuests.value);


    if (
        !Number.isInteger(guests) ||
        guests < 1 ||
        guests > 50
    ) {

        elements.bookingGuests.classList.add("input-error");
        valid = false;
    }


    if (
        !isValidDate(elements.bookingDate.value)
    ) {

        elements.bookingDate.classList.add("input-error");
        valid = false;
    }


    return valid;
}


async function submitBooking(event) {

    event.preventDefault();


    if (!state.selectedTour) {

        showToast(
            "Select a tour",
            "Please select a tour before booking.",
            "error"
        );

        return;
    }


    if (!validateBookingForm()) {

        showToast(
            "Check your details",
            "Please complete all booking fields correctly.",
            "error"
        );

        return;
    }


    elements.bookingSubmit.disabled = true;

    elements.bookingSubmit.innerHTML =
        "Sending request...";


    const payload = {

        tourId:
            state.selectedTour.id,

        name:
            elements.bookingName.value.trim(),

        email:
            elements.bookingEmail.value.trim(),

        phone:
            elements.bookingPhone.value.trim(),

        travelDate:
            elements.bookingDate.value,

        guests:
            Number(elements.bookingGuests.value),

        country:
            state.country?.code || ""
    };


    try {

        const data =
            await apiRequest(
                "/api/bookings",
                {
                    method: "POST",
                    body: JSON.stringify(payload)
                }
            );


        closeModal(elements.bookingModal);

        elements.bookingForm.reset();

        showToast(
            "Booking request sent",
            data?.reference
                ? `Your reference is ${data.reference}.`
                : "Your booking request has been received."
        );


    } catch (error) {

        console.error(
            "Booking error:",
            error
        );


        showToast(
            "Booking failed",
            error.message ||
            "We could not send your booking request.",
            "error"
        );

    } finally {

        elements.bookingSubmit.disabled = false;

        elements.bookingSubmit.innerHTML =
            `Send booking request <span>→</span>`;
    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            ".nav-link, .mobile-nav a"
        );


    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                if (
                    elements.mobileNav &&
                    elements.mobileMenuButton
                ) {

                    elements.mobileNav.classList.remove("open");

                    elements.mobileMenuButton
                        .setAttribute(
                            "aria-expanded",
                            "false"
                        );
                }
            }
        );
    });


    const sections = [
        document.getElementById("home"),
        document.getElementById("tours"),
        document.getElementById("why-us"),
        document.getElementById("contact")
    ].filter(Boolean);


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const id =
                        entry.target.id;


                    document
                        .querySelectorAll(".nav-link")
                        .forEach(link => {

                            link.classList.toggle(
                                "active",
                                link.getAttribute("href") === `#${id}`
                            );
                        });
                });

            },
            {
                rootMargin: "-35% 0px -55% 0px"
            }
        );


    sections.forEach(
        section =>
            observer.observe(section)
    );
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    if (
        !elements.mobileMenuButton ||
        !elements.mobileNav
    ) {
        return;
    }


    elements.mobileMenuButton.addEventListener(
        "click",
        () => {

            const open =
                elements.mobileNav.classList.toggle("open");

            elements.mobileMenuButton.setAttribute(
                "aria-expanded",
                String(open)
            );
        }
    );
}


/* =========================================================
   MODALS
   ========================================================= */

function setupModals() {

    if (elements.countryButton) {

        elements.countryButton.addEventListener(
            "click",
            openCountryModal
        );
    }


    if (elements.heroCountryButton) {

        elements.heroCountryButton.addEventListener(
            "click",
            openCountryModal
        );
    }


    if (elements.closeCountryModal) {

        elements.closeCountryModal.addEventListener(
            "click",
            () =>
                closeModal(elements.countryModal)
        );
    }


    if (elements.closeBookingModal) {

        elements.closeBookingModal.addEventListener(
            "click",
            () =>
                closeModal(elements.bookingModal)
        );
    }


    document.addEventListener(
        "click",
        event => {

            const countryClose =
                event.target.closest(
                    "[data-close-country-modal]"
                );

            const bookingClose =
                event.target.closest(
                    "[data-close-booking-modal]"
                );


            if (countryClose) {

                closeModal(
                    elements.countryModal
                );
            }


            if (bookingClose) {

                closeModal(
                    elements.bookingModal
                );
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeModal(elements.countryModal);
            closeModal(elements.bookingModal);
        }
    );


    if (elements.countryList) {

        elements.countryList.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-country-code]"
                    );

                if (!button) {
                    return;
                }


                const code =
                    button.dataset.countryCode;

                await selectCountry(code);
            }
        );
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-book-tour]"
                );

            if (!button) {
                return;
            }


            const encodedId =
                button.dataset.bookTour;


            let tourId = encodedId;

            try {
                tourId = decodeURIComponent(encodedId);
            } catch {
                // Keep original ID.
            }


            openBooking(tourId);
        }
    );
}


/* =========================================================
   FILTERS
   ========================================================= */

function setupFilters() {

    if (elements.tourSearch) {

        elements.tourSearch.addEventListener(
            "input",
            event => {

                state.search =
                    event.target.value || "";

                applyFilters();
            }
        );
    }


    if (elements.tourType) {

        elements.tourType.addEventListener(
            "change",
            event => {

                state.type =
                    event.target.value;

                applyFilters();
            }
        );
    }


    if (elements.tourSort) {

        elements.tourSort.addEventListener(
            "change",
            event => {

                state.sort =
                    event.target.value;

                applyFilters();
            }
        );
    }
}


/* =========================================================
   BACKEND HEALTH
   ========================================================= */

async function checkBackendHealth() {

    try {

        const data =
            await apiRequest("/api/health");

        console.log(
            "TourVista backend:",
            data
        );

        return true;

    } catch (error) {

        console.warn(
            "TourVista backend is not reachable:",
            error.message
        );

        return false;
    }
}


/* =========================================================
   RETRY
   ========================================================= */

function setupRetry() {

    if (!elements.retryButton) {
        return;
    }


    elements.retryButton.addEventListener(
        "click",
        async () => {

            setError("");

            await loadTours();
        }
    );
}


/* =========================================================
   YEAR
   ========================================================= */

function setCurrentYear() {

    if (elements.currentYear) {

        elements.currentYear.textContent =
            new Date().getFullYear();
    }
}


/* =========================================================
   INIT
   ========================================================= */

async function init() {

    setCurrentYear();

    setMinBookingDate();

    setupNavigation();

    setupMobileMenu();

    setupModals();

    setupFilters();

    setupRetry();

    if (elements.bookingForm) {

        elements.bookingForm.addEventListener(
            "submit",
            submitBooking
        );
    }


    try {

        /*
         * First load country list.
         */
        await loadCountries();


        /*
         * Then determine visitor country.
         */
        await detectCountry();


        /*
         * Update all country UI.
         */
        updateCountryUI();


        /*
         * Finally load tours for selected country.
         */
        await loadTours();


        /*
         * Health check is non-blocking.
         */
        checkBackendHealth();

    } catch (error) {

        console.error(
            "TourVista initialization failed:",
            error
        );


        setError(
            error.message ||
            "TourVista could not start correctly."
        );
    }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);