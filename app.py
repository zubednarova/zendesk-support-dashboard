import subprocess
import os

print("Starting build process...")

# Install dependencies
print("Running npm install...")
subprocess.run(['npm', 'install'], check=True, cwd='/app')

# Build the app
print("Running npm build...")
subprocess.run(['npm', 'run', 'build'], check=True, cwd='/app')

print("Build completed successfully!")
