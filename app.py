#!/usr/bin/env python3
import http.server
import socketserver
import os
import subprocess

PORT = 8000

# Install dependencies and build
if not os.path.exists('build'):
    print("Installing dependencies...")
    subprocess.run(['npm', 'install'], check=True)
    print("Building React app...")
    subprocess.run(['npm', 'run', 'build'], check=True)

# Serve the built files
os.chdir('build')
Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever()
