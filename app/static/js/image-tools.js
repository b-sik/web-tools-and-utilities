// Quality slider functionality
const qualityInput = document.getElementById('quality');
const qualityOutput = document.getElementById('quality-value');
if (qualityInput && qualityOutput) {
    qualityInput.addEventListener('input', function() {
        qualityOutput.textContent = this.value;
    });
}

// Image resize preview functionality
const fileInput = document.getElementById('file');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const maintainAspect = document.getElementById('maintain-aspect');
const widthDisplay = document.getElementById('image-width');
const heightDisplay = document.getElementById('image-height');
const resizeForm = document.getElementById('resize-form');
let originalWidth = 0;
let originalHeight = 0;
let aspectRatio = 1;

if (fileInput && previewContainer && previewImage) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.onload = function() {
                    originalWidth = this.naturalWidth;
                    originalHeight = this.naturalHeight;
                    aspectRatio = originalWidth / originalHeight;
                    
                    // Set initial dimensions
                    widthInput.value = originalWidth;
                    heightInput.value = originalHeight;
                    updateDimensionsDisplay(originalWidth, originalHeight);
                    
                    // Show preview
                    previewContainer.style.display = 'block';
                    
                    // Scale image to fit container while maintaining aspect ratio
                    const containerWidth = previewContainer.clientWidth - 64; // Account for padding
                    const scale = Math.min(1, containerWidth / originalWidth);
                    const scaledWidth = originalWidth * scale;
                    const scaledHeight = originalHeight * scale;
                    
                    previewImage.style.width = scaledWidth + 'px';
                    previewImage.style.height = scaledHeight + 'px';
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle resize handles dragging
    const handles = document.querySelectorAll('.resize-handle');
    let isDragging = false;
    let currentHandle = null;
    let startX, startY, startWidth, startHeight;

    handles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
        handle.addEventListener('touchstart', startResize);
    });

    document.addEventListener('mousemove', resize);
    document.addEventListener('touchmove', resize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchend', stopResize);

    function startResize(e) {
        isDragging = true;
        currentHandle = e.target;
        
        const rect = previewImage.getBoundingClientRect();
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        startWidth = rect.width;
        startHeight = rect.height;

        e.preventDefault();
    }

    function resize(e) {
        if (!isDragging) return;

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;

        // Calculate new dimensions based on which handle is being dragged
        if (currentHandle.classList.contains('bottom-right')) {
            newWidth = startWidth + dx;
            if (maintainAspect.checked) {
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = startHeight + dy;
            }
        } else if (currentHandle.classList.contains('bottom-left')) {
            newWidth = startWidth - dx;
            if (maintainAspect.checked) {
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = startHeight + dy;
            }
        } else if (currentHandle.classList.contains('top-right')) {
            newWidth = startWidth + dx;
            if (maintainAspect.checked) {
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = startHeight - dy;
            }
        } else if (currentHandle.classList.contains('top-left')) {
            newWidth = startWidth - dx;
            if (maintainAspect.checked) {
                newHeight = newWidth / aspectRatio;
            } else {
                newHeight = startHeight - dy;
            }
        }

        // Ensure minimum dimensions
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        // Update preview maintaining container constraints
        const containerWidth = previewContainer.clientWidth - 64; // Account for padding
        const scale = Math.min(1, containerWidth / newWidth);
        const scaledWidth = newWidth * scale;
        const scaledHeight = newHeight * scale;
        
        previewImage.style.width = scaledWidth + 'px';
        previewImage.style.height = scaledHeight + 'px';

        // Update inputs with unscaled dimensions
        widthInput.value = Math.round(newWidth);
        heightInput.value = Math.round(newHeight);
        updateDimensionsDisplay(newWidth, newHeight);

        e.preventDefault();
    }

    function stopResize() {
        isDragging = false;
        currentHandle = null;
    }

    function updateDimensionsDisplay(width, height) {
        widthDisplay.textContent = Math.round(width);
        heightDisplay.textContent = Math.round(height);
    }

    // Handle manual input changes
    if (widthInput && heightInput) {
        widthInput.addEventListener('input', function() {
            if (maintainAspect.checked) {
                heightInput.value = Math.round(this.value / aspectRatio);
            }
            updatePreview();
        });

        heightInput.addEventListener('input', function() {
            if (maintainAspect.checked) {
                widthInput.value = Math.round(this.value * aspectRatio);
            }
            updatePreview();
        });
    }

    function updatePreview() {
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        const containerWidth = previewContainer.clientWidth - 64; // Account for padding
        const scale = Math.min(1, containerWidth / width);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        previewImage.style.width = scaledWidth + 'px';
        previewImage.style.height = scaledHeight + 'px';
        updateDimensionsDisplay(width, height);
    }

    // Add event listener for aspect ratio changes
    if (maintainAspect) {
        maintainAspect.addEventListener('change', function() {
            if (this.checked && originalWidth > 0) {
                // Recalculate height based on current width to maintain aspect ratio
                const currentWidth = parseInt(widthInput.value);
                heightInput.value = Math.round(currentWidth / aspectRatio);
                updatePreview();
            }
        });
    }
}

class ImageHandler {
    constructor(form) {
        if (!form) {
            console.error('No form provided to ImageHandler');
            return;
        }
        
        this.form = form;
        this.formId = form.closest('.card')?.id; // 'resize', 'convert', or 'optimize'
        
        if (!this.formId) {
            console.error('Could not determine form ID');
            return;
        }
        
        console.log('Initializing ImageHandler for form:', this.formId);
        
        this.fileInput = form.querySelector('input[type="file"]');
        if (!this.fileInput) {
            console.error('No file input found in form');
            return;
        }
        
        // Setup containers first
        this.setupPreviewContainer();
        this.setupFeedbackContainer();
        
        // Then add event listeners
        this.setupEventListeners();

        // Special handling for optimize form
        if (this.formId === 'optimize') {
            this.setupQualitySlider();
        }

        // Initialize resize-specific properties
        if (this.formId === 'resize') {
            this.originalWidth = 0;
            this.originalHeight = 0;
            this.aspectRatio = 1;
            this.isDragging = false;
            this.currentHandle = null;
            this.setupResizeHandles();
        }
    }

    setupPreviewContainer() {
        // For resize form, use existing preview container
        if (this.formId === 'resize') {
            this.previewContainer = this.form.querySelector('.image-preview-container');
            this.previewImage = this.previewContainer.querySelector('#preview-image');
            this.widthInput = this.form.querySelector('#width');
            this.heightInput = this.form.querySelector('#height');
            this.maintainAspect = this.form.querySelector('#maintain-aspect');
            this.widthDisplay = this.previewContainer.querySelector('#image-width');
            this.heightDisplay = this.previewContainer.querySelector('#image-height');
            return;
        }

        // For other forms, create new preview container
        this.previewContainer = document.createElement('div');
        this.previewContainer.className = 'image-preview-container';
        this.previewContainer.style.cssText = `
            max-width: 100%;
            overflow: hidden;
            margin: 1rem 0;
            display: none;
        `;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'image-preview-wrapper';
        wrapper.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 100%;
        `;
        
        this.previewImage = document.createElement('img');
        this.previewImage.id = `preview-image-${this.formId}`;
        this.previewImage.alt = 'Preview';
        this.previewImage.style.cssText = `
            max-width: 100%;
            height: auto;
            object-fit: contain;
        `;
        
        wrapper.appendChild(this.previewImage);
        this.previewContainer.appendChild(wrapper);
        
        // Insert after form controls
        const formControls = this.form.querySelector('.form-controls');
        formControls.parentNode.insertBefore(this.previewContainer, formControls.nextSibling);
    }

    setupFeedbackContainer() {
        try {
            // Create feedback container if it doesn't exist
            if (!this.feedbackContainer) {
                this.feedbackContainer = document.createElement('div');
                this.feedbackContainer.className = 'feedback-container';
                this.feedbackContainer.setAttribute('role', 'status');
                this.feedbackContainer.setAttribute('aria-live', 'polite');
                
                // Add some basic styles inline to ensure visibility
                this.feedbackContainer.style.cssText = `
                    margin: 1rem 0;
                    padding: 1rem;
                    border-radius: 0.375rem;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                `;
                
                // Insert after the form controls
                const formControls = this.form.querySelector('.form-controls');
                if (formControls) {
                    formControls.parentNode.insertBefore(this.feedbackContainer, formControls.nextSibling);
                } else {
                    this.form.appendChild(this.feedbackContainer);
                }
            }
        } catch (error) {
            console.error('Error setting up feedback container:', error);
        }
    }

    setupEventListeners() {
        // File selection handler
        this.fileInput.addEventListener('change', () => this.handleFileSelect());
        
        // Form submission handler
        this.form.addEventListener('submit', async (e) => this.handleSubmit(e));

        // For resize form, handle dimension inputs
        if (this.formId === 'resize') {
            this.widthInput.addEventListener('input', () => this.updateDimensions('width'));
            this.heightInput.addEventListener('input', () => this.updateDimensions('height'));
            this.maintainAspect.addEventListener('change', () => {
                if (this.maintainAspect.checked && this.widthInput.value) {
                    this.updateDimensions('width');
                }
            });
        }
    }

    setupQualitySlider() {
        const qualityInput = this.form.querySelector('#quality');
        const qualityOutput = this.form.querySelector('#quality-value');
        
        qualityInput.addEventListener('input', () => {
            qualityOutput.textContent = qualityInput.value;
        });
    }

    setupResizeHandles() {
        const handles = this.previewContainer.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => this.startResize(e));
            handle.addEventListener('touchstart', (e) => this.startResize(e));
        });

        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('touchmove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        document.addEventListener('touchend', () => this.stopResize());
    }

    startResize(e) {
        this.isDragging = true;
        this.currentHandle = e.target;
        
        const rect = this.previewImage.getBoundingClientRect();
        this.startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        this.startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        this.startWidth = rect.width;
        this.startHeight = rect.height;

        e.preventDefault();
    }

    resize(e) {
        if (!this.isDragging) return;

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        
        const dx = clientX - this.startX;
        const dy = clientY - this.startY;
        
        let newWidth = this.startWidth;
        let newHeight = this.startHeight;

        // Calculate new dimensions based on which handle is being dragged
        if (this.currentHandle.classList.contains('bottom-right')) {
            newWidth = this.startWidth + dx;
            newHeight = this.maintainAspect.checked ? newWidth / this.aspectRatio : this.startHeight + dy;
        } else if (this.currentHandle.classList.contains('bottom-left')) {
            newWidth = this.startWidth - dx;
            newHeight = this.maintainAspect.checked ? newWidth / this.aspectRatio : this.startHeight + dy;
        } else if (this.currentHandle.classList.contains('top-right')) {
            newWidth = this.startWidth + dx;
            newHeight = this.maintainAspect.checked ? newWidth / this.aspectRatio : this.startHeight - dy;
        } else if (this.currentHandle.classList.contains('top-left')) {
            newWidth = this.startWidth - dx;
            newHeight = this.maintainAspect.checked ? newWidth / this.aspectRatio : this.startHeight - dy;
        }

        // Ensure minimum dimensions and update preview
        this.updatePreviewSize(Math.max(50, newWidth), Math.max(50, newHeight));
        e.preventDefault();
    }

    stopResize() {
        this.isDragging = false;
        this.currentHandle = null;
    }

    updatePreviewSize(width, height) {
        const containerWidth = this.previewContainer.clientWidth - 64; // Account for padding
        const scale = Math.min(1, containerWidth / width);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        this.previewImage.style.width = scaledWidth + 'px';
        this.previewImage.style.height = scaledHeight + 'px';

        // Update inputs with unscaled dimensions
        this.widthInput.value = Math.round(width);
        this.heightInput.value = Math.round(height);
        this.updateDimensionsDisplay(width, height);
    }

    updateDimensionsDisplay(width, height) {
        if (this.formId === 'resize') {
            this.widthDisplay.textContent = Math.round(width);
            this.heightDisplay.textContent = Math.round(height);
        }
    }

    async handleFileSelect() {
        console.log('File selected:', this.fileInput.files[0]);
        const file = this.fileInput.files[0];
        if (!file) {
            this.previewContainer.style.display = 'none';
            return;
        }

        // Create object URL for the image
        const objectUrl = URL.createObjectURL(file);
        
        // Load image and update preview
        const img = new Image();
        img.onload = () => {
            console.log('Image loaded:', img.width, 'x', img.height);
            this.previewImage.src = objectUrl;
            this.previewContainer.style.display = 'block';
            
            // Check for transparency if this is the convert form
            if (this.formId === 'convert') {
                this.checkImageTransparency(img);
            }
            
            if (this.formId === 'resize') {
                // Store original dimensions for aspect ratio calculations
                this.originalWidth = img.naturalWidth;
                this.originalHeight = img.naturalHeight;
                this.aspectRatio = this.originalWidth / this.originalHeight;
                
                // Set initial dimensions if not already set
                if (!this.widthInput.value && !this.heightInput.value) {
                    this.updatePreviewSize(this.originalWidth, this.originalHeight);
                }
            }
        };
        
        img.src = objectUrl;
    }

    async handleSubmit(e) {
        console.log('Form submitted:', this.formId);
        e.preventDefault();
        
        // Validate file selection first
        const file = this.fileInput.files[0];
        if (!file) {
            this.showFeedback('error', 'Please select an image file.');
            return;
        }

        // Validate file type
        const fileType = file.type.toLowerCase();
        if (!fileType.startsWith('image/')) {
            this.showFeedback('error', 'Please select a valid image file.');
            return;
        }

        // Validate file name and extension
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
            this.showFeedback('error', 'Please select an image file with a valid extension (jpg, jpeg, png, gif, or webp).');
            return;
        }
        
        // For convert form, check format compatibility before submission
        if (this.formId === 'convert') {
            const format = this.form.querySelector('#format').value.toLowerCase();
            
            if (!file) {
                this.showFeedback('error', 'Please select an image file.');
                return;
            }

            // Check transparency before submitting
            if (format === 'jpeg' || format === 'jpg') {
                try {
                    console.log('Checking image transparency before JPEG conversion...');
                    // Create a blob URL to ensure we can load the image
                    const objectUrl = URL.createObjectURL(file);
                    const hasTransparency = await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            try {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                
                                // Get image data
                                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                const data = imageData.data;
                                
                                // Check for any transparent pixels
                                for (let i = 3; i < data.length; i += 4) {
                                    if (data[i] < 255) {
                                        resolve(true);
                                        return;
                                    }
                                }
                                resolve(false);
                            } catch (error) {
                                reject(error);
                            } finally {
                                URL.revokeObjectURL(objectUrl);
                            }
                        };
                        img.onerror = () => {
                            URL.revokeObjectURL(objectUrl);
                            reject(new Error('Failed to load image'));
                        };
                        img.src = objectUrl;
                    });

                    if (hasTransparency) {
                        console.log('Transparency detected, preventing JPEG conversion');
                        this.showFeedback('error', 'Cannot convert images with transparency to JPEG. Please select PNG format instead.');
                        
                        // Update format selector
                        const formatSelect = this.form.querySelector('#format');
                        if (formatSelect) {
                            formatSelect.value = 'png';
                            const jpegOption = Array.from(formatSelect.options).find(
                                option => option.value.toLowerCase() === 'jpeg' || 
                                         option.value.toLowerCase() === 'jpg'
                            );
                            if (jpegOption) {
                                jpegOption.disabled = true;
                                jpegOption.title = 'JPEG format does not support transparency';
                            }
                        }
                        return;
                    }
                } catch (error) {
                    console.error('Error checking transparency:', error);
                    this.showFeedback('error', 'Error checking image transparency. Please try a different image.');
                    return;
                }
            }
        }
        
        let processedImageUrl = null;
        let submitButton = this.form.querySelector('button[type="submit"]');
        let originalButtonText = submitButton.textContent;
        
        try {
            const formData = new FormData(this.form);
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Processing Image...';
            
            console.log('Sending request to:', this.form.action);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData
            });

            console.log('Response received:', response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error data:', errorData);
                let errorMessage = 'An error occurred while processing the image.';
                
                if (errorData?.detail) {
                    if (errorData.detail.includes('cannot write mode RGBA as JPEG')) {
                        errorMessage = 'Cannot convert image with transparency to JPEG. Please choose a different format like PNG.';
                    } else if (errorData.detail.includes("'latin-1' codec")) {
                        errorMessage = 'The filename contains special characters. Please rename the file using only basic letters and numbers.';
                    } else {
                        errorMessage = errorData.detail;
                    }
                }
                
                throw new Error(errorMessage);
            }

            // Get the blob from the response
            const blob = await response.blob();
            console.log('Received blob:', blob.type, blob.size);
            
            // Validate the response blob
            if (blob.size === 0) {
                throw new Error('The processed image is empty. Please try again with a different image or settings.');
            }

            if (!blob.type.startsWith('image/')) {
                throw new Error('The server returned an invalid image format. Please try again.');
            }
            
            // Create a download link and processed image URL
            const downloadUrl = window.URL.createObjectURL(blob);
            processedImageUrl = window.URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const originalFileName = this.fileInput.files[0].name;
            
            console.log('Processing filename:', originalFileName);
            
            // First sanitize the base filename
            const sanitizedFileName = originalFileName
                .normalize('NFD')  // Decompose Unicode characters
                .replace(/[\u0300-\u036f]/g, '')  // Remove diacritics
                .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')  // Replace special spaces
                .trim()  // Remove leading/trailing spaces
                .replace(/[^\w\s.-]/g, '_')  // Replace invalid chars (except spaces) with underscore
                .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                .replace(/^[.-]+|[.-]+$/g, '')  // Remove leading/trailing dots and hyphens
                .replace(/^$/, 'image');  // Use 'image' if filename becomes empty
            
            console.log('Sanitized filename:', sanitizedFileName);
            
            const fileExtension = blob.type.split('/')[1];
            const baseFileName = sanitizedFileName.replace(/\.[^/.]+$/, '');
            
            // Create the final filename with spaces preserved
            let filename;
            switch (this.formId) {
                case 'resize':
                    filename = `${baseFileName}-resized-${timestamp}.${fileExtension}`;
                    break;
                case 'convert':
                    filename = `${baseFileName}-converted-${timestamp}.${fileExtension}`;
                    break;
                case 'optimize':
                    filename = `${baseFileName}-optimized-${timestamp}.${fileExtension}`;
                    break;
            }
            
            console.log('Final filename:', filename);
            
            // Create download link with proper encoding
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            
            // Use a hidden form for better filename handling
            const form = document.createElement('form');
            form.style.display = 'none';
            form.method = 'post';
            form.appendChild(a);
            document.body.appendChild(form);
            
            a.click();
            
            // Clean up
            document.body.removeChild(form);
            window.URL.revokeObjectURL(downloadUrl);

            // Show success message with operation details
            let successMessage;
            switch (this.formId) {
                case 'resize':
                    successMessage = `Image resized to ${this.widthInput.value}×${this.heightInput.value} pixels`;
                    break;
                case 'convert':
                    const format = this.form.querySelector('#format').value.toUpperCase();
                    successMessage = `Image converted to ${format} format`;
                    break;
                case 'optimize':
                    const quality = this.form.querySelector('#quality').value;
                    successMessage = `Image optimized with ${quality}% quality`;
                    break;
            }
            
            // Update preview with processed image
            const processedImage = new Image();
            processedImage.onload = () => {
                this.previewImage.src = processedImageUrl;
                this.previewContainer.style.display = 'block';
                
                if (this.formId === 'resize') {
                    this.updatePreviewSize(
                        parseInt(this.widthInput.value),
                        parseInt(this.heightInput.value)
                    );
                }
                
                // Show success message after preview is loaded
                this.showFeedback('success', successMessage);
            };
            processedImage.onerror = () => {
                this.showFeedback('error', 'Failed to load processed image preview');
                if (processedImageUrl) {
                    window.URL.revokeObjectURL(processedImageUrl);
                }
            };
            processedImage.src = processedImageUrl;

            // Clear form for non-resize operations
            if (this.formId !== 'resize') {
                this.form.reset();
            }

        } catch (error) {
            console.error('Error in handleSubmit:', error);
            this.showFeedback('error', error.message);
            
            // Hide preview on error
            this.previewContainer.style.display = 'none';
            if (processedImageUrl) {
                window.URL.revokeObjectURL(processedImageUrl);
            }
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }

    checkImageTransparency(img) {
        console.log('Checking image transparency');
        // Create a canvas to check for transparency
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        try {
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Check for any transparent pixels
            let hasTransparency = false;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] < 255) {
                    hasTransparency = true;
                    break;
                }
            }
            
            console.log('Image has transparency:', hasTransparency);
            
            // Store the transparency info
            this.hasTransparency = hasTransparency;
            
            // If image has transparency, update format selector
            if (hasTransparency) {
                const formatSelect = this.form.querySelector('#format');
                if (formatSelect) {
                    const jpegOption = Array.from(formatSelect.options).find(
                        option => option.value.toLowerCase() === 'jpeg' || 
                                 option.value.toLowerCase() === 'jpg'
                    );
                    
                    if (jpegOption && formatSelect.value.toLowerCase() === jpegOption.value.toLowerCase()) {
                        // If JPEG is currently selected, switch to PNG
                        formatSelect.value = 'png';
                    }
                    
                    if (jpegOption) {
                        jpegOption.disabled = true;
                        jpegOption.title = 'JPEG format does not support transparency';
                    }
                    
                    this.showFeedback('error', 'This image contains transparency. JPEG format has been disabled as it does not support transparency. Please use PNG format instead.');
                }
            }
        } catch (error) {
            console.error('Error checking transparency:', error);
        }
    }

    showFeedback(type, message) {
        try {
            console.log('Showing feedback:', type, message);
            
            if (!this.feedbackContainer) {
                console.error('Feedback container not found');
                return;
            }
            
            // Clear any existing feedback
            this.feedbackContainer.className = 'feedback-container';
            this.feedbackContainer.textContent = '';
            this.feedbackContainer.style.display = 'none';
            
            // Force a reflow
            void this.feedbackContainer.offsetWidth;
            
            // Add the new feedback
            const feedbackClass = type === 'success' ? 'feedback-success' : 'feedback-error';
            this.feedbackContainer.className = 'feedback-container ' + feedbackClass;
            this.feedbackContainer.textContent = message;
            
            // Show the feedback with transition
            this.feedbackContainer.style.display = 'block';
            setTimeout(() => {
                this.feedbackContainer.style.opacity = '1';
            }, 10);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.feedbackContainer.style.opacity = '0';
                setTimeout(() => {
                    this.feedbackContainer.style.display = 'none';
                    this.feedbackContainer.className = 'feedback-container';
                    this.feedbackContainer.textContent = '';
                }, 300);
            }, 5000);
        } catch (error) {
            console.error('Error showing feedback:', error);
        }
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeImageHandlers);
} else {
    initializeImageHandlers();
}

function initializeImageHandlers() {
    try {
        console.log('Initializing image handlers...');
        const imageForms = document.querySelectorAll('form[action^="/image/"]');
        console.log('Found image forms:', imageForms.length);
        
        if (imageForms.length === 0) {
            console.warn('No image forms found on page');
            return;
        }
        
        imageForms.forEach(form => {
            try {
                new ImageHandler(form);
            } catch (error) {
                console.error('Error initializing form handler:', error);
            }
        });
    } catch (error) {
        console.error('Error in initialization:', error);
    }
} 