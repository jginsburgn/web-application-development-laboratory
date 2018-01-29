function getMatrixGroups(matrix) {
	var visited = [];
	var groups = [];
	function getColumnCount() {
		return matrix[0] ? matrix[0].length : -1;
	}
	function inInterval(value, lowerInclusive, upperInclusive) {
		return lowerInclusive <= value && value <= upperInclusive;
	}
	function getValue(point) {
		return matrix[point.R][point.C];
	}
	function getNeighbors(point) {
		var neighbors = [];
		for (var r = point.R - 1; r <= point.R + 1; ++r) {
			for (var c = point.C - 1; c <= point.C + 1; ++c) {
				var cc = getColumnCount();
				if (inInterval(r, 0, matrix.length - 1) && inInterval(c, 0, cc - 1) && !(r == point.R && c == point.C))
					neighbors.push({R: r, C: c});
			}
		}
		return neighbors;
	}
	function isPointInGroup(point, group) {
		for (var i = 0; i < group.length; ++i) {
			var currentPoint = group[i];
			if (currentPoint.R == point.R && currentPoint.C == point.C) return true;
		}
		return false;
	}
	function indicesOfGroupsWith(point) {
		var indices = [];
		for (var i = 0; i < groups.length; ++i) {
			var group = groups[i];
			//console.log(`Testing whether group ${JSON.stringify(group)} contains point ${JSON.stringify(point)}.`);
			if (isPointInGroup(point, group)) indices.push(i);
		}
		if (indices.length > 0) return indices;
		throw new Error(`No group with point ${JSON.stringify(point)}.`);
	}
	function mergeGroups(indices) {
		var newGroup = [];
		for (var index of indices) {
			for (var value of groups[index]) {
				isPointInGroup(value, newGroup) || newGroup.push(value);
			}
		}
		indices.sort();
		for (var i = indices.length - 1; i >= 0; --i) {
			groups.splice(indices[i], 1);
		}
		return groups.push(newGroup) - 1;
	}
	function joinNeighborGroups(point) {
		var neighborPoints = getNeighbors(point);
		var neighborGroups = [];
		for (var i = 0; i < neighborPoints.length; ++i) {
			var neighborPoint = neighborPoints[i];
			var iogw = [];
			try {
				iogw = indicesOfGroupsWith(neighborPoint);
			}
			catch (e) {
				//console.log(e);
			}
			if (iogw) for (var index of iogw) { neighborGroups.includes(index) || neighborGroups.push(index); }
		}
		//console.log(`Indices of neighbor groups: ${JSON.stringify(neighborGroups)}`);
		if (neighborGroups.length > 0) {
			groups[mergeGroups(neighborGroups)].push(point);
			return true;
		}
		return false;
	}
	function createNewGroup(point) {
		//console.log(`New group with point: ${JSON.stringify(point)}.`);
		groups.push([point]);
	}
	function visit(point) {
		if (isPointInGroup(point, visited)) return;
		//console.log(`Visiting ${JSON.stringify(point)}. Current groups: ${JSON.stringify(groups)}. Visited: ${JSON.stringify(visited)}.`);
		visited.push(point);
		getValue(point) == 0 || joinNeighborGroups(point) || createNewGroup(point);
		getNeighbors(point).forEach( (currentValue)=>{ visit(currentValue); });
	}
	visit({R: 0, C: 0});
	return groups;
}
function printMatrix(matrix) {
	var rows = matrix.length;
	var columns = matrix[0] ? matrix[0].length : 0;
	for (var i = 0; i < rows; ++i) {
		console.log(matrix[i]);
	}
}
function generateRandomMatrix(rows, columns) {
	var matrix = [];
	for (var i = 0; i < rows; ++i) {
		var row = [];
		for (var j = 0; j < columns; ++j) {
			row.push(Math.round(Math.random()));
		}
		matrix.push(row);
	}
	return matrix;
}
function main() {
	//var matrix = generateRandomMatrix(7, 7);
	var matrix = 
	[
		[1,1,0,0,0,0],
		[1,1,0,0,1,1],
		[0,0,0,1,0,0],
		[0,0,1,1,0,0],
		[0,0,1,0,0,1],
		[0,0,0,0,1,1]
	];
	printMatrix(matrix);
	var groups = getMatrixGroups(matrix);
	var largestGroupIndex = groups.reduce((accumulator, currentValue, currentIndex, array)=>{ if(currentValue.length > array[accumulator].length) return currentIndex; return accumulator; }, 0);
	console.log(`The largest group is: ${JSON.stringify(groups[largestGroupIndex])}.`);
}
main();
