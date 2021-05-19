const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const express = require("express");
const transform = require("./swagger_transform");
const path = require("path");
const _ = require("lodash");
const glob = require("glob");
const fs = require("fs");

const SWAGGER_OPTIONS = {
	swaggerOptions: {
		defaultModelsExpandDepth: 2,
		defaultModelExpandDepth: 2,
		docExpansion: "none",
		filter: true,
		validatorUrl: null,
		deepLinking: true,
	},
};

module.exports = (swaggerPath, schemaGlob, specGlob, routeGlob) => {
	var swaggerDoc = YAML.load(swaggerPath);
	var router = express.Router();

	if (schemaGlob) {
		var schemaFiles = glob2Files(schemaGlob);
		router.use("/_schema", serveGlob(schemaFiles));
		router.use("/schema", serveHighlighter("/_schema"));
		swaggerDoc = transform.addSchema(swaggerDoc, schemaFiles);
	}

	if (specGlob) {
		var specFiles = glob2Files(specGlob, true);
		router.use("/_spec", serveGlob(specFiles));
		router.use("/spec", serveHighlighter("/_spec"));
		swaggerDoc = transform.addTestCase(swaggerDoc, specFiles);
	}

	if (routeGlob) {
		var routeFiles = glob2Files(routeGlob);
		swaggerDoc = transform.addMissingRoutes(swaggerDoc, routeFiles);
	}

	return [
		router,
		swaggerUi.serve,
		swaggerUi.setup(swaggerDoc, SWAGGER_OPTIONS),
	];
};

const serveGlob = (files) => {
	var allFiles = _.keyBy(files, "filename");
	return (req, res, next) => {
		var targetFile = allFiles[req.path.slice(1)];
		if (!targetFile) return res.status(404).send("not found");

		res.sendFile(targetFile.filepath);
	};
};

const serveHighlighter = (prefix) => {
	return (req, res, next) => {
		var html = `<!DOCTYPE html>
<html>
<head>
	<link href="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.min.css" rel="stylesheet" />
	<link href="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
	<link href="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-highlight/prism-line-highlight.min.css" rel="stylesheet" />
</head>
<body style="background: #f5f2f0; padding-bottom: 40px;">
	<header data-plugin-header="line-numbers"></header>
	<pre id="line" class="line-numbers linkable-line-numbers" data-src="..${prefix}${req.path}"></pre>
	<script src="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-highlight/prism-line-highlight.min.js"></script>
	<script>
	//force trigger hashchange after the code is loaded
	var clear = setInterval(function(){
		window.dispatchEvent(new HashChangeEvent("hashchange"));
		if(document.querySelector('.line-highlight'))
			clearInterval(clear);
	},200);
	</script>
</body>
</html>`;
		res.setHeader("content-type", "text/html");
		res.send(html);
	};
};

const glob2Files = (globPath, readFile) =>
	glob.sync(globPath).map((a) => {
		var ans = {
			filepath: a,
			filename: path.basename(a),
			tag: path.basename(a).split(".")[0],
		};
		if (readFile) ans.content = fs.readFileSync(ans.filepath, "utf8");
		return ans;
	});
