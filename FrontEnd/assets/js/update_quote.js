// update_quote.js - for updating quote details
document.addEventListener('DOMContentLoaded', function() {
    const quoteId = new URLSearchParams(window.location.search).get('id');
    const form = document.getElementById('update-quote-form');
    
    // Load existing quote data
    if (quoteId) {
        fetch(`/api/quotes/${quoteId}`)
            .then(response => response.json())
            .then(quote => {
                // Populate form fields
                document.getElementById('dueDate').value = quote.DueDate?.split('T')[0] || '';
                document.getElementById('totalAmount').value = quote.TotalAmount || '';
                document.getElementById('status').value = quote.Status || 'Pending';

                // Display current quote details
                const detailsHtml = `
                    <div class="quote-summary">
                        <h3>Quote #${quote.QuoteID}</h3>
                        <div class="details-grid">
                            <div class="customer-info">
                                <h4>Customer Information</h4>
                                <p>${quote.FirstName} ${quote.LastName}</p>
                                <p>${quote.Address}</p>
                                <p>${quote.City}, ${quote.State} ${quote.ZipCode}</p>
                                <p>Email: ${quote.Email}</p>
                                <p>Phone: ${quote.PhoneNumber}</p>
                            </div>

                            <div class="project-info">
                                <h4>Project Details</h4>
                                <p><strong>Material:</strong> ${quote.MaterialType}</p>
                                <p><strong>Fence Length:</strong> ${quote.FenceLength} meters</p>
                                <p><strong>HOA Approval:</strong> ${quote.HOAApproval}</p>
                                <p><strong>City Approval:</strong> ${quote.CityApproval}</p>
                            </div>

                            <div class="current-status">
                                <h4>Current Status</h4>
                                <p><strong>Status:</strong> ${quote.Status}</p>
                                <p><strong>Current Amount:</strong> $${quote.TotalAmount ? quote.TotalAmount.toFixed(2) : '0.00'}</p>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('quote-details').innerHTML = detailsHtml;

                // Show photos if they exist
                if (quote.PhotoPaths) {
                    const photosHtml = `
                        <div class="photos-section">
                            <h4>Uploaded Photos</h4>
                            <div class="photo-gallery">
                                ${quote.PhotoPaths.split(',').map(photo => 
                                    `<img src="/uploads/quotes/${photo}" alt="Project Photo" class="quote-photo">`
                                ).join('')}
                            </div>
                        </div>
                    `;
                    document.getElementById('quote-details').innerHTML += photosHtml;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error loading quote details');
            });
    }

    // Handle status change
    document.getElementById('status').addEventListener('change', function() {
        const completedStatus = this.value === 'Completed';
        const totalAmountField = document.getElementById('totalAmount');
        
        // Make total amount required if status is Completed
        totalAmountField.required = completedStatus;
        
        if (completedStatus) {
            document.getElementById('amount-warning').style.display = 'block';
        } else {
            document.getElementById('amount-warning').style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        try {
            // Update quote
            const response = await fetch(`/api/quotes/${quoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // If status is completed, create invoice
                if (data.status === 'Completed') {
                    const invoiceResponse = await fetch('/api/invoices', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            QuoteID: quoteId,
                            TotalAmount: data.totalAmount,
                            InvoiceDate: new Date().toISOString(),
                            DueDate: data.dueDate,
                            PaymentStatus: 'pending'
                        })
                    });

                    if (!invoiceResponse.ok) {
                        throw new Error('Failed to create invoice');
                    }
                }

                alert('Quote updated successfully');
                
                // Redirect based on status
                if (data.status === 'Completed') {
                    window.location.href = 'active_jobs.html';
                } else {
                    window.location.href = 'showquotes.html';
                }
            } else {
                throw new Error('Failed to update quote');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating quote');
        }
    });

    // Form validation
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('invalid', (e) => {
            e.preventDefault();
            input.classList.add('error');
        });
        
        input.addEventListener('input', () => {
            input.classList.remove('error');
        });
    });
});