// update_invoice.js - for updating invoice details and handling payments
document.addEventListener('DOMContentLoaded', function() {
    const invoiceId = new URLSearchParams(window.location.search).get('id');
    const form = document.getElementById('update-invoice-form');
    
    // Load existing invoice data
    if (invoiceId) {
        fetch(`/api/invoices/${invoiceId}`)
            .then(response => response.json())
            .then(invoice => {
                // Populate form fields with existing data
                document.getElementById('dueDate').value = invoice.DueDate?.split('T')[0] || '';
                document.getElementById('paidAmount').value = invoice.PaidAmount || '';
                document.getElementById('paymentStatus').value = invoice.PaymentStatus || 'pending';
                document.getElementById('paymentMethod').value = invoice.PaymentMethod || '';

                // Display current invoice details
                const detailsHtml = `
                    <p><strong>Invoice #${invoice.InvoiceID}</strong></p>
                    <p>Quote Reference: #${invoice.QuoteID}</p>
                    <p>Customer: ${invoice.FirstName} ${invoice.LastName}</p>
                    <p>Total Amount: $${invoice.TotalAmount.toFixed(2)}</p>
                    <p>Current Status: ${invoice.PaymentStatus}</p>
                    ${invoice.PaymentMethod ? `<p>Payment Method: ${invoice.PaymentMethod}</p>` : ''}
                `;
                document.getElementById('invoice-details').innerHTML = detailsHtml;

                // Show payment link section if it exists
                if (invoice.PaymentLink) {
                    document.getElementById('payment-link-container').innerHTML = `
                        <p>Payment Link:</p>
                        <a href="${invoice.PaymentLink}" target="_blank" class="button">View Payment Link</a>
                    `;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error loading invoice details');
            });
    }

    // Handle payment method change
    document.getElementById('paymentMethod').addEventListener('change', function() {
        const stripeSection = document.getElementById('stripe-section');
        if (this.value === 'credit_card') {
            stripeSection.style.display = 'block';
        } else {
            stripeSection.style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        try {
            // If credit card is selected and payment is pending, create new payment link
            if (data.paymentMethod === 'credit_card' && data.paymentStatus === 'pending') {
                const linkResponse = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const linkResult = await linkResponse.json();
                if (linkResult.paymentLink) {
                    document.getElementById('payment-link-container').innerHTML = `
                        <p>New Payment Link Created:</p>
                        <a href="${linkResult.paymentLink}" target="_blank" class="button">View Payment Link</a>
                    `;
                }
            }

            // Update invoice details
            const response = await fetch(`/api/invoices/${invoiceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    paidAmount: data.paidAmount || null,
                    paymentDate: data.paymentStatus === 'paid' ? new Date().toISOString() : null
                })
            });

            if (response.ok) {
                alert('Invoice updated successfully');
                if (data.paymentStatus === 'paid') {
                    // If marked as paid, redirect to completed jobs
                    window.location.href = 'completed_jobs.html';
                } else {
                    // Otherwise, stay on active jobs
                    window.location.href = 'active_jobs.html';
                }
            } else {
                throw new Error('Failed to update invoice');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating invoice');
        }
    });

    // Add form validation
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