"""
Backend Knowledge Base Upriserz.
Rulează cu: python3 server.py
"""
import json
import re
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = 8080
executor = ThreadPoolExecutor(max_workers=10)


class ThreadedHTTPServer(HTTPServer):
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
            notebook_ids = body.get("notebook_ids", [])
            notebook_id = body.get("notebook_id", "")

            if not question:
                self._send(400, {"error": "Întrebarea este goală."})
                return

            # Support both single and multiple notebook queries
            if notebook_ids and len(notebook_ids) > 1:
                answer = self._query_parallel(notebook_ids, question)
            else:
                nid = notebook_ids[0] if notebook_ids else notebook_id
                answer = self._query_one(nid, question)

            self._send(200, {"answer": answer})
        else:
            self._send(404, {"error": "not found"})

    def _query_parallel(self, notebook_ids, question):
        futures = {executor.submit(self._query_one, nid, question): nid for nid in notebook_ids}
        results = {}
        for future in as_completed(futures):
            nid = futures[future]
            try:
                results[nid] = future.result()
            except Exception as e:
                results[nid] = f"Eroare: {str(e)}"

        # Return combined if multiple, single if only one valid
        valid = [(nid, ans) for nid, ans in results.items() if ans and not ans.startswith("Eroare")]
        if not valid:
            return "Nu am găsit răspunsuri în notebook-urile selectate."
        if len(valid) == 1:
            return valid[0][1]
        return "\n\n---\n\n".join(ans for _, ans in valid)

    def _query_one(self, notebook_id, question):
        try:
            result = subprocess.run(
                ["python3", "-m", "notebooklm", "ask", question,
                 "--notebook", notebook_id],
                capture_output=True, text=True, timeout=180
            )
            if result.returncode == 0:
                return self._clean_output(result.stdout.strip())
            return f"Eroare NotebookLM: {result.stderr.strip()}"
        except subprocess.TimeoutExpired:
            return "Cererea a durat prea mult. Încearcă din nou."
        except Exception as e:
            return f"Eroare internă: {str(e)}"

    def _clean_output(self, text):
        lines = text.splitlines()
        clean = []
        skip_prefixes = ("Continuing conversation", "Resumed conversation",
                         "Answer:", "Profile:", "Using persistent")
        for line in lines:
            if any(line.strip().startswith(p) for p in skip_prefixes):
                continue
            clean.append(line)
        result = "\n".join(clean).strip()
        result = re.sub(r'\s*\[\d+\]', '', result)
        return result.strip()

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
