import http.server
import socketserver
import os
import subprocess

PORT = int(os.environ.get('PORT', 8000))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

# Build the React app
if not os.path.exists('build'):
    print("Installing dependencies...")
    subprocess.check_call(['npm', 'install'])
    print("Building React app...")
    subprocess.check_call(['npm', 'run', 'build'])

# Change to build directory
os.chdir('build')

# Start server
Handler = MyHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running on port {PORT}")
    httpd.serve_forever()
