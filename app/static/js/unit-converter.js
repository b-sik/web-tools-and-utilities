document.querySelectorAll('.unit-converter').forEach(form => {
    const type = form.dataset.type;
    const fromValue = form.querySelector('.from-value');
    const fromUnit = form.querySelector('.from-unit');
    const toUnit = form.querySelector('.to-unit');
    const resultGroup = form.querySelector('.result-group');
    const resultValue = form.querySelector('.result-value');
    const resultUnit = form.querySelector('.result-unit');

    function formatNumber(num) {
        // Convert to number with 6 decimal places
        const rounded = Number(num.toFixed(6));
        // Convert to string and remove trailing zeros after decimal
        const str = rounded.toString();
        // If it's a whole number (no decimals), return as is
        if (!str.includes('.')) return str;
        // Remove trailing zeros and decimal point if all decimals are zero
        return str.replace(/\.?0+$/, '');
    }

    function updateResult() {
        if (!fromValue.value) {
            resultGroup.style.display = 'none';
            return;
        }

        const value = parseFloat(fromValue.value);
        if (isNaN(value)) {
            resultGroup.style.display = 'none';
            return;
        }

        fetch(`/units/api/convert?type=${type}&from_unit=${fromUnit.value}&to_unit=${toUnit.value}&value=${value}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.detail || 'Conversion failed');
                    });
                }
                return response.json();
            })
            .then(data => {
                resultValue.textContent = formatNumber(data.result);
                resultUnit.textContent = toUnit.options[toUnit.selectedIndex].text;
                resultGroup.style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                resultGroup.style.display = 'none';
                // Optionally show error to user
                alert(error.message);
            });
    }

    fromValue.addEventListener('input', updateResult);
    fromUnit.addEventListener('change', updateResult);
    toUnit.addEventListener('change', updateResult);

    // Initial conversion if there's a value
    if (fromValue.value) {
        updateResult();
    }
}); 