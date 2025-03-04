document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.currency-converter');
    const amount = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const resultValue = document.querySelector('.result-value');
    const resultCurrency = document.querySelector('.result-currency');
    const rateDisplay = document.querySelector('.rate-display');
    const lastUpdated = document.querySelector('.last-updated');

    let debounceTimer;

    const updateConversion = async () => {
        if (!amount.value || !fromCurrency.value || !toCurrency.value) return;

        try {
            const response = await fetch(`/currency/api/convert?amount=${amount.value}&from_currency=${fromCurrency.value}&to_currency=${toCurrency.value}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            resultValue.textContent = data.result.toFixed(2);
            resultCurrency.textContent = ` ${toCurrency.value}`;
            rateDisplay.textContent = `1 ${fromCurrency.value} = ${data.rate.toFixed(4)} ${toCurrency.value}`;
            lastUpdated.textContent = `Last updated: ${new Date(data.timestamp).toLocaleString()}`;
            
            document.querySelector('.result-group').style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            resultValue.textContent = 'Error';
            resultCurrency.textContent = '';
            rateDisplay.textContent = 'Unable to fetch exchange rate';
            lastUpdated.textContent = '';
        }
    };

    const debouncedUpdate = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateConversion, 500);
    };

    [amount, fromCurrency, toCurrency].forEach(input => {
        input.addEventListener('input', debouncedUpdate);
        input.addEventListener('change', debouncedUpdate);
    });
}); 