import http.server, functools
from pathlib import Path
root=Path(__file__).resolve().parent
print("Open http://localhost:8765/chart-offline.html")
http.server.ThreadingHTTPServer(("127.0.0.1",8765),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(root))).serve_forever()
