// Add this to a new file: assets/js/quoteForm.js

document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    
    quoteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Create FormData object
        const formData = new FormData(quoteForm);
        
        try {
            // Show loading state
            const submitButton = quoteForm.querySelector('input[type="submit"]');
            const originalButtonText = submitButton.value;
            submitButton.value = 'Sending...';
            submitButton.disabled = true;

            // Handle file uploads
            const photoFiles = document.getElementById('photos').files;
            formData.delete('photos'); // Remove the original files input
            for (let i = 0; i < photoFiles.length; i++) {
                formData.append('photos', photoFiles[i]);
            }

            // Convert FormData to JSON for most fields
            const formJSON = {};
            formData.forEach((value, key) => {
                if (key !== 'photos') {
                    formJSON[key] = value;
                }
            });

            // Create the final payload
            const payload = new FormData();
            payload.append('data', JSON.stringify(formJSON));
            // Append photos separately
            for (let i = 0; i < photoFiles.length; i++) {
                payload.append('photos', photoFiles[i]);
            }

            // Send the form data to the backend
            const response = await fetch('/api/quotes', {
                method: 'POST',
                body: payload
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit quote request');
            }

            // Show success message
            alert('Quote request submitted successfully! You will receive a confirmation email shortly.');
            quoteForm.reset();

        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your quote request. Please try again.');
        } finally {
            // Reset button state
            submitButton.value = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Optional: Add client-side validation for phone numbers
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let cleaned = e.target.value.replace(/\D/g, '');
        if (cleaned.length > 10) cleaned = cleaned.substr(0, 10);
        if (cleaned.length >= 6) {
            cleaned = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length >= 3) {
            cleaned = cleaned.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        e.target.value = cleaned;
    });
});