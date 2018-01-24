// See https://en.wikipedia.org/wiki/Order_statistic_tree.
// The following implements an order statistic tree class.
// January 24th 2018, Arthur Alves & Jonathan Ginsburg

var OSTNodePrototype = {
	insert: function (node) {
		if (node instanceof OSTNode) {
			// Node is already built.
			if (this.lessThan(node.data, this.data)) {
				if (this.left) { 
					this.left.insert(node);
				}
				else {
					node.antecessor = this;
					node.tree = this.tree;
					this.left = node;
				}
				if (this.right) this.right.propagateOrderChange(function(currentNode){ currentNode.order++; });
				this.order++;
			}
			else {
				node.order = this.order + 1;
				if (this.right) {
					this.right.insert(node);
				}
				else {
					node.antecessor = this;
					node.tree = this.tree;
					this.right = node;
				}
			}
		}
		else if (node != undefined) {
			// Data is passed so node must be built.
			this.insert(new OSTNode(node, this.tree));
		}
		else throw "No node nor data to insert.";
	},
	remove: function(node) {
		if (node instanceof OSTNode) {
			// Node is already built.
			if (this.compare(node.data, this.data)) {
				if (!this.left && !this.right) { // No children.
					if (this.antecessor) {
						if (this.antecessor.left && this.compare(this.antecessor.left.data, this.data)) this.antecessor.left = undefined;
						else this.antecessor.right = undefined;
						this.antecessor = undefined;
					}
					else {
						if (this.tree) this.tree.treeRoot = undefined;
					}
				}
				else if (!this.left && this.right) { // Only right child.
					this.right.antecessor = this.antecessor;
					this.right.propagateOrderChange(function(currentNode){ currentNode.order--; });
					if (this.antecessor) {
						if (this.antecessor.left && this.compare(this.antecessor.left.data, this.data)) {
							this.antecessor.left = this.right;
						}
						else {
							this.antecessor.right = this.right;
						}
					}
					else {
						if (this.tree) this.tree.treeRoot = this.right;
					}
				}
				else if (this.left && !this.right) { // Only left child.
					this.left.antecessor = this.antecessor;
					if (this.antecessor) {
						if (this.antecessor.left && this.compare(this.antecessor.left.data, this.data)) {
							this.antecessor.left = this.left;
						}
						else {
							this.antecessor.right = this.left;
						}
					}
					else {
						if (this.tree) this.tree.treeRoot = this.left;
					}
				}
				else { // Both children.
					var infimumOfThis = this.left.max();
					this.data = infimumOfThis.data;
					this.order--;
					if (infimumOfThis.left) {
						infimumOfThis.left.antecessor = infimumOfThis.antecessor;
					}
					if (infimumOfThis.antecessor.left && this.compare(infimumOfThis.antecessor.left.data, infimumOfThis.data)) {
						infimumOfThis.antecessor.left = infimumOfThis.left;
					}
					else {
						infimumOfThis.antecessor.right = infimumOfThis.left;
					}
					this.right.propagateOrderChange(function(currentNode){ currentNode.order--; });
				}
			}
			else {
				if (this.lessThan(node.data, this.data)) {
					if (!this.left) throw "Trying to remove a node that does not exist.";
					this.left.remove(node);
					this.order--;
					if (this.right) this.right.propagateOrderChange(function(currentNode){ currentNode.order--; });
				}
				else {
					if (!this.right) throw "Trying to remove a node that does not exist.";
					this.right.remove(node);
				}
			}
		}
		else if (node != undefined) {
			// Data is passed so node must be built.
			this.remove(new OSTNode(node, this.tree));
		}
		else throw "No node nor data to remove.";
	},
	select: function(order) {
		if (this.order == order) return this;
		else {
			if (this.order < order && this.right) return this.right.select(order);
			if (this.order > order && this.left) return this.left.select(order);
			throw `Node not found for order given: ${this.order}.`;
		}
	},
	rank: function(node) {
		if (node instanceof OSTNode) {
			if (node.data == this.data) return this.order;
			if (this.lessThan(node.data, this.data) && this.left) return this.left.rank(node);
			if (this.right) return this.right.rank(node);
			throw "Node given was not found in tree.";
		}
	},
	lessThan: function(aData, bData) {
		if (this.tree) return this.tree.lessThan(aData, bData);
		return aData < bData;
	},
	compare: function(aData, bData) {
		if (this.tree) return this.tree.compare(aData, bData);
		return aData == bData;
	},
	propagateOrderChange: function(change) {
		change(this);
		if (this.left) this.left.propagateOrderChange(change);
		if (this.right) this.right.propagateOrderChange(change);
	},
	max: function() {
		if (this.right) return this.right.max();
		else return this;
	},
	inOrder: function(operation) {
		if (!(operation instanceof Function)) {
			operation = function(current) {
				console.log(current.toString());
			}
		}
		var shouldContinue = true;
		if (this.left) shouldContinue = this.left.inOrder(operation);
		if (shouldContinue == undefined || shouldContinue) shouldContinue = operation(this);
		if (this.right && (shouldContinue == undefined || shouldContinue)) shouldContinue = this.right.inOrder(operation);
		return shouldContinue;
	},
	toString: function() {
		return `Node with data: ${this.data}, left child: ${this.left != undefined && this.left.data}, right child: ${this.right != undefined && this.right.data}, antecessor: ${this.antecessor != undefined && this.antecessor.data}, order: ${this.order}.`;
	}
};

function OSTNode(data, tree) {
	if (new.target) {
		// Verify there is data for the new node.
		if (data == undefined) throw "Empty data used to create OSTNode.";

		// Initialize property of order to 0.
		this.order = 0;
		
		// Set connections to undefined.
		this.antecessor = undefined;
		this.left = undefined;
		this.right = undefined;

		// Keep record of the data.
		this.data = data;

		// Keep record of the tree that this node belongs to.
		this.tree = tree;
	}
	else {
		throw "OSTNode must be used as constructor only.";
	}
}

OSTNode.prototype = OSTNodePrototype;

var OSTPrototype = {
	lessThan: function(aData, bData) {
		return aData < bData;
	},
	compare: function(aData, bData) {
		return aData == bData;
	},
	insert: function(nodeOrData) {
		if (nodeOrData instanceof OSTNode) {
			if (this.treeRoot) this.treeRoot.insert(nodeOrData);
			else this.treeRoot = nodeOrData;
			this.treeRoot.tree = this;
		}
		else if (nodeOrData != undefined) {
			this.insert(new OSTNode(nodeOrData, this));
		}
		else {
			throw "No node nor data to insert.";
		}
	},
	remove: function(nodeOrData) {
		if (nodeOrData instanceof OSTNode) {
			if (this.treeRoot) this.treeRoot.remove(nodeOrData);
			else throw "Tree is empty, cannot remove anything.";
		}
		else if (nodeOrData != undefined) {
			this.remove(new OSTNode(nodeOrData, this));
		}
		else throw "No node nor data to remove";
	},
	select: function(order) {
		if (this.treeRoot) {
			return this.treeRoot.select(order);
		}
		throw "Tree is empty, cannot select anything.";
	},
	rank: function(nodeOrData) {
		if (nodeOrData instanceof OSTNode) {
			if (this.treeRoot) return this.treeRoot.rank(nodeOrData);
			else throw "Tree is empty, cannot rank anything.";
		}
		else if (nodeOrData != undefined) {
			return this.rank(new OSTNode(nodeOrData, this));
		}
		else throw "No node nor data to rank";
	}
};

function OST(lessThan, compare) {
	if (!new.target) throw "OST constructor must be called with new.";
	if (lessThan instanceof Function) this.lessThan = lessThan;
	if (compare instanceof Function) this.compare = compare;
	this.treeRoot = undefined;
}

OST.prototype = OSTPrototype;

function testOST() {
	var tree = new OST();
	var inserted = [];
	for (var i = 0; i < 20; ++i) {
		var random = Math.floor(Math.random() * 100);
		inserted.push(random);
		console.log(`Inserting ${random}.`);
		tree.insert(random);
		tree.treeRoot.inOrder(function(currentNode){ console.log(currentNode.toString()); });
	}
	for (var i = 0; i < 10; ++i) {
		var randomIndex = Math.floor(Math.random() * inserted.length);
		console.log(`Rank of ${inserted[randomIndex]} is ${tree.rank(inserted[randomIndex])}.`);
	}
	for (var i = 0; i < 10; ++i) {
		var randomRank = Math.floor(Math.random() * inserted.length);
		console.log(`The selection of node with rank ${randomRank} is ${tree.select(randomRank).data}.`);
	}
	var topTen = [];
	var counter = 0;
	tree.treeRoot.inOrder(function(currentNode){ if (counter++ < 10) { topTen.push(currentNode.data); } else return false; });
	console.log(topTen);
	while (inserted.length > 0) {
		var randomIndex = Math.floor(Math.random() * inserted.length);
		console.log(`Removing ${inserted[randomIndex]}.`);
		tree.remove(inserted[randomIndex]);
		inserted.splice(randomIndex, 1);
		if (inserted.length > 0) tree.treeRoot.inOrder();
	}
}
