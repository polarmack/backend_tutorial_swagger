const _ = require("lodash");
const findLineNumber = require("./find_line_number");

exports.addMissingRoutes = (doc, routerFiles) => {
	for (var file of routerFiles) {
		var routesInCode = route2Swagger(file.tag, file.filepath);

		var paths = (doc.paths = doc.paths || {});
		for (var { pathName, method, tags } of routesInCode) {
			if (
				paths[pathName] &&
				paths[pathName][method] &&
				paths[pathName][method].description
			)
				continue;

			paths[pathName] = paths[pathName] || {};
			paths[pathName][method] = paths[pathName][method] || {
				deprecated: true,
				description: "The route exists but no document.",
				tags,
			};
		}
	}
	return doc;
};

exports.addSchema = (doc, schemaFiles) => {
	var schemas = {};
	for (var file of schemaFiles)
		schemas[file.tag] = model2JsonSchema(file.filepath);
	var ans = _.merge({ components: { schemas } }, doc);

	var tagLookup = _.keyBy(schemaFiles, "tag");
	for (var tag in schemas) {
		var file = tagLookup[tag];
		if (!file) continue;

		var current = schemas[tag];
		current.description = current.description || "";
		current.description += ` [(source)](schema/${file.filename})`;
	}
	return ans;
};

exports.addTestCase = (doc, specFiles) => {
	var tagLookup = _.keyBy(specFiles, "tag");
	for (var pathName in doc.paths) {
		var methods = doc.paths[pathName];
		for (var method in methods) {
			var api = methods[method];
			if (!api.tags) continue;

			var tagsWoSlash = api.tags.map((a) => a.replace(/^\//, ""));
			var matchingTag = _.find(tagsWoSlash, (a) => !!tagLookup[a]);
			if (!matchingTag) continue;

			var file = tagLookup[matchingTag];
			var lineNumberHash = findLineNumber(file.content, method, pathName);

			api.description = api.description || "";
			api.description += ` [(test case)](spec/${file.filename}${lineNumberHash})`;
		}
	}
	return doc;
};

const route2Swagger = (parent, file) => {
	var router = require(file);
	var ans = [];
	for (var route of router.stack) {
		var pathName = "/" + parent + route.route.path;
		var tags = ["/" + parent];
		pathName = pathName.replace(/\/:([^\/]+)/g, "/{$1}").replace(/\/$/, "");
		for (var method in route.route.methods)
			ans.push({ pathName, method, tags });
	}
	return ans;
};

const model2JsonSchema = (file) => {
	var model = require(file);
	lazyMongooseInit(model);
	var ans = model.schema.jsonSchema();
	if (ans.properties) delete ans.properties.__v;
	ans.description = "";
	return ans;
};

var isMongooseInit = false;
const lazyMongooseInit = (anyModel) => {
	if (!isMongooseInit) {
		require("mongoose-schema-jsonschema")(anyModel.base);
		isMongooseInit = true;
	}
};
