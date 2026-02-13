import http.server
import socketserver
import os
import subprocess
import sys

PORT = int(os.environ.get('PORT', 8000))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def build_react_app():
    if not os.path.exists('build'):
        print("Installing npm dependencies...")
        result = subprocess.run(['npm', 'ci'], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"npm ci failed: {result.stderr}")
            sys.exit(1)
        
        print("Building React app...")
        result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"npm build failed: {result.stderr}")
            sys.exit(1)
        print("Build complete!")

if __name__ == '__main__':
    build_react_app()
    
    os.chdir('build')
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Serving at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
