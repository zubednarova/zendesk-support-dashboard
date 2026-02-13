#!/usr/bin/env python3
import subprocess
import sys

print("Building React app...")

try:
    # Install dependencies
    print("Installing npm dependencies...")
    subprocess.check_call(["npm", "install"])
    
    # Build the app
    print("Running npm build...")
    subprocess.check_call(["npm", "run", "build"])
    
    print("Build completed successfully!")
    
except subprocess.CalledProcessError as e:
    print(f"Build failed: {e}")
    sys.exit(1)
