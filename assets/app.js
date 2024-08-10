// Function to load available packages and create checkboxes
function loadAvailablePackages() {
    fetch('http://localhost:5000/packages')
        .then(response => response.json())
        .then(data => {
            const packages = data.packages || [];
            const container = document.getElementById('availablePackages');
            container.innerHTML = ''; // Clear any existing checkboxes
            
            packages.forEach(pkg => {
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.classList.add('flex', 'items-center', 'mb-2', 'p-2', 'rounded', 'shadow-sm', 'text-black');
                
                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox';
                checkboxInput.id = `pkg-${pkg}`;
                checkboxInput.value = pkg;
                checkboxInput.classList.add('mr-2', 'form-checkbox', 'text-blue-500');

                const checkboxLabel = document.createElement('label');
                checkboxLabel.htmlFor = `pkg-${pkg}`;
                checkboxLabel.classList.add('text-lg', 'font-medium');
                checkboxLabel.textContent = pkg;

                checkboxWrapper.appendChild(checkboxInput);
                checkboxWrapper.appendChild(checkboxLabel);
                
                container.appendChild(checkboxWrapper);
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
    .then(response => response.json())
    .then(data => {
        document.getElementById('installOutput').value = data.output || 'No output returned.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('installOutput').value = `Error: ${error.message}`;
    });
}

// Function to install a custom package
function installCustomPackage() {
    const packageName = document.getElementById('customPackage').value.trim();
    if (packageName === '') {
        alert('Please enter a package name.');
        return;
    }

    fetch('http://localhost:5000/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: packageName })
    })
    .then(response => response.json())
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
        .then(response => response.json())
        .then(data => {
            document.getElementById('installOutput').value = data.output || 'No output returned.';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('installOutput').value = `Error: ${error.message}`;
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
    .then(response => response.json())
    .then(data => {
        document.getElementById('installOutput').value = data.output || 'No output returned.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('installOutput').value = `Error: ${error.message}`;
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
    .then(response => response.json())
    .then(data => {
        document.getElementById('installOutput').value = data.output || 'No output returned.';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('installOutput').value = `Error: ${error.message}`;
    });
}

// Load packages when the page loads
document.addEventListener('DOMContentLoaded', loadAvailablePackages);
