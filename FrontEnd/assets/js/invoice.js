// invoice.js - for viewing invoice details and handling payment links
document.addEventListener('DOMContentLoaded', function() {
    const invoiceId = new URLSearchParams(window.location.search).get('id');
    
    if (invoiceId) {
        fetch(`/api/invoices/${invoiceId}`)
            .then(response => response.json())
            .then(invoice => {
                // Format dates
                const invoiceDate = new Date(invoice.InvoiceDate).toLocaleDateString();
                const dueDate = new Date(invoice.DueDate).toLocaleDateString();
                const paymentDate = invoice.PaymentDate ? new Date(invoice.PaymentDate).toLocaleDateString() : 'Not paid';

                // Display invoice details
                const detailsHtml = `
                    <div class="invoice-header">
                        <h3>Invoice #${invoice.InvoiceID}</h3>
                        <p><strong>Date:</strong> ${invoiceDate}</p>
                        <p><strong>Due Date:</strong> ${dueDate}</p>
                    </div>

                    <div class="customer-details">
                        <h4>Customer Information</h4>
                        <p>${invoice.FirstName} ${invoice.LastName}</p>
                        <p>${invoice.Address}</p>
                        <p>${invoice.City}, ${invoice.State} ${invoice.ZipCode}</p>
                        <p>Email: ${invoice.Email}</p>
                        <p>Phone: ${invoice.PhoneNumber}</p>
                    </div>

                    <div class="service-details">
                        <h4>Service Details</h4>
                        <p><strong>Quote Reference:</strong> #${invoice.QuoteID}</p>
                        <p><strong>Material:</strong> ${invoice.MaterialType}</p>
                        <p><strong>Fence Length:</strong> ${invoice.FenceLength} meters</p>
                    </div>

                    <div class="payment-details">
                        <h4>Payment Information</h4>
                        <p><strong>Total Amount:</strong> $${invoice.TotalAmount.toFixed(2)}</p>
                        <p><strong>Status:</strong> ${invoice.PaymentStatus}</p>
                        ${invoice.PaidAmount ? `<p><strong>Paid Amount:</strong> $${invoice.PaidAmount.toFixed(2)}</p>` : ''}
                        ${invoice.PaymentMethod ? `<p><strong>Payment Method:</strong> ${invoice.PaymentMethod}</p>` : ''}
                        <p><strong>Payment Date:</strong> ${paymentDate}</p>
                    </div>
                `;
                document.getElementById('invoice-details').innerHTML = detailsHtml;

                // Add payment link if available and payment is pending
                if (invoice.PaymentLink && invoice.PaymentStatus === 'pending') {
                    const paymentSection = document.getElementById('payment-section');
                    paymentSection.innerHTML = `
                        <div class="payment-options">
                            <h4>Online Payment</h4>
                            <p>Click below to pay with credit card:</p>
                            <a href="${invoice.PaymentLink}" class="button" target="_blank">
                                Pay Invoice Online
                            </a>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('invoice-details').innerHTML = 
                    '<p class="error">Error loading invoice details. Please try again later.</p>';
            });
    } else {
        document.getElementById('invoice-details').innerHTML = 
            '<p class="error">No invoice ID provided.</p>';
    }

    // Add print functionality
    document.querySelector('.print-button')?.addEventListener('click', function() {
        window.print();
    });
});