"""
Backend Knowledge Base Upriserz.
Rulează cu: python3 server.py
"""
import json
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = 8080


class ThreadedHTTPServer(HTTPServer):
    """Procesează fiecare cerere într-un thread separat."""
    def process_request(self, request, client_address):
        t = threading.Thread(target=self.__new_request, args=(request, client_address))
        t.daemon = True
        t.start()

    def __new_request(self, request, client_address):
        self.finish_request(request, client_address)
        self.shutdown_request(request)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self._serve_file("index.html", "text/html")
        elif self.path == "/app.js":
            self._serve_file("app.js", "application/javascript")
        else:
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/api/chat":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            question = body.get("question", "").strip()
            notebook_id = body.get("notebook_id", "")

            if not question:
                self._send(400, {"error": "Întrebarea este goală."})
                return

            answer = self._query_notebooklm(notebook_id, question)
            self._send(200, {"answer": answer})
        else:
            self._send(404, {"error": "not found"})

    def _query_notebooklm(self, notebook_id, question):
        try:
            result = subprocess.run(
                ["python3", "-m", "notebooklm", "ask", question,
                 "--notebook", notebook_id],
                capture_output=True, text=True, timeout=180
            )
            if result.returncode == 0:
                return result.stdout.strip()
            return f"Eroare NotebookLM: {result.stderr.strip()}"
        except subprocess.TimeoutExpired:
            return "Cererea a durat prea mult (>3 min). Încearcă din nou cu un singur notebook selectat."
        except Exception as e:
            return f"Eroare internă: {str(e)}"

    def _serve_file(self, path, content_type):
        try:
            with open(path, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", len(data))
            self.end_headers()
            self.wfile.write(data)
        except FileNotFoundError:
            self._send(404, {"error": "file not found"})

    def _send(self, code, payload):
        data = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(data))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    server = ThreadedHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Server pornit la http://localhost:{PORT}")
    server.serve_forever()
