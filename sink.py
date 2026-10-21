import http.server, socketserver, os
class H(http.server.BaseHTTPRequestHandler):
    def _cors(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Headers','*')
        self.send_header('Access-Control-Allow-Methods','POST,GET,OPTIONS')
        self.end_headers()
    def do_OPTIONS(self):
        self._cors()
    def do_GET(self):
        self._cors()
        self.wfile.write(b'ok')
    def do_POST(self):
        n=int(self.headers.get('Content-Length','0'))
        b=self.rfile.read(n)
        fn='/workspace/up/'+self.path.strip('/').replace('/','_') or 'x'
        os.makedirs('/workspace/up',exist_ok=True)
        with open(fn,'ab') as f:
            f.write(b+b'\n')
        self._cors()
        self.wfile.write(b'ok')
    def log_message(self,*a):
        pass
socketserver.TCPServer.allow_reuse_address=True
with socketserver.TCPServer(('0.0.0.0',8899),H) as s:
    s.serve_forever()
