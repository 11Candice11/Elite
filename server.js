import express, { json } from 'express';
import commandLineArgs from 'command-line-args';
import compression from 'compression';
import fse from 'fs-extra';
import cors from 'cors';

const { port } = commandLineArgs([{ name: `port`, type: Number, defaultValue: 8080 }]);

let env = (process.env.ENV ?? ``).trim().toLowerCase();
if (env === `prd`) {
	env = `prod`;
}
console.log(`Running environment: ${env}`);

const app = express();

app.use(cors());

const host = `0.0.0.0`;


let csp = ``;
if (fse.existsSync(`dist/csp.json`)) {
	const cspJsonString = fse.readFileSync(`dist/csp.json`, `utf8`);
	if (cspJsonString) {
		const cspJson = JSON.parse(cspJsonString);
		for (const directive in cspJson) {
			if (Object.hasOwnProperty.call(cspJson, directive)) {
				csp += `${directive} ${cspJson[directive].join(` `)}; `;
			}
		}
	}
}

app.use(json());
app.use(compression());

// Liveness Healthcheck
app.use(`/health/liveness`, (req, res) => {
	res.status(200).send("Alive!");
});

// Readiness Healthcheck
app.use(`/health/readiness`, (req, res) => {
	res.status(200).send("Ready!");
});

// Caching
app.use((req, res, next) => {

	if (!res.get(`Expires`)) {
		// Set expiry date to 90 days from now
		const date = new Date();
		date.setDate(date.getDate() + 90);
		res.set(`Expires`, date.toISOString());
	}

	if (!res.get(`Cache-Control`)) {
		res.set(`Cache-Control`, `private, no-cache`);
	}

	if (!res.get(`X-Content-Type-Options`)) {
		res.set(`X-Content-Type-Options`, `nosniff`);
	}

	next();

});

// CSP
if (csp) {
	app.use((req, res, next) => {

		res.set(`Content-Security-Policy`, csp);

		next();

	});
}

// To support env specific config.
app.use(`/config.json`, (request, response) => {
	if (!env) {
		response.sendFile(`${process.cwd()}/dist/config.json`);
	} else {

		response.sendFile(`${process.cwd()}/dist/config.${env}.json`);
	}
});
// To support env specific runtime.
app.use(`/runtime.json`, (request, response) => {
	if (!env) {
		response.sendFile(`${process.cwd()}/dist/runtime.json`);
	} else {

		response.sendFile(`${process.cwd()}/dist/runtime.${env}.json`);
	}
});
// "config" endpoint of host.
app.use(`/platform/config/v1/config/:key`, (req, res) => {
	console.log(`CONFIG [${req.params.key}]:`);
	res.status(200).send(process.env[req.params.key]);
});

// All the rest
app.use(`/`, express.static(`dist`));

// To support-client side routing.
app.get(`*`, (request, response) => {
	response.sendFile(`${process.cwd()}/dist/index.html`);
});

// "audit" endpoint of host.
app.post(`/platform/auditer/v1/audit`, (req, res) => {
	console.log(`AUDIT [${req.path}]: ${JSON.stringify(req.body)}`);
	res.status(200).send();
});

// "log" endpoint of host.
app.post(`/platform/logger/v1/log`, (req, res) => {
	console.log(`LOG [${req.path}]: ${JSON.stringify(req.body)}`);
	res.status(200).send();
});


// "metric single" endpoint of host.
app.post(`/platform/metric/v1/single`, (req, res) => {
	console.log(`METRIC SINGLE [${req.path}]:`);
	console.log(JSON.stringify(req.body));
	res.status(200).send();
});

// "metric batch" endpoint of host.
app.post(`/platform/metric/v1/batch`, (req, res) => {
	console.log(`METRIC BATCH [${req.path}]:`);
	console.log(JSON.stringify(req.body));
	res.status(200).send();
});

// "telemetry event" endpoint of host.
app.post(`/platform/telemetry/v1/event`, (req, res) => {
	console.log(`TELEMETRY EVENT [${req.path}]: ${JSON.stringify(req.body)}`);
	res.status(200).send();
});

// "telemetry start span" endpoint of host.
app.post(`/platform/telemetry/v1/span/start`, (req, res) => {
	console.log(`SPAN START [${req.path}]: ${JSON.stringify(req.body)}`);
	res.status(200).send();
});

// "telemetry end span" endpoint of host.
app.post(`/platform/telemetry/v1/span/end`, (req, res) => {
	console.log(`SPAN END [${req.path}]: ${JSON.stringify(req.body)}`);
	res.status(200).send();
});

app.listen(port, host, () => {
	console.log(`Running on http://${host}:${port}`);
});