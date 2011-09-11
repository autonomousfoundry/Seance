var seance = require("../lib");
var http = require("http");

exports["attaches to a node http server and closes it when done"] = function(test) {
    var server = createServer();
    var page = seance.attach(server);
    page.close();
    test.done();
};

exports["evaluates a javascript expression and notifies with result"] = function(test) {
    var server = createServer();
    var page = seance.attach(server);
    page.evaluate("document.title", function(value) {
        test.equal("TheTitle", value);
        page.close();
        test.done();
    });
};

exports["executes a javascript statement and notifies when done"] = function(test) {
    var server = createServer();
    var page = seance.attach(server);
    page.execute("document.title = 'NewTitle'", function() {
        page.evaluate("document.title", function(value) {
            test.equal("NewTitle", value);
            page.close();
            test.done();
        });
    });
};

exports["executes multiple javascript statements in order"] = function(test) {
    var server = createServer();
    var page = seance.attach(server);
    page.execute("var x = 2;");
    page.execute("x *= 3;");
    page.execute("x -= 1;");
    page.evaluate("x", function(value) {
        test.equal(value, 5);
        page.close();
        test.done();
    });
};

exports["evaluates javascript and compares the result when available"] = function(test) {
    var server = createServer();
    var page = seance.attach(server);
    page.expectScriptResult("document.title", "TheTitle", function() {
        page.close();
        test.done();
    });
};

exports["provides hasContent to check for presence of text on the page"] = function(test) {
    // Need an async error-trapping mechanism to test the failure case too
    var server = createServer({jquery:true});
    var page = seance.attach(server);
    page.expectContent("SearchText", function() {
        page.close();
        test.done();
    });
};

function createServer(options) {
    return http.createServer(function(req, res) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write("<html><head>");
        if(options && options.jquery) {
            res.write("<script src='http://ajax.googleapis.com/ajax/libs/jquery/1.6.3/jquery.min.js'></script>");
        }
        res.write("<title>TheTitle</title></head>");
        res.end("<body>SearchText</body></html>");
    });
}
