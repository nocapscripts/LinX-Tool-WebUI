#!/bin/bash

set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to install project dependencies
install_dependencies() {
    echo "Installing project dependencies..."
    if command_exists yarn; then
        echo "Yarn detected. Installing dependencies with yarn..."
        yarn install
    elif command_exists npm; then
        echo "npm detected. Installing dependencies with npm..."
        npm install
    else
        echo "Neither npm nor yarn found. Please install one of them."
        exit 1
    fi
}

# Function to install Node.js and npm on Debian-based systems
install_nodejs_npm_debian() {
    if ! command_exists node || ! command_exists npm; then
        echo "Updating package list..."
        sudo apt-get update

        echo "Installing Node.js and npm..."
        sudo apt-get install -y nodejs npm

        echo "Verifying Node.js installation..."
        node -v

        echo "Verifying npm installation..."
        npm -v
    else
        echo "Node.js and npm are already installed."
    fi
}

# Function to install Node.js, npm, and yarn on Arch-based systems
install_nodejs_npm_arch() {
    if ! command_exists node || ! command_exists npm || ! command_exists yarn; then
        echo "Updating package list..."
        sudo pacman -Syu --noconfirm

        echo "Installing Node.js and npm..."
        sudo pacman -S --noconfirm nodejs-lts-iron npm

        echo "Installing yarn..."
        sudo pacman -S --noconfirm yarn

        echo "Verifying Node.js installation..."
        node -v

        echo "Verifying npm installation..."
        npm -v

        echo "Verifying yarn installation..."
        yarn -v
    else
        echo "Node.js, npm, and/or yarn are already installed."
    fi
}

# Function to install http-server globally
install_http_server() {
    if ! npm list -g | grep -q http-server; then
        echo "Installing http-server globally..."
        sudo npm install -g http-server

        echo "Verifying http-server installation..."
        http-server -v
    else
        echo "http-server is already installed."
    fi
}

# Function to start the server
start_server() {
    echo "Starting server..."
    sudo ./run.sh
}

# Detect the distribution and install Node.js, npm, and dependencies accordingly
if [ -f /etc/debian_version ]; then
    echo "Detected Debian-based system"
    install_nodejs_npm_debian
elif [ -f /etc/arch-release ]; then
    echo "Detected Arch-based system"
    install_nodejs_npm_arch
else
    echo "Unsupported distribution. This script supports Debian-based and Arch-based systems."
    exit 1
fi

# Install project dependencies
install_dependencies

# Install http-server
install_http_server

# Start the server
start_server 

echo "Installation complete."
