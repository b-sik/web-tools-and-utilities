// Form validation handler
class FormValidator {
    constructor(form) {
        this.form = form;
        this.inputs = form.querySelectorAll('input, select, textarea');
        this.setupValidation();
    }

    setupValidation() {
        // Add validation on form submission
        this.form.addEventListener('submit', (e) => this.validateForm(e));

        // Add validation on blur for each input
        this.inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearValidation(input));
        });
    }

    validateInput(input) {
        if (!input.hasAttribute('required')) return;

        const isValid = input.checkValidity();
        if (!isValid && input.value !== '') {
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    }

    clearValidation(input) {
        input.classList.remove('is-invalid');
    }

    validateForm(e) {
        let isValid = true;

        this.inputs.forEach(input => {
            if (input.hasAttribute('required')) {
                const valid = input.checkValidity();
                if (!valid) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            }
        });

        if (!isValid) {
            e.preventDefault();
        }
    }
}

// Initialize validation for all forms
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => new FormValidator(form));
}); 