const express = require("express");
const util = require("util");
const app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var sqlite3 = require('sqlite3').verbose();

const DBSOURCE = "feedback.db";
const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
});

var HTTP_PORT = 8011

app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests
    // sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});


app.get('/list', (req, res) => {
    var output = '';
    db.all("SELECT * FROM feedback", [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log(row.id);
            output += `${row.id}:${row.q1}:${row.q2}:${row.q3}:${row.q4}:${row.freetext}\n`;
        });
        res.header("Content-Type", "text/plain");
        res.send(output);
    });
});

app.post("/save", (req, res) => {
    console.log(JSON.stringify(req.body));
    if ('a1' in req.body) {
        db.run("INSERT INTO feedback VALUES (?,?,?,?,?,?,?)", [
            null,
            req.body.a1,
            req.body.a2,
            req.body.a3,
            req.body.a4,
            req.body.t,
            req.headers["user-agent"]
        ]);
    }
    res.end(JSON.stringify({ "thank": "you" }));
});

app.get("/", (req, res) => {

    res.send(`<!DOCTYPE html>
	<html>
	<meta name="viewport" content="width=device-width, initial-scale=1"/>
	<head>
        <title>Digital Peace Talks Feedback Form</title>
	<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
	<link href="dpt_sf.css" rel="stylesheet" />
	</head>
	<body>
	<div>
        <form id="feedback">
		<p><b>Please rate the Digital Peace Talks project in these aspects:</b></p>
		<ul>
		<li>	
			How do you like the idea of the Digital Peace talks?
			<br>
			<span class="rating">
			<input type="radio" name="rating1" value="5"><span class="star"></span>
			<input type="radio" name="rating1" value="4"><span class="star"></span>
    		<input type="radio" name="rating1" value="3"><span class="star"></span>
			<input type="radio" name="rating1" value="2"><span class="star"></span>
			<input type="radio" name="rating1" value="1"><span class="star"></span>
			</span>
		</li>
		<li>
			How do you like the movement of the 3D camera? (1-5 Sterne)
			<br>
			<span class="rating">
			<input type="radio" name="rating2" value="5"><span class="star"></span>
			<input type="radio" name="rating2" value="4"><span class="star"></span>
    		<input type="radio" name="rating2" value="3"><span class="star"></span>
			<input type="radio" name="rating2" value="2"><span class="star"></span>
			<input type="radio" name="rating2" value="1"><span class="star"></span>
			</span>
		</li>
		<li>
			How do you like the chat module? (1-5 Sterne)
			<br>
			<span class="rating">
			<input type="radio" name="rating3" value="5"><span class="star"></span>
			<input type="radio" name="rating3" value="4"><span class="star"></span>
    		<input type="radio" name="rating3" value="3"><span class="star"></span>
			<input type="radio" name="rating3" value="2"><span class="star"></span>
			<input type="radio" name="rating3" value="1"><span class="star"></span>
			</span>
		</li>
		<li>
			How do you like the login process? (1-5 Sterne)
			<br>
			<span class="rating">
			<input type="radio" name="rating4" value="5"><span class="star"></span>
			<input type="radio" name="rating4" value="4"><span class="star"></span>
    		<input type="radio" name="rating4" value="3"><span class="star"></span>
			<input type="radio" name="rating4" value="2"><span class="star"></span>
			<input type="radio" name="rating4" value="1"><span class="star"></span>
			</span>
		</li>
		</ul>
		Feel free to express your Digital Peace Talks experience in your own words:<br>
		<textarea id="freetext" name="freetext" rows="5" cols="63"></textarea>
		<br>
		<input type="submit" value="Send">
		<button id="cancel" type="button">Cancel</button
	</form>
	</div>
	<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
	<script type="text/javascript">
	document.addEventListener("DOMContentLoaded", function(event) {
		jQuery('#cancel').on('click', (event) => {
			console.log('ready to suicide');
			parent.postMessage("simple-feedback-finished","*");
		})
		jQuery('#feedback').on('submit', function(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			var a1 = jQuery('[name="rating1"]:checked').val();
			var a2 = jQuery('[name="rating2"]:checked').val();
			var a3 = jQuery('[name="rating3"]:checked').val();
			var a4 = jQuery('[name="rating4"]:checked').val();
			var t = jQuery('[name="freetext"]').val();
			console.log({a1: a1, a2: a2, a3: a3, a4: a4, t: t});
			try {
			jQuery.ajax({ 
				url: '/save',
				type: 'POST',
				cache: false, 
				data: JSON.stringify({a1: a1, a2: a2, a3: a3, a4: a4, t: t}),
				success: function(data){
					parent.postMessage("simple-feedback-finished","*")
					alert('Thank You!');
				},
				error: function(jqXHR, status, err) {
					parent.postMessage("simple-feedback-finished","*")
					alert('text status '+status+', err '+err);
				},
				dataType: 'json',
				contentType: "application/json",
			});
			} catch(err) {
				console.log('err: '+err);
			}
		});
	});
	</script>
	</body>
	</html>
	`);
    res.status(200);
    console.log("Serve user at " + req.headers.host);
});

app.use(function(req, res) {
    res.status(404);
});