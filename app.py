import subprocess
import os

# Build the React app
if not os.path.exists('build'):
    print("Installing dependencies...")
    subprocess.check_call(['npm', 'ci'])
    print("Building React app...")
    subprocess.check_call(['npm', 'run', 'build'])
    print("Build complete!")

print("App built successfully. Nginx will serve the app.")
