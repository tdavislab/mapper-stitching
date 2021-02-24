var matrix = {}
var distanceSum = {}
var jSpheres = {}
var sd;
console.log( cy) 

function distanceMatrix(weight) {
	var matrix = {}
	var distanceSum = {}
	var jSpheres = {}
	var sd = cy.elements().floydWarshall({weight: weight})
	var sd2 = cy.elements().floydWarshall()
	for (let n of cy.nodes()) {
		let id = n.id();
		jSpheres[id] = {}
		for (let m of cy.nodes()) {
			d = sd.distance(n, m)
			let d2 = sd2.distance(n, m)
			if(d2 > 0){
				if (matrix[d2]) {
					matrix[d2] += 1
				} else {
					matrix[d2] = 1
				}
			}
			if (d > 0 && d != Infinity) {
				// if (matrix[d]) {
				// 	matrix[d] += 1
				// } else {
				// 	matrix[d] = 1
				// }

				if (jSpheres[id][d]) {
					jSpheres[id][d] += 1
				} else {
					jSpheres[id][d] = 1
				}

				if (distanceSum[n.id()]) {
					distanceSum[n.id()] += d
				} else {
					distanceSum[n.id()] = d
				}
			}
		}
	}
	return {sd: sd, matrix: matrix, jSpheres: jSpheres, distanceSum: distanceSum};
}

// eq 23 from "A history of graph entropy measures"
// 2k_i: how many times element i appears in the distance matrix
function globalEntropy1(matrix) {
	let e = 0
	let n = cy.nodes().length;
	if(n===0){
		return 0;
	}
	let ns = n * n
	for (let i of Object.values(matrix)) {
		// tmp = 2 * i / ns
		tmp = i / ns
		e += tmp * Math.log(tmp)
	}
	return -1 / n * Math.log(1 / n) - e
}

function weinerIndex(matrix) {
	let w = 0
	for (const [key, value] of Object.entries(matrix)) {
		w += key * value
	}
	// return w
	return w/2
}

// eq 25 from "A history of graph entropy measures"
function globalEntropy2(matrix) {
	let e = 0
	let w = weinerIndex(matrix)
	for (const [key, value] of Object.entries(matrix)) {
		e += (key * (value/2) / w) * Math.log(key / w)
	}
	return -e
}


// eq 32 from "A history of graph entropy measures"
function localEntropy1(sd, distanceSum) {
	let nodeEntropy = {}
	for (let n of cy.nodes()) {
		let e = 0;
		let ds = distanceSum[n.id()]
		for (let m of cy.nodes()) {
			d = sd.distance(n, m)
			if (d > 0 && d != Infinity) {
				e += d / ds * Math.log(d / ds)
			}
		}
		nodeEntropy[n.id()] = -e;
	}
	return nodeEntropy;
}

// eq 35 from "A history of graph entropy measures"
function localEntropy2(jSpheres) {
	let v = cy.nodes().length;
	let nodeEntropy = {}
	for (let n of cy.nodes()) {
		let e = 0
		for (let i of Object.values(jSpheres[n.id()])) {
			e += i / v * Math.log(i / v)
		}
		nodeEntropy[n.id()] = -e;
	}
	return nodeEntropy;
}
