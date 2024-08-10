#!/bin/bash

# Function to check if a command is successful
check_success() {
    if [ $? -ne 0 ]; then
        echo "An error occurred. Exiting."
        exit 1
    fi
}

# Update the system and upgrade existing packages
echo "Updating package database and upgrading existing packages..."
sudo pacman -Syu --noconfirm
check_success

# Install specified packages
echo "Installing Steam, Discord, and Visual Studio Code..."
sudo pacman -S --noconfirm steam discord code ufw
check_success

echo "Packages installed successfully!"
