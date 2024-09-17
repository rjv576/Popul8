function toggleFields() {
    const individualFields = document.getElementById('individual-fields');
    const bulkFields = document.getElementById('bulk-fields');
    const selectedOption = document.querySelector('input[name="radio"]:checked').value;

    if (selectedOption === '1') {
        individualFields.style.display = 'block';
        bulkFields.style.display = 'none';
    } else {
        individualFields.style.display = 'none';
        bulkFields.style.display = 'block';
    }
}

// Ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    const radioButtons = document.querySelectorAll('input[name="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('click', toggleFields);
    });
});