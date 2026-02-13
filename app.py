import subprocess
import os
import sys

# Add node_modules bin to PATH
node_bin = os.path.join(os.getcwd(), 'node_modules', '.bin')
os.environ['PATH'] = f"{node_bin}:{os.environ.get('PATH', '')}"

# Build the React app
if not os.path.exists('build'):
    print("Installing dependencies...")
    result = subprocess.run(['npm', 'ci'], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("ERROR:", result.stderr)
        sys.exit(1)
    
    print("Building React app...")
    result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print("ERROR:", result.stderr)
        sys.exit(1)
    
    print("Build complete!")
else:
    print("Build directory already exists, skipping build")

print("App built successfully. Nginx will serve the app.")
