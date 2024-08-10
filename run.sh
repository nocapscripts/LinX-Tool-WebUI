#!/bin/bash

# Exit script on any error
set -e

# Function to check if a process is running
is_process_running() {
    pgrep -f "$1" > /dev/null
}

# Function to kill a process
kill_process() {
    local pids
    pids=$(pgrep -f "$1")
    if [ -n "$pids" ]; then
        echo "Stopping processes:"
        for pid in $pids; do
            echo "Stopping process: $pid"
            kill "$pid"
            # Wait a bit to ensure the process has time to terminate
            sleep 2
        done
    fi
}

# Ensure you have the necessary Python environment activated
# If using a virtual environment, activate it here, e.g.:
# source /path/to/venv/bin/activate

# Check if Flask server is already running and stop it
if is_process_running "python3 ./server.py"; then
    echo "Flask server is already running. Stopping it..."
    kill_process "python3 ./server.py"
fi

echo "Starting Flask server..."
sudo python3 ./server.py &

# Ensure `http-server` is installed
if ! command -v http-server &> /dev/null
then
    echo "http-server could not be found, installing..."
    npm install -g http-server
fi

# Check if `http-server` is already running and stop it
if is_process_running "http-server"; then
    echo "HTTP server is already running. Stopping it..."
    kill_process "http-server"
fi

echo "Starting HTTP server..."
http-server -p 8000 -a 0.0.0.0 & 

# Wait for the background processes to finish
wait
