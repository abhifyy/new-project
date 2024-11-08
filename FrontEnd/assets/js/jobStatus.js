// This would be in your frontend folder, e.g., jobStatus.js
document.getElementById('jobStatusForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const quoteRef = document.getElementById('quoteRef').value;
    const email = document.getElementById('email').value;

    fetch('/api/job-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quoteRef, email }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Job not found');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('customerName').textContent = data.customerName;
        document.getElementById('jobAddress').textContent = data.jobAddress;
        document.getElementById('jobType').textContent = data.jobType;
        document.getElementById('jobStatus').textContent = data.status;
        document.getElementById('jobInfo').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message || 'An error occurred while fetching the job status. Please try again.');
        document.getElementById('jobInfo').style.display = 'none';
    });
});

$(document).ready(function() {
    $("#jobStatusForm").submit(function(e) {
        e.preventDefault();

        // Example job info for demo purposes
        $("#customerName").text("John Doe");
        $("#jobAddress").text("123 Main St, Anytown, USA");
        $("#jobType").text("Wood Fence Installation");
        $("#jobStatus").text("Active");
        $("#jobInfo").show();
    });
});
