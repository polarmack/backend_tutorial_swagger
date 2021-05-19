const MARKER = "\ue000";

module.exports = (fileContent, method, path) => {
	var sanitizeRegexp = /[^a-z0-9\-_.]/g;
	path = path.replace(sanitizeRegexp, "");
	var methodRegexp = new RegExp(method, "i");
	var pathRegexp = new RegExp(`${path}(\\ue000|[^a-z0-9\\-_./\\}])`, "i");

	var lines = fileContent.split(/\n/g);
	var pathOnly = 0;

	for (var i = 0, ii = lines.length; i < ii; i++) {
		var line = lines[i].replace(sanitizeRegexp, "") + MARKER;
		var pathFound = pathRegexp.test(line);
		if (!pathFound) continue;

		var methodFound = methodRegexp.test(line);
		if (methodFound) return "#line." + (i + 1);

		if (!pathOnly) pathOnly = i;
	}

	if (!pathOnly) return "";
	return "#line." + (pathOnly + 1);
};
