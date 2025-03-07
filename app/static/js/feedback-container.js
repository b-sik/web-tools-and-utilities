class FeedbackContainer {
    constructor(parentElement, options = {}) {
        this.container = document.createElement("div");
        this.container.className = "feedback-container";
        this.container.setAttribute("role", "status");
        this.container.setAttribute("aria-live", "polite");

        // Add basic styles inline to ensure visibility
        this.container.style.cssText = `
            margin: 1rem 0;
            padding: 1rem;
            border-radius: 0.375rem;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;

        // Insert after the specified element or as last child
        if (parentElement) {
            const targetElement = options.insertAfter || parentElement;
            targetElement.parentNode.insertBefore(
                this.container,
                targetElement.nextSibling
            );
        }
    }

    show(type, message) {
        try {
            console.log("Showing feedback:", type, message);

            if (!this.container) {
                console.error("Feedback container not found");
                return;
            }

            // Clear any existing feedback
            this.container.className = "feedback-container";
            this.container.textContent = "";
            this.container.style.display = "none";

            // Force a reflow
            void this.container.offsetWidth;

            // Add the new feedback
            const feedbackClass = type === "success" ? "feedback-success" : "feedback-error";
            this.container.className = "feedback-container " + feedbackClass;
            this.container.textContent = message;

            // Show the feedback with transition
            this.container.style.display = "block";
            setTimeout(() => {
                this.container.style.opacity = "1";
            }, 10);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.container.style.opacity = "0";
                setTimeout(() => {
                    this.container.style.display = "none";
                    this.container.className = "feedback-container";
                    this.container.textContent = "";
                }, 300);
            }, 5000);
        } catch (error) {
            console.error("Error showing feedback:", error);
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackContainer;
} else {
    window.FeedbackContainer = FeedbackContainer;
} 