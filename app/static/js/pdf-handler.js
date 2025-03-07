class PDFHandler {
    constructor(form) {
        this.form = form;
        this.formId = form.closest(".card").id; // 'combine' or 'compress'
        this.fileInput = form.querySelector('input[type="file"]');
        this.setupPreviewContainer();
        this.setupFeedbackContainer();
        this.setupEventListeners();
    }

    setupPreviewContainer() {
        this.previewContainer = document.createElement("div");
        this.previewContainer.className = "pdf-preview-list";
        this.previewContainer.setAttribute("role", "list");
        this.previewContainer.setAttribute("aria-label", "Selected PDF files");

        // Insert preview container after the file input
        this.fileInput.parentNode.insertBefore(
            this.previewContainer,
            this.fileInput.nextSibling
        );
    }

    setupFeedbackContainer() {
        const formControls = this.form.querySelector(".form-controls, .form-group");
        this.feedbackContainer = new FeedbackContainer(formControls);
    }

    setupEventListeners() {
        // File selection handler
        this.fileInput.addEventListener("change", () =>
            this.handleFileSelect()
        );

        // Form submission handler
        this.form.addEventListener("submit", async (e) => this.handleSubmit(e));
    }

    async handleFileSelect() {
        this.previewContainer.innerHTML = ""; // Clear previous previews
        const files = Array.from(this.fileInput.files);

        if (files.length === 0) {
            this.previewContainer.style.display = "none";
            return;
        }

        this.previewContainer.style.display = "grid";

        for (const file of files) {
            if (file.type !== "application/pdf") continue;

            const previewItem = this.createPreviewItem(file);
            this.previewContainer.appendChild(previewItem);

            try {
                // Create object URL for the PDF
                const objectUrl = URL.createObjectURL(file);

                // Load the PDF using pdf.js
                const pdf = await pdfjsLib.getDocument(objectUrl).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.3 }); // Adjust scale as needed

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // Replace loading indicator with the preview
                const previewImage = previewItem.querySelector(
                    ".preview-placeholder"
                );
                previewImage.src = canvas.toDataURL();
                previewImage.classList.remove("loading");

                // Cleanup
                URL.revokeObjectURL(objectUrl);
            } catch (error) {
                console.error("Error generating PDF preview:", error);
                // Show error state in preview
                const previewImage = previewItem.querySelector(
                    ".preview-placeholder"
                );
                previewImage.classList.remove("loading");
                previewImage.classList.add("error");
            }
        }
    }

    createPreviewItem(file) {
        const item = document.createElement("div");
        item.className = "pdf-preview-item";
        item.setAttribute("role", "listitem");

        const previewImage = document.createElement("img");
        previewImage.className = "preview-placeholder loading";
        previewImage.alt = `Preview of ${file.name}`;
        previewImage.src =
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v14h10V5H7z"/%3E%3C/svg%3E';

        const details = document.createElement("div");
        details.className = "pdf-preview-details";

        const fileName = document.createElement("span");
        fileName.className = "pdf-preview-filename";
        fileName.textContent = file.name;

        const fileSize = document.createElement("span");
        fileSize.className = "pdf-preview-size";
        fileSize.textContent = this.formatFileSize(file.size);

        details.appendChild(fileName);
        details.appendChild(fileSize);
        item.appendChild(previewImage);
        item.appendChild(details);

        return item;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    async handleSubmit(e) {
        e.preventDefault();

        try {
            const formData = new FormData(this.form);
            const submitButton = this.form.querySelector(
                'button[type="submit"]'
            );
            const originalButtonText = submitButton.textContent;

            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent =
                this.formId === "combine"
                    ? "Combining PDFs..."
                    : "Compressing PDF...";

            const response = await fetch(this.form.action, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorMsg = await response.json();
                if (errorMsg?.detail) {
                    throw new Error(`${errorMsg.detail}`);
                } else {
                    throw new Error(`${response.statusText}`);
                }
            }

            // Get the blob from the response
            const blob = await response.blob();

            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename =
                this.formId === "combine"
                    ? `combined-${timestamp}.pdf`
                    : `compressed-${timestamp}.pdf`;

            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            // Show success message
            this.showFeedback(
                "success",
                this.formId === "combine"
                    ? "PDFs combined successfully!"
                    : "PDF compressed successfully!"
            );

            // Clear the form and preview
            this.form.reset();
            this.previewContainer.innerHTML = "";
            this.previewContainer.style.display = "none";
        } catch (error) {
            console.error("Error:", error);
            this.showFeedback("error", `An error occurred: ${error.message}`);
        } finally {
            // Reset button state
            const submitButton = this.form.querySelector(
                'button[type="submit"]'
            );
            submitButton.disabled = false;
            submitButton.textContent =
                this.formId === "combine" ? "Combine PDFs" : "Compress PDF";
        }
    }

    showFeedback(type, message) {
        this.feedbackContainer.show(type, message);
    }
}

// Initialize handlers for all PDF forms
document.addEventListener("DOMContentLoaded", () => {
    // Check if we're on the PDF route
    if (window.location.pathname.includes("/pdf")) {
        const pdfForms = document.querySelectorAll('form[action^="/pdf/"]');
        pdfForms.forEach((form) => new PDFHandler(form));
    }
});
