import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import http from "http";
import fs from "fs";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the port to run on
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  // Extract the requested URL path
  let filePath = join(
    __dirname,
    "dist",
    req.url === "/" ? "index.html" : req.url
  );

  // Extract the file extension
  const fileExt = extname(filePath).toLowerCase();

  // Define the MIME types
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "font/otf",
    ".wasm": "application/wasm",
  };

  const contentType = mimeTypes[fileExt] || "application/octet-stream";
  console.log(`Incoming request: ${req.url}`);
  //check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist or isn't a file, serve index.html
      if (req.url !== "/") {
        // Only log for non-root requests
        console.log(
          `Routing non-existent file, serving index.html for: ${req.url}`
        );
      }
      filePath = join(__dirname, "dist", "index.html"); // Serve index.html for all non-static files

      // Serve the index.html file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Server error: ${err.message}`);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Server Error: ${err.code}`);
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(content, "utf-8");
        }
      });
    } else {
      // If the file exists, serve it normally
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Server error: ${err.message}`);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Server Error: ${err.code}`);
        } else {
          res.writeHead(200, { "Content-Type": contentType });
          res.end(content, "utf-8");
        }
      });
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
