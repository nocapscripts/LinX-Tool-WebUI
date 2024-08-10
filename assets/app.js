// Function to load available packages and create checkboxes
function loadAvailablePackages() {
    fetch('http://localhost:5000/packages')
        .then(response => response.json())
        .then(data => {
            const packages = data.packages || [];
            const container = document.getElementById('availablePackages');
            container.innerHTML = ''; // Clear any existing checkboxes
            
            packages.forEach(pkg => {
                const checkbox = document.createElement('div');
                checkbox.classList.add('mb-2', 'p-2', 'bg-zinc-800', 'rounded', 'flex', 'items-center');
                checkbox.innerHTML = `
                    <input type="checkbox" id="pkg-${pkg}" value="${pkg}" class="mr-2 rounded border-gray-300">
                    <label for="pkg-${pkg}" class="text-gray-800">${pkg}</label>
                `;
                container.appendChild(checkbox);
            });
        })
        .catch(error => console.error('Error:', error));
}


// Function to install selected packages
function installCheckedPackages() {
    const checkboxes = document.querySelectorAll('#availablePackages input[type="checkbox"]:checked');
    const packages = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (packages.length === 0) {
        alert('Please select at least one package.');
        return;
    }

    fetch('http://localhost:5000/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('installOutput').value = data.output || 'No output returned.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('installOutput').value = `Error: ${error.message}`;
    });
}

// Function to update the system
function updateSystem() {
    fetch('http://localhost:5000/update', { method: 'POST' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('updateOutput').value = data.output || 'No output returned.';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('updateOutput').value = `Error: ${error.message}`;
        });
}

// Function to remove packages
function removePackages() {
    const packages = document.getElementById('removePackages').value.trim().split(/\s+/);
    if (packages.length === 0) {
        alert('Please enter at least one package name.');
        return;
    }

    fetch('http://localhost:5000/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('removeOutput').value = data.output || 'No output returned.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('removeOutput').value = `Error: ${error.message}`;
    });
}

// Function to upload a file
function uploadFile() {
    const fileInput = document.getElementById('file');
    if (fileInput.files.length === 0) {
        alert('Please select a file to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('uploadOutput').value = data.output || 'No output returned.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('uploadOutput').value = `Error: ${error.message}`;
    });
}

// Load packages when the page loads
document.addEventListener('DOMContentLoaded', loadAvailablePackages);
