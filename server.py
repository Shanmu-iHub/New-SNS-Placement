import http.server
import socketserver
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class SPAServerHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Resolve target file path on disk
        req_path = self.translate_path(self.path)
        # If the file or directory does not exist, fallback to index.html for client-side routing
        if not os.path.exists(req_path) and not os.path.splitext(req_path)[1]:
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), SPAServerHandler) as httpd:
        print(f"🚀 SNS Placement SPA Server running at http://localhost:{PORT}")
        print(f"👉 Routes like http://localhost:{PORT}/students will serve index.html seamlessly.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
