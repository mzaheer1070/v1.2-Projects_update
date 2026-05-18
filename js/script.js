const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;

    try {
        localStorage.setItem("portfolio-theme", theme);
    } catch (error) {
        document.documentElement.dataset.theme = theme;
    }
}

function setupThemeToggle() {
    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("portfolio-theme");
    } catch (error) {
        savedTheme = null;
    }

    const fallbackTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(savedTheme || fallbackTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            setTheme(nextTheme);
        });
    });
}

function setupNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".nav-panel");
    const page = document.body.dataset.page;

    document.querySelectorAll(".nav-link").forEach((link) => {
        const targetPage = link.getAttribute("href").replace(".html", "").replace("index", "home");

        if (targetPage === page) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }

        link.addEventListener("click", () => {
            if (!toggle || !panel) return;
            toggle.setAttribute("aria-expanded", "false");
            panel.classList.remove("is-open");
            document.body.classList.remove("nav-open");
        });
    });

    if (!toggle || !panel) return;

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        panel.classList.toggle("is-open", !isOpen);
        document.body.classList.toggle("nav-open", !isOpen);
    });
}

function setupRevealAnimations() {
    const revealItems = document.querySelectorAll("[data-reveal]");

    if (!revealItems.length || prefersReducedMotion) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    document.body.classList.add("reveal-ready");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    revealItems.forEach((item) => observer.observe(item));
}

function setupTypedRoles() {
    const role = document.querySelector("[data-roles]");
    if (!role || prefersReducedMotion) return;

    const roles = role.dataset.roles.split("|").map((item) => item.trim()).filter(Boolean);
    if (roles.length < 2) return;

    let roleIndex = 0;

    window.setInterval(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        role.textContent = roles[roleIndex];
    }, 2200);
}

function setupCounters() {
    const counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    const runCounter = (counter) => {
        const target = Number(counter.dataset.countTo);
        const duration = prefersReducedMotion ? 1 : 900;
        const startTime = performance.now();

        const tick = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            counter.textContent = Math.round(target * progress);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCounter(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.6 });

    counters.forEach((counter) => observer.observe(counter));
}

function setupTabs() {
    document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
        const buttons = tabGroup.querySelectorAll("[data-tab]");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                buttons.forEach((item) => {
                    const panel = document.getElementById(item.dataset.tab);
                    const active = item === button;

                    item.classList.toggle("is-active", active);
                    item.setAttribute("aria-selected", String(active));

                    if (panel) {
                        panel.hidden = !active;
                    }
                });
            });
        });
    });
}

function setupProjectFilters() {
    const filters = document.querySelectorAll("[data-filter]");
    const cards = document.querySelectorAll(".project-card[data-category]");

    if (!filters.length || !cards.length) return;

    filters.forEach((filter) => {
        filter.addEventListener("click", () => {
            const selected = filter.dataset.filter;

            filters.forEach((button) => {
                const active = button === filter;
                button.classList.toggle("is-active", active);
                button.setAttribute("aria-pressed", String(active));
            });

            cards.forEach((card) => {
                const categories = card.dataset.category.split(" ");
                card.hidden = selected !== "all" && !categories.includes(selected);
            });
        });
    });
}

function setupCardDetails() {
    document.querySelectorAll(".project-card .card-toggle").forEach((button) => {
        const card = button.closest(".project-card");
        const details = card ? card.querySelector(".card-details") : null;
        if (!details) return;

        button.addEventListener("click", () => {
            const expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!expanded));
            button.textContent = expanded ? "View details" : "Hide details";
            details.hidden = expanded;
        });
    });
}

function setupContactForm() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const fields = Array.from(form.querySelectorAll("input, textarea"));
    const message = form.querySelector("[data-count-input]");
    const count = form.querySelector("[data-char-count]");
    const status = form.querySelector(".form-status");
    const submitButton = form.querySelector("button[type='submit']");

    const setError = (field, messageText) => {
        const error = form.querySelector(`[data-error-for="${field.name}"]`);
        field.classList.toggle("is-invalid", Boolean(messageText));

        if (error) {
            error.textContent = messageText;
        }
    };

    const validateField = (field) => {
        const value = field.value.trim();
        let messageText = "";

        if (!value) {
            messageText = `${field.previousElementSibling.textContent} is required.`;
        } else if (field.type === "email" && !field.validity.valid) {
            messageText = "Enter a valid email address.";
        } else if (field.name === "message" && value.length < 12) {
            messageText = "Message should be at least 12 characters.";
        }

        setError(field, messageText);
        return !messageText;
    };

    const updateCount = () => {
        if (!message || !count) return;
        count.textContent = `${message.value.length} / ${message.maxLength}`;
    };

    fields.forEach((field) => {
        field.addEventListener("input", () => {
            validateField(field);
            updateCount();
        });
        field.addEventListener("blur", () => validateField(field));
    });

    updateCount();

    form.addEventListener("submit", (event) => {
        const valid = fields.map(validateField).every(Boolean);

        if (!valid) {
            event.preventDefault();
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) firstInvalid.focus();
            if (status) status.textContent = "Please fix the highlighted fields before sending.";
            return;
        }

        if (status) status.textContent = "Sending your message...";
        if (submitButton) submitButton.disabled = true;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupNavigation();
    setupRevealAnimations();
    setupTypedRoles();
    setupCounters();
    setupTabs();
    setupProjectFilters();
    setupCardDetails();
    setupContactForm();
});
