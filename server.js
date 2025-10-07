import http from "http";
import fs from "fs";

let PORT = process.env.PORT || 9000;
let https_port = 443;

let options = {
  key: fs.readFileSync(
    "./key.pem"
  ),
  cert: fs.readFileSync(
    "./cert.pem"
  ),
};

let server = http.createServer((req, res) => {
  console.log("Incoming request:", req.method, req.url);
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET", "POST", "PUT", "DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method == "OPTIONS") {
    console.log("Preflight OPTIONS API");
    res.statusCode = 200;
    res.end();
    return;
  }

  const my_url = new URL(req.url, `http://${req.headers.host}`);

  switch (my_url.pathname) {
    case "/":
      res.end(`Welcome to Home Page`);
      break;

    case "/about":
      res.end(`This is about us page`);
      break;

    case "/contact":
      if (req.method == "POST") {
        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          console.log(
            `Received data from /contact by ${req.socket.remoteAddress}: ${body}`
          );

          try {
            let data = [];

            let fileData = fs.readFileSync("./database/data.json", (err) => {
              if (err) console.log(err);
            });

            data = JSON.parse(fileData);

            const newData = JSON.parse(body);

            data.push(newData);

            fs.writeFile("./database/data.json", JSON.stringify(data, null, 4), (err) => {
              if (err) console.log(err);
              else console.log("Data saved!");
            });
          } catch (error) {
            console.log(error);
          }

        });
      } else if (req.method == "GET") {
        res.statusCode = 200;
        res.end("End");
      }
      break;
    default:
      res.statusCode = 404;
      res.end("error: Page Not Found");
      break;
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
