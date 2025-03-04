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