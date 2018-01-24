// Program to demo order statistic trees in a visual manner
// January 24th 2018, Arthur Alves & Jonathan Ginsburg

let tree = new OST();

function topTenArray() {
	var topTen = [];
	var counter = 0;
	if (tree.treeRoot) tree.treeRoot.inOrder(function(currentNode){ if (counter++ < 10) { topTen.push(currentNode); } else return false; });
	return topTen;
}

function populateTreeInformation() {
	let textContainter = document.getElementById("treeInformation");
	textContainter.innerHTML = "";
	if (!tree.treeRoot)
		return;
	textContainter.innerHTML = `<h3>Top ten:</h3><p> ${topTenArray().reduce(function (accumulator, currentValue) { accumulator += currentValue.toString() + "<br>"; return accumulator; }, "")} </p>`;
}

function addNode() {
	// References to HTML
	let input = document.getElementById("nodeInput");

	// Check for different values from HTML
	if (!isNaN(input.value) && input.value != "") {
		tree.insert(parseInt(input.value));
		draw(getData(tree));
		populateTreeInformation();
	} else {
		alert("Please enter an integer value for node");
	}
}

function removeNode() {
	// References to HTML
	let input = document.getElementById("nodeInput");

	// Check for different values from HTML
	if (!isNaN(input.value) && input.value != "") {
		try {
			tree.remove(parseInt(input.value));
		} catch(e) {
			console.log(e);
		}
		draw(getData(tree));
		populateTreeInformation();
	} else {
		alert("Please enter an integer value for node");
	}
}

function getData(tree) {
	let nodes = [], edges = [];
	if (tree.treeRoot)
		tree.treeRoot.inOrder(function (currentNode) {
			nodes.push({id:currentNode.order, label: `${currentNode.data}, ${currentNode.order}`});
			if (currentNode.antecessor != undefined) {
			edges.push({from: currentNode.antecessor.order, to: currentNode.order});
			}
		});
	let dsNodes = new vis.DataSet(nodes);
	let dsEdges = new vis.DataSet(edges);

	return {nodes: dsNodes, edges: dsEdges};
}

function draw(data) {
	let container = document.getElementById("treeRepresentation");

	let options = {
		edges: {
			smooth: {
				type: 'cubicBezier',
				forceDirection: 'vertical',
				roundness: 0.4
			}
		},
		layout: {
			hierarchical: {
				direction: 'UD',
				sortMethod: 'directed'
			}
		}
	};
	let network = new vis.Network(container, data, options);
}