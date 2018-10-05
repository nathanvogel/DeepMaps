#!/usr/bin/env python

# ML imports
from options.test_options import TestOptions
import getoneimage
import requests
from scipy import misc
from io import BytesIO, StringIO
from data.base_dataset import BaseDataset, get_transform
from PIL import Image

# Server imports
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse as urlparse

"""
Very simple HTTP server in python.
Usage::
    ./dummy-web-server.py [<port>]
Send a GET request::
    curl http://localhost
Send a HEAD request::
    curl -I http://localhost
Send a POST request::
    curl -d "foo=bar&bin=baz" http://localhost
"""

model = None
mytransform = None

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('content-type', 'image/png')
        self.end_headers()

    def gzipencode(self, content):
        import gzip
        out = BytesIO()
        f = gzip.GzipFile(fileobj=out, mode='w', compresslevel=5)
        f.write(content)
        f.close()
        return out.getvalue()

    def do_GET(self):

        o = urlparse.urlparse(self.path)
        params = urlparse.parse_qs(o.query)
        print(params)
        originalUrl = params["originalUrl"][0]
        print("Downloadling " + originalUrl)
        res = requests.get(originalUrl)
        # img_arr = misc.imread(BytesIO(res.content))

        # print(res.content)
        img = Image.open(BytesIO(res.content))

        img.save("./downloaded.png")
        A_img = img.convert('RGB')
        A_img = mytransform(A_img)
        A_img = A_img.unsqueeze(0)
        # print(A_img)
        # if self.opt.direction == 'BtoA':
        #     input_nc = self.opt.output_nc
        # else:
        #     input_nc = self.opt.input_nc

        # if input_nc == 1:  # RGB to gray
        #     tmp = A[0, ...] * 0.299 + A[1, ...] * 0.587 + A[2, ...] * 0.114
        #     A = tmp.unsqueeze(0)

        # image_pil = getoneimage.predictNewImage(A_img)
        print("===============awef================")

        data = {
            'A': A_img,
            'B': A_img,
            'A_paths': "./tmpA.png",
            'B_paths': "./tmpB.png"
        }
        print(data)

        print("==============gre=================")
        image_pil = getoneimage.getOldStyleImage(data)
        # # print(image_pil)
        # save_path = getoneimage.getOldStyleImagePath()
        # print("SAVING to " + save_path)
        # image_pil.save("./oldstyleimage.png")


        # byte_io = BytesIO()
        # image_pil.save(byte_io, format='PNG')


        # self._set_headers()
        # bytesValue = byte_io.getvalue()
        # # assume bytes_io is a `BytesIO` object
        # byte_str = bytes_io.read()
        #
        # # Convert to a "unicode" object
        # text_obj = byte_str.decode('UTF-8')  # Or use the encoding you expect

        content_path = "./tempforsend.png"
        image_pil.save(content_path, format='PNG')
        content = open(content_path, 'rb')
        self.send_response(200)
        self.send_header('Content-type', 'image/png')
        self.end_headers()
        self.wfile.write(content.read())
        content.close()

        # self.send_response(200)
        # self.send_header('content-type', 'image/png')
        # # self.send_header('content-length', len(bytesValue))
        # self.send_header("Content-length", str(len(str(content))))
        # self.send_header("Content-Encoding", "gzip")
        # self.end_headers()
        # self.wfile.write(content)
        # self.wfile.flush()


        # content = self.gzipencode(byte_io.getvalue())
        # self.send_response(200)
        # self.send_header('content-type', 'image/png')
        # # self.send_header('content-length', len(bytesValue))
        # self.send_header("Content-length", str(len(str(content))))
        # self.send_header("Content-Encoding", "gzip")
        # self.end_headers()
        # self.wfile.write(content)
        # self.wfile.flush()

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        # Doesn't do anything with posted data
        self._set_headers()
        self.wfile.write("<html><body><h1>POST!</h1></body></html>")


def run(server_class=HTTPServer, handler_class=S, port=8080):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print("Starting httpd")
    httpd.serve_forever()


if __name__ == '__main__':
    opt = TestOptions().parse()
    mytransform = get_transform(opt)
    getoneimage.setup(opt)
    run()
