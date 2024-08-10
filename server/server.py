from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)


CORS(app)

UPLOAD_FOLDER = '/commands/uploads'  
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return e.stderr

@app.route('/packages', methods=['GET'])
def get_packages():
    output = run_command("pacman -Qq")
    packages = output.splitlines()
    return jsonify({"packages": packages})

@app.route('/update', methods=['POST'])
def update_system():
    output = run_command("sudo pacman -Syu --noconfirm")
    return jsonify({"output": output})

@app.route('/install', methods=['POST'])
def install_packages():
    packages = request.json.get('packages', [])
    if not packages:
        return jsonify({"error": "No packages specified"}), 400

   
    package_list = " ".join(pkg for pkg in packages if all(c.isalnum() or c in ('-', '_') for c in pkg))
    output = run_command(f"sudo pacman -S --noconfirm {package_list}")
    return jsonify({"output": output})

@app.route('/remove', methods=['POST'])
def remove_packages():
    packages = request.json.get('packages', [])
    if not packages:
        return jsonify({"error": "No packages specified"}), 400

  
    package_list = " ".join(pkg for pkg in packages if all(c.isalnum() or c in ('-', '_') for c in pkg))
    output = run_command(f"sudo pacman -Rns --noconfirm {package_list}")
    return jsonify({"output": output})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.sh'):
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)

      
        os.chmod(file_path, 0o755)

       
        output = run_command(file_path)
        return jsonify({"output": output})

    return jsonify({"error": "Invalid file type. Only .sh files are allowed."}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
