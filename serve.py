    #!/usr/bin/env python3
import http.server
import pathlib

BASE = pathlib.Path(__file__).parent
ENV_PATH = BASE / "data" / ".env"
TARGET = "/js/main.js"
PLACEHOLDER = "CARTO_API_KEY"

def load_env(path):
    values = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        v = v.strip().strip("'").strip('"')
        values[k.strip()] = v
    return values

API_KEY = load_env(ENV_PATH).get(PLACEHOLDER, "")

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if path == TARGET:
            data = (BASE / "js" / "main.js").read_text(encoding="utf-8").replace(PLACEHOLDER, API_KEY)
            body = data.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        return super().do_GET()

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler) as httpd:
        print(f"Serving {BASE} on http://127.0.0.1:{port}")
        httpd.serve_forever()
