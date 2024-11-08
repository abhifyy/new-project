// quote.js - for viewing quote details
document.addEventListener('DOMContentLoaded', function() {
    const quoteId = new URLSearchParams(window.location.search).get('id');
    
    if (quoteId) {
        fetch(`/api/quotes/${quoteId}`)
            .then(response => response.json())
            .then(quote => {
                // Format the quote date
                const quoteDate = new Date(quote.QuoteDate).toLocaleDateString();

                // Display quote details
                const detailsHtml = `
                    <div class="quote-header">
                        <h3>Quote #${quote.QuoteID}</h3>
                        <p><strong>Date:</strong> ${quoteDate}</p>
                    </div>

                    <div class="customer-details">
                        <h4>Customer Information</h4>
                        <p>${quote.FirstName} ${quote.LastName}</p>
                        <p>${quote.Address}</p>
                        <p>${quote.City}, ${quote.State} ${quote.ZipCode}</p>
                        <p>Email: ${quote.Email}</p>
                        <p>Phone: ${quote.PhoneNumber}</p>
                    </div>

                    <div class="project-details">
                        <h4>Project Details</h4>
                        <p><strong>Material Type:</strong> ${quote.MaterialType}</p>
                        <p><strong>Fence Length:</strong> ${quote.FenceLength} meters</p>
                        <p><strong>HOA Approval:</strong> ${quote.HOAApproval}</p>
                        <p><strong>City Approval:</strong> ${quote.CityApproval}</p>
                        <p><strong>Status:</strong> ${quote.Status}</p>
                    </div>

                    <div class="cost-details">
                        <h4>Cost Information</h4>
                        <p><strong>Total Amount:</strong> $${quote.TotalAmount ? quote.TotalAmount.toFixed(2) : '0.00'}</p>
                    </div>

                    <div class="photos-section">
                        <h4>Uploaded Photos</h4>
                        <div class="photo-gallery">
                            ${quote.PhotoPaths ? 
                                quote.PhotoPaths.split(',').map(photo => 
                                    `<img src="/uploads/quotes/${photo}" alt="Project Photo" class="quote-photo">`
                                ).join('') : 
                                '<p>No photos uploaded</p>'
                            }
                        </div>
                    </div>
                `;
                document.getElementById('quote-details').innerHTML = detailsHtml;
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('quote-details').innerHTML = 
                    '<p class="error">Error loading quote details. Please try again later.</p>';
            });
    } else {
        document.getElementById('quote-details').innerHTML = 
            '<p class="error">No quote ID provided.</p>';
    }

    // Add print functionality
    document.querySelector('.print-button')?.addEventListener('click', function() {
        window.print();
    });
});