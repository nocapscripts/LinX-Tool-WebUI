#!/bin/bash

# Define the repository URL and directory
REPO_URL="https://aur.archlinux.org/thorium-browser-bin.git"
DIR_NAME="thorium-browser-bin"

# Function to check if a command is installed
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "$1 is not installed. Please install it and try again."
        exit 1
    fi
}

# Check if git and makepkg are installed
check_command git
check_command makepkg

# Clone the repository
echo "Cloning the repository..."
git clone "$REPO_URL" || { echo "Failed to clone repository. Exiting."; exit 1; }

# Navigate to the directory
cd "$DIR_NAME" || { echo "Failed to enter directory $DIR_NAME. Exiting."; exit 1; }

# Build and install the package
echo "Building and installing the package..."
makepkg -i || { echo "Failed to build and install package. Exiting."; exit 1; }

echo "Package installed successfully!"
