function suma() {
	var accumulator = 0;
	for (var a in arguments) {
		accumulator += a;
	}
	return accumulator;
}

function greatest() {
	switch (arguments.length) {
		case 1:
			return arguments[0];
			break;
		case 2: 
			return arguments[0] < arguments[1] ? arguments[1] : arguments[0];
			break;
		default:
			// Do nothing
			return;
	}
}

function getSamurai(samurai) {
	"use strict";
	arguments[0] = "Ishida";
	return samurai;
}

function getNinja(ninja) {
	arguments[0] = "Fuma";
	return ninja;
}
