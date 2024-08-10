from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '/commands/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def run_command(command):
    """Run a shell command and return its output."""
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return e.stderr

def detect_package_manager():
    """Detect which package manager is used on the system."""
    for manager in ['pacman', 'apt', 'dnf']:
        if subprocess.run(f"which {manager}", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode == 0:
            return manager
    return None

def get_package_command(manager):
    """Return the command for fetching available packages based on the package manager."""
    if manager == 'pacman':
        return "pacman -Sl | awk '{print $2}' | sort -u"
    elif manager == 'apt':
        return "apt list --all-versions 2>/dev/null | grep -oP '^\\S+' | sort -u"
    elif manager == 'dnf':
        return "dnf repoquery --available --qf '%{name}' | sort -u"
    else:
        return ""

@app.route('/packages', methods=['GET'])
def get_packages():
    """Fetch available packages from the system."""
    manager = detect_package_manager()
    if manager is None:
        return jsonify({"error": "No supported package manager found."}), 500

    command = get_package_command(manager)
    output = run_command(command)
    packages = output.splitlines()
    return jsonify({"packages": packages})

@app.route('/update', methods=['POST'])
def update_system():
    """Update system packages."""
    manager = detect_package_manager()
    if manager is None:
        return jsonify({"error": "No supported package manager found."}), 500

    command = {
        'pacman': "sudo pacman -Syu --noconfirm",
        'apt': "sudo apt update && sudo apt upgrade -y",
        'dnf': "sudo dnf update -y"
    }.get(manager, "")

    output = run_command(command)
    return jsonify({"output": output})

@app.route('/install', methods=['POST'])
def install_packages():
    """Install selected packages."""
    packages = request.json.get('packages', [])
    if not packages:
        return jsonify({"error": "No packages specified"}), 400

    manager = detect_package_manager()
    if manager is None:
        return jsonify({"error": "No supported package manager found."}), 500

    package_list = " ".join(pkg for pkg in packages if all(c.isalnum() or c in ('-', '_') for c in pkg))
    if not package_list:
        return jsonify({"error": "Invalid package names provided"}), 400

    command = {
        'pacman': f"sudo pacman -S --noconfirm {package_list}",
        'apt': f"sudo apt install -y {package_list}",
        'dnf': f"sudo dnf install -y {package_list}"
    }.get(manager, "")

    output = run_command(command)
    return jsonify({"output": output})

@app.route('/custom', methods=['POST'])
def install_custom_package():
    """Install a custom package."""
    package_name = request.json.get('package', '').strip()
    if not package_name:
        return jsonify({"error": "No package name specified"}), 400

    if not all(c.isalnum() or c in ('-', '_') for c in package_name):
        return jsonify({"error": "Invalid package name provided"}), 400

    manager = detect_package_manager()
    if manager is None:
        return jsonify({"error": "No supported package manager found."}), 500

    command = {
        'pacman': f"sudo pacman -S --noconfirm {package_name}",
        'apt': f"sudo apt install -y {package_name}",
        'dnf': f"sudo dnf install -y {package_name}"
    }.get(manager, "")

    output = run_command(command)
    return jsonify({"output": output})

@app.route('/remove', methods=['POST'])
def remove_packages():
    """Remove packages."""
    packages = request.json.get('packages', [])
    if not packages:
        return jsonify({"error": "No packages specified"}), 400

    manager = detect_package_manager()
    if manager is None:
        return jsonify({"error": "No supported package manager found."}), 500

    package_list = " ".join(pkg for pkg in packages if all(c.isalnum() or c in ('-', '_') for c in pkg))
    if not package_list:
        return jsonify({"error": "Invalid package names provided"}), 400

    command = {
        'pacman': f"sudo pacman -Rns --noconfirm {package_list}",
        'apt': f"sudo apt remove -y {package_list}",
        'dnf': f"sudo dnf remove -y {package_list}"
    }.get(manager, "")

    output = run_command(command)
    return jsonify({"output": output})

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload and execute a shell script."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.sh'):
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

        # Make the file executable
        os.chmod(file_path, 0o755)

        # Execute the shell script
        output = run_command(file_path)
        return jsonify({"output": output})

    return jsonify({"error": "Invalid file type. Only .sh files are allowed."}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
