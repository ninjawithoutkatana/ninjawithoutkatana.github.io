//APPLICATION?edufile.qrgenerator/v0.2(#edufile6.3.0525)
"use strict";

var qrcodegen = new function () {
	this.QrCode = function (version, errCorLvl, dataCodewords, mask) {

		if (version < MIN_VERSION || version > MAX_VERSION)
			throw "Version value out of range";
		if (mask < -1 || mask > 7)
			throw "Mask value out of range";
		if (!(errCorLvl instanceof Ecc))
			throw "QrCode.Ecc expected";
		var size = version * 4 + 17;

		var row = [];
		for (var i = 0; i < size; i++)
			row.push(false);
		var modules = [];
		var isFunction = [];
		for (var i = 0; i < size; i++) {
			modules.push(row.slice());
			isFunction.push(row.slice());
		}

		drawFunctionPatterns();
		var allCodewords = addEccAndInterleave(dataCodewords);
		drawCodewords(allCodewords);

		if (mask == -1) {
			var minPenalty = Infinity;
			for (var i = 0; i < 8; i++) {
				applyMask(i);
				drawFormatBits(i);
				var penalty = getPenaltyScore();
				if (penalty < minPenalty) {
					mask = i;
					minPenalty = penalty;
				}
				applyMask(i);
			}
		}
		if (mask < 0 || mask > 7)
			throw "Assertion error";
		applyMask(mask);
		drawFormatBits(mask);

		isFunction = null;

		Object.defineProperty(this, "version", {
			value: version
		});

		Object.defineProperty(this, "size", {
			value: size
		});

		Object.defineProperty(this, "errorCorrectionLevel", {
			value: errCorLvl
		});

		Object.defineProperty(this, "mask", {
			value: mask
		});

		this.getModule = function (x, y) {
			return 0 <= x && x < size && 0 <= y && y < size && modules[y][x];
		};

		this.drawCanvas = function (scale, border, canvas) {
			if (scale <= 0 || border < 0)
				throw "Value out of range";
			var width = (size + border * 2) * scale;
			canvas.width = width;
			canvas.height = width;
			var ctx = canvas.getContext("2d");
			for (var y = -border; y < size + border; y++) {
				for (var x = -border; x < size + border; x++) {
					ctx.fillStyle = this.getModule(x, y) ? "#000000" : "#FFFFFF";
					ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
				}
			}
		};

		this.toSvgString = function (border) {
			if (border < 0)
				throw "Border must be non-negative";
			var parts = [];
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					if (this.getModule(x, y))
						parts.push("M" + (x + border) + "," + (y + border) + "h1v1h-1z");
				}
			}
			return '<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' +
				(size + border * 2) + ' ' + (size + border * 2) + '" stroke="none">\n' +
				'\t<rect width="100%" height="100%" fill="#FFFFFF"/>\n' +
				'\t<path d="' + parts.join(" ") + '" fill="#000000"/>\n' +
				'</svg>\n';
		};

		function drawFunctionPatterns() {
			for (var i = 0; i < size; i++) {
				setFunctionModule(6, i, i % 2 == 0);
				setFunctionModule(i, 6, i % 2 == 0);
			}

			drawFinderPattern(3, 3);
			drawFinderPattern(size - 4, 3);
			drawFinderPattern(3, size - 4);

			var alignPatPos = getAlignmentPatternPositions();
			var numAlign = alignPatPos.length;
			for (var i = 0; i < numAlign; i++) {
				for (var j = 0; j < numAlign; j++) {
					if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
						drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
				}
			}

			drawFormatBits(0);
			drawVersion();
		}

		function drawFormatBits(mask) {
			var data = errCorLvl.formatBits << 3 | mask;
			var rem = data;
			for (var i = 0; i < 10; i++)
				rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
			var bits = (data << 10 | rem) ^ 0x5412;
			if (bits >>> 15 != 0)
				throw "Assertion error";

			for (var i = 0; i <= 5; i++)
				setFunctionModule(8, i, getBit(bits, i));
			setFunctionModule(8, 7, getBit(bits, 6));
			setFunctionModule(8, 8, getBit(bits, 7));
			setFunctionModule(7, 8, getBit(bits, 8));
			for (var i = 9; i < 15; i++)
				setFunctionModule(14 - i, 8, getBit(bits, i));

			// Draw second copy
			for (var i = 0; i < 8; i++)
				setFunctionModule(size - 1 - i, 8, getBit(bits, i));
			for (var i = 8; i < 15; i++)
				setFunctionModule(8, size - 15 + i, getBit(bits, i));
			setFunctionModule(8, size - 8, true); // Always black
		}

		function drawVersion() {
			if (version < 7)
				return;

			var rem = version;
			for (var i = 0; i < 12; i++)
				rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
			var bits = version << 12 | rem;
			if (bits >>> 18 != 0)
				throw "Assertion error";

			for (var i = 0; i < 18; i++) {
				var bit = getBit(bits, i);
				var a = size - 11 + i % 3;
				var b = Math.floor(i / 3);
				setFunctionModule(a, b, bit);
				setFunctionModule(b, a, bit);
			}
		}

		function drawFinderPattern(x, y) {
			for (var dy = -4; dy <= 4; dy++) {
				for (var dx = -4; dx <= 4; dx++) {
					var dist = Math.max(Math.abs(dx), Math.abs(dy));
					var xx = x + dx,
						yy = y + dy;
					if (0 <= xx && xx < size && 0 <= yy && yy < size)
						setFunctionModule(xx, yy, dist != 2 && dist != 4);
				}
			}
		}

		function drawAlignmentPattern(x, y) {
			for (var dy = -2; dy <= 2; dy++) {
				for (var dx = -2; dx <= 2; dx++)
					setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
			}
		}

		function setFunctionModule(x, y, isBlack) {
			modules[y][x] = isBlack;
			isFunction[y][x] = true;
		}

		function addEccAndInterleave(data) {
			if (data.length != QrCode.getNumDataCodewords(version, errCorLvl))
				throw "Invalid argument";

			var numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[errCorLvl.ordinal][version];
			var blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[errCorLvl.ordinal][version];
			var rawCodewords = Math.floor(QrCode.getNumRawDataModules(version) / 8);
			var numShortBlocks = numBlocks - rawCodewords % numBlocks;
			var shortBlockLen = Math.floor(rawCodewords / numBlocks);
			var blocks = [];
			var rsDiv = QrCode.reedSolomonComputeDivisor(blockEccLen);
			for (var i = 0, k = 0; i < numBlocks; i++) {
				var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
				k += dat.length;
				var ecc = QrCode.reedSolomonComputeRemainder(dat, rsDiv);
				if (i < numShortBlocks)
					dat.push(0);
				blocks.push(dat.concat(ecc));
			}

			var result = [];
			for (var i = 0; i < blocks[0].length; i++) {
				for (var j = 0; j < blocks.length; j++) {
					if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
						result.push(blocks[j][i]);
				}
			}
			if (result.length != rawCodewords)
				throw "Assertion error";
			return result;
		}

		function drawCodewords(data) {
			if (data.length != Math.floor(QrCode.getNumRawDataModules(version) / 8))
				throw "Invalid argument";
			var i = 0;
			for (var right = size - 1; right >= 1; right -= 2) {
				if (right == 6)
					right = 5;
				for (var vert = 0; vert < size; vert++) {
					for (var j = 0; j < 2; j++) {
						var x = right - j;
						var upward = ((right + 1) & 2) == 0;
						var y = upward ? size - 1 - vert : vert;
						if (!isFunction[y][x] && i < data.length * 8) {
							modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
							i++;
						}
					}
				}
			}
			if (i != data.length * 8)
				throw "Assertion error";
		}

		function applyMask(mask) {
			if (mask < 0 || mask > 7)
				throw "Mask value out of range";
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					var invert;
					switch (mask) {
						case 0:
							invert = (x + y) % 2 == 0;
							break;
						case 1:
							invert = y % 2 == 0;
							break;
						case 2:
							invert = x % 3 == 0;
							break;
						case 3:
							invert = (x + y) % 3 == 0;
							break;
						case 4:
							invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
							break;
						case 5:
							invert = x * y % 2 + x * y % 3 == 0;
							break;
						case 6:
							invert = (x * y % 2 + x * y % 3) % 2 == 0;
							break;
						case 7:
							invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
							break;
						default:
							throw "Assertion error";
					}
					if (!isFunction[y][x] && invert)
						modules[y][x] = !modules[y][x];
				}
			}
		}

		function getPenaltyScore() {
			var result = 0;

			for (var y = 0; y < size; y++) {
				var runColor = false;
				var runX = 0;
				var runHistory = [0, 0, 0, 0, 0, 0, 0];
				var padRun = size;
				for (var x = 0; x < size; x++) {
					if (modules[y][x] == runColor) {
						runX++;
						if (runX == 5)
							result += QrCode.PENALTY_N1;
						else if (runX > 5)
							result++;
					} else {
						QrCode.finderPenaltyAddHistory(runX + padRun, runHistory);
						padRun = 0;
						if (!runColor)
							result += finderPenaltyCountPatterns(runHistory) * QrCode.PENALTY_N3;
						runColor = modules[y][x];
						runX = 1;
					}
				}
				result += finderPenaltyTerminateAndCount(runColor, runX + padRun, runHistory) * QrCode.PENALTY_N3;
			}
			for (var x = 0; x < size; x++) {
				var runColor = false;
				var runY = 0;
				var runHistory = [0, 0, 0, 0, 0, 0, 0];
				var padRun = size;
				for (var y = 0; y < size; y++) {
					if (modules[y][x] == runColor) {
						runY++;
						if (runY == 5)
							result += QrCode.PENALTY_N1;
						else if (runY > 5)
							result++;
					} else {
						QrCode.finderPenaltyAddHistory(runY + padRun, runHistory);
						padRun = 0;
						if (!runColor)
							result += finderPenaltyCountPatterns(runHistory) * QrCode.PENALTY_N3;
						runColor = modules[y][x];
						runY = 1;
					}
				}
				result += finderPenaltyTerminateAndCount(runColor, runY + padRun, runHistory) * QrCode.PENALTY_N3;
			}

			for (var y = 0; y < size - 1; y++) {
				for (var x = 0; x < size - 1; x++) {
					var color = modules[y][x];
					if (color == modules[y][x + 1] &&
						color == modules[y + 1][x] &&
						color == modules[y + 1][x + 1])
						result += QrCode.PENALTY_N2;
				}
			}

			var black = 0;
			modules.forEach(function (row) {
				row.forEach(function (color) {
					if (color)
						black++;
				});
			});
			var total = size * size;
			var k = Math.ceil(Math.abs(black * 20 - total * 10) / total) - 1;
			result += k * QrCode.PENALTY_N4;
			return result;
		}

		function getAlignmentPatternPositions() {
			if (version == 1)
				return [];
			else {
				var numAlign = Math.floor(version / 7) + 2;
				var step = (version == 32) ? 26 :
					Math.ceil((size - 13) / (numAlign * 2 - 2)) * 2;
				var result = [6];
				for (var pos = size - 7; result.length < numAlign; pos -= step)
					result.splice(1, 0, pos);
				return result;
			}
		}

		function finderPenaltyCountPatterns(runHistory) {
			var n = runHistory[1];
			if (n > size * 3)
				throw "Assertion error";
			var core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
			return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
				(core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
		}

		function finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
			if (currentRunColor) {
				QrCode.finderPenaltyAddHistory(currentRunLength, runHistory);
				currentRunLength = 0;
			}
			currentRunLength += size;
			QrCode.finderPenaltyAddHistory(currentRunLength, runHistory);
			return finderPenaltyCountPatterns(runHistory);
		}

		function getBit(x, i) {
			return ((x >>> i) & 1) != 0;
		}
	};

	this.QrCode.encodeText = function (text, ecl) {
		var segs = qrcodegen.QrSegment.makeSegments(text);
		return this.encodeSegments(segs, ecl);
	};

	this.QrCode.encodeBinary = function (data, ecl) {
		var seg = qrcodegen.QrSegment.makeBytes(data);
		return this.encodeSegments([seg], ecl);
	};

	this.QrCode.encodeSegments = function (segs, ecl, minVersion, maxVersion, mask, boostEcl) {
		if (minVersion == undefined) minVersion = MIN_VERSION;
		if (maxVersion == undefined) maxVersion = MAX_VERSION;
		if (mask == undefined) mask = -1;
		if (boostEcl == undefined) boostEcl = true;
		if (!(MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= MAX_VERSION) || mask < -1 || mask > 7)
			throw "Invalid value";

		var version, dataUsedBits;
		for (version = minVersion;; version++) {
			var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
			dataUsedBits = qrcodegen.QrSegment.getTotalBits(segs, version);
			if (dataUsedBits <= dataCapacityBits)
				break;
			if (version >= maxVersion)
				throw "Data too long";
		}

		[this.Ecc.MEDIUM, this.Ecc.QUARTILE, this.Ecc.HIGH].forEach(function (newEcl) {
			if (boostEcl && dataUsedBits <= QrCode.getNumDataCodewords(version, newEcl) * 8)
				ecl = newEcl;
		});

		var bb = new BitBuffer();
		segs.forEach(function (seg) {
			bb.appendBits(seg.mode.modeBits, 4);
			bb.appendBits(seg.numChars, seg.mode.numCharCountBits(version));
			seg.getData().forEach(function (bit) {
				bb.push(bit);
			});
		});
		if (bb.length != dataUsedBits)
			throw "Assertion error";

		var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
		if (bb.length > dataCapacityBits)
			throw "Assertion error";
		bb.appendBits(0, Math.min(4, dataCapacityBits - bb.length));
		bb.appendBits(0, (8 - bb.length % 8) % 8);
		if (bb.length % 8 != 0)
			throw "Assertion error";

		for (var padByte = 0xEC; bb.length < dataCapacityBits; padByte ^= 0xEC ^ 0x11)
			bb.appendBits(padByte, 8);

		var dataCodewords = [];
		while (dataCodewords.length * 8 < bb.length)
			dataCodewords.push(0);
		bb.forEach(function (bit, i) {
			dataCodewords[i >>> 3] |= bit << (7 - (i & 7));
		});

		return new this(version, ecl, dataCodewords, mask);
	};

	var QrCode = {};
	QrCode.getNumRawDataModules = function (ver) {
		if (ver < MIN_VERSION || ver > MAX_VERSION)
			throw "Version number out of range";
		var result = (16 * ver + 128) * ver + 64;
		if (ver >= 2) {
			var numAlign = Math.floor(ver / 7) + 2;
			result -= (25 * numAlign - 10) * numAlign - 55;
			if (ver >= 7)
				result -= 36;
		}
		return result;
	};

	QrCode.getNumDataCodewords = function (ver, ecl) {
		return Math.floor(QrCode.getNumRawDataModules(ver) / 8) -
			QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] *
			QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
	};

	QrCode.reedSolomonComputeDivisor = function (degree) {
		if (degree < 1 || degree > 255)
			throw "Degree out of range";
		var result = [];
		for (var i = 0; i < degree - 1; i++)
			result.push(0);
		result.push(1);

		var root = 1;
		for (var i = 0; i < degree; i++) {
			for (var j = 0; j < result.length; j++) {
				result[j] = QrCode.reedSolomonMultiply(result[j], root);
				if (j + 1 < result.length)
					result[j] ^= result[j + 1];
			}
			root = QrCode.reedSolomonMultiply(root, 0x02);
		}
		return result;
	};

	QrCode.reedSolomonComputeRemainder = function (data, divisor) {
		var result = divisor.map(function () {
			return 0;
		});
		data.forEach(function (b) {
			var factor = b ^ result.shift();
			result.push(0);
			divisor.forEach(function (coef, i) {
				result[i] ^= QrCode.reedSolomonMultiply(coef, factor);
			});
		});
		return result;
	};

	QrCode.reedSolomonMultiply = function (x, y) {
		if (x >>> 8 != 0 || y >>> 8 != 0)
			throw "Byte out of range";
		var z = 0;
		for (var i = 7; i >= 0; i--) {
			z = (z << 1) ^ ((z >>> 7) * 0x11D);
			z ^= ((y >>> i) & 1) * x;
		}
		if (z >>> 8 != 0)
			throw "Assertion error";
		return z;
	};

	QrCode.finderPenaltyAddHistory = function (currentRunLength, runHistory) {
		runHistory.pop();
		runHistory.unshift(currentRunLength);
	};

	QrCode.hasFinderLikePattern = function (runHistory) {
		var n = runHistory[1];
		return n > 0 && runHistory[2] == n && runHistory[4] == n && runHistory[5] == n &&
			runHistory[3] == n * 3 && Math.max(runHistory[0], runHistory[6]) >= n * 4;
	};

	var MIN_VERSION = 1;
	var MAX_VERSION = 40;
	Object.defineProperty(this.QrCode, "MIN_VERSION", {
		value: MIN_VERSION
	});
	Object.defineProperty(this.QrCode, "MAX_VERSION", {
		value: MAX_VERSION
	});

	QrCode.PENALTY_N1 = 3;
	QrCode.PENALTY_N2 = 3;
	QrCode.PENALTY_N3 = 40;
	QrCode.PENALTY_N4 = 10;

	QrCode.ECC_CODEWORDS_PER_BLOCK = [
		[null, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Low
		[null, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], // Medium
		[null, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // Quartile
		[null, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // High
	];

	QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
		[null, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25], // Low
		[null, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49], // Medium
		[null, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68], // Quartile
		[null, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81], // High
	];

	this.QrCode.Ecc = {
		LOW: new Ecc(0, 1),
		MEDIUM: new Ecc(1, 0),
		QUARTILE: new Ecc(2, 3),
		HIGH: new Ecc(3, 2),
	};

	function Ecc(ord, fb) {
		Object.defineProperty(this, "ordinal", {
			value: ord
		});

		Object.defineProperty(this, "formatBits", {
			value: fb
		});
	}

	this.QrSegment = function (mode, numChars, bitData) {
		if (numChars < 0 || !(mode instanceof Mode))
			throw "Invalid argument";
		bitData = bitData.slice();

		Object.defineProperty(this, "mode", {
			value: mode
		});

		Object.defineProperty(this, "numChars", {
			value: numChars
		});

		this.getData = function () {
			return bitData.slice();
		};
	};

	this.QrSegment.makeBytes = function (data) {
		var bb = new BitBuffer();
		data.forEach(function (b) {
			bb.appendBits(b, 8);
		});
		return new this(this.Mode.BYTE, data.length, bb);
	};

	this.QrSegment.makeNumeric = function (digits) {
		if (!this.NUMERIC_REGEX.test(digits))
			throw "String contains non-numeric characters";
		var bb = new BitBuffer();
		for (var i = 0; i < digits.length;) {
			var n = Math.min(digits.length - i, 3);
			bb.appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1);
			i += n;
		}
		return new this(this.Mode.NUMERIC, digits.length, bb);
	};

	this.QrSegment.makeAlphanumeric = function (text) {
		if (!this.ALPHANUMERIC_REGEX.test(text))
			throw "String contains unencodable characters in alphanumeric mode";
		var bb = new BitBuffer();
		var i;
		for (i = 0; i + 2 <= text.length; i += 2) {
			var temp = QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
			temp += QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
			bb.appendBits(temp, 11);
		}
		if (i < text.length)
			bb.appendBits(QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6);
		return new this(this.Mode.ALPHANUMERIC, text.length, bb);
	};

	this.QrSegment.makeSegments = function (text) {
		if (text == "")
			return [];
		else if (this.NUMERIC_REGEX.test(text))
			return [this.makeNumeric(text)];
		else if (this.ALPHANUMERIC_REGEX.test(text))
			return [this.makeAlphanumeric(text)];
		else
			return [this.makeBytes(toUtf8ByteArray(text))];
	};

	this.QrSegment.makeEci = function (assignVal) {
		var bb = new BitBuffer();
		if (assignVal < 0)
			throw "ECI assignment value out of range";
		else if (assignVal < (1 << 7))
			bb.appendBits(assignVal, 8);
		else if (assignVal < (1 << 14)) {
			bb.appendBits(2, 2);
			bb.appendBits(assignVal, 14);
		} else if (assignVal < 1000000) {
			bb.appendBits(6, 3);
			bb.appendBits(assignVal, 21);
		} else
			throw "ECI assignment value out of range";
		return new this(this.Mode.ECI, 0, bb);
	};

	this.QrSegment.getTotalBits = function (segs, version) {
		var result = 0;
		for (var i = 0; i < segs.length; i++) {
			var seg = segs[i];
			var ccbits = seg.mode.numCharCountBits(version);
			if (seg.numChars >= (1 << ccbits))
				return Infinity;
			result += 4 + ccbits + seg.getData().length;
		}
		return result;
	};

	var QrSegment = {};
	this.QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
	this.QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
	QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

	this.QrSegment.Mode = {
		NUMERIC: new Mode(0x1, [10, 12, 14]),
		ALPHANUMERIC: new Mode(0x2, [9, 11, 13]),
		BYTE: new Mode(0x4, [8, 16, 16]),
		KANJI: new Mode(0x8, [8, 10, 12]),
		ECI: new Mode(0x7, [0, 0, 0]),
	};

	function Mode(mode, ccbits) {
		Object.defineProperty(this, "modeBits", {
			value: mode
		});

		this.numCharCountBits = function (ver) {
			return ccbits[Math.floor((ver + 7) / 17)];
		};
	}

	function toUtf8ByteArray(str) {
		str = encodeURI(str);
		var result = [];
		for (var i = 0; i < str.length; i++) {
			if (str.charAt(i) != "%")
				result.push(str.charCodeAt(i));
			else {
				result.push(parseInt(str.substring(i + 1, i + 3), 16));
				i += 2;
			}
		}
		return result;
	}

	function BitBuffer() {
		Array.call(this);
		this.appendBits = function (val, len) {
			if (len < 0 || len > 31 || val >>> len != 0)
				throw "Value out of range";
			for (var i = len - 1; i >= 0; i--)
				this.push((val >>> i) & 1);
		};
	}

	BitBuffer.prototype = Object.create(Array.prototype);
	BitBuffer.prototype.constructor = BitBuffer;

};

"use strict";

var app = new function () {
	function initialize() {
		var elems = document.querySelectorAll("input[type=number], textarea");
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].id.indexOf("version-") != 0)
				elems[i].oninput = redrawQrCode;
		}
		elems = document.querySelectorAll("input[type=radio], input[type=checkbox]");
		for (var i = 0; i < elems.length; i++)
			elems[i].onchange = redrawQrCode;
		redrawQrCode();
	}

	function redrawQrCode() {
		var bitmapOutput = document.getElementById("output-format-bitmap").checked;
		var scaleRow = document.getElementById("scale-row");
		var svgXmlRow = document.getElementById("svg-xml-row");
		if (bitmapOutput) {
			scaleRow.style.removeProperty("display");
			svgXmlRow.style.display = "none";
		} else {
			scaleRow.style.display = "none";
			svgXmlRow.style.removeProperty("display");
		}
		var svgXml = document.getElementById("svg-xml-output");
		svgXml.value = "";
		var canvas = document.getElementById("qrcode-canvas");
		var svg = document.getElementById("qrcode-svg");
		canvas.style.display = "none";
		svg.style.display = "none";

		function getInputErrorCorrectionLevel() {
			if (document.getElementById("errcorlvl-medium").checked)
				return qrcodegen.QrCode.Ecc.MEDIUM;
			else if (document.getElementById("errcorlvl-quartile").checked)
				return qrcodegen.QrCode.Ecc.QUARTILE;
			else if (document.getElementById("errcorlvl-high").checked)
				return qrcodegen.QrCode.Ecc.HIGH;
			else
				return qrcodegen.QrCode.Ecc.LOW;
		}

		var ecl = getInputErrorCorrectionLevel();
		var text = document.getElementById("text-input").value;
		var segs = qrcodegen.QrSegment.makeSegments(text);
		var minVer = parseInt(document.getElementById("version-min-input").value, 10);
		var maxVer = parseInt(document.getElementById("version-max-input").value, 10);
		var mask = parseInt(document.getElementById("mask-input").value, 10);
		var boostEcc = document.getElementById("boost-ecc-input").checked;
		var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);

		var border = parseInt(document.getElementById("border-input").value, 10);
		if (border < 0 || border > 100)
			return;
		if (bitmapOutput) {
			var scale = parseInt(document.getElementById("scale-input").value, 10);
			if (scale <= 0 || scale > 30)
				return;
			qr.drawCanvas(scale, border, canvas);
			canvas.style.removeProperty("display");
		} else {
			var code = qr.toSvgString(border);
			svg.setAttribute("viewBox", / viewBox="([^"]*)"/.exec(code)[1]);
			svg.querySelector("path").setAttribute("d", / d="([^"]*)"/.exec(code)[1]);
			svg.style.removeProperty("display");
			svgXml.value = qr.toSvgString(border);
		}

		function describeSegments(segs) {
			if (segs.length == 0)
				return "none";
			else if (segs.length == 1) {
				var mode = segs[0].mode;
				var Mode = qrcodegen.QrSegment.Mode;
				if (mode == Mode.NUMERIC) return "numeric";
				if (mode == Mode.ALPHANUMERIC) return "alphanumeric";
				if (mode == Mode.BYTE) return "byte";
				if (mode == Mode.KANJI) return "kanji";
				return "unknown";
			} else
				return "multiple";
		}

		function countUnicodeChars(str) {
			var result = 0;
			for (var i = 0; i < str.length; i++, result++) {
				var c = str.charCodeAt(i);
				if (c < 0xD800 || c >= 0xE000)
					continue;
				else if (0xD800 <= c && c < 0xDC00 && i + 1 < str.length) {
					i++;
					var d = str.charCodeAt(i);
					if (0xDC00 <= d && d < 0xE000)
						continue;
				}
				throw "Invalid UTF-16 string";
			}
			return result;
		}

		var stats = "QR код нұсқасы = " + qr.version + ", ";
		stats += "маска үлгісі = " + qr.mask + ", ";
		stats += "таңбалар саны = " + countUnicodeChars(text) + "/1000,\n";
		stats += "кодтау режимі = " + describeSegments(segs) + ", ";
		stats += "қатені түзету = " + "ТО/Ж".charAt(qr.errorCorrectionLevel.ordinal) + " деңгейі, ";
		stats += "деректер биттері = " + qrcodegen.QrSegment.getTotalBits(segs, qr.version) + ".";
		document.getElementById("statistics-output").textContent = stats;
	}

	this.handleVersionMinMax = function (which) {
		var minElem = document.getElementById("version-min-input");
		var maxElem = document.getElementById("version-max-input");
		var minVal = parseInt(minElem.value, 10);
		var maxVal = parseInt(maxElem.value, 10);
		minVal = Math.max(Math.min(minVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
		maxVal = Math.max(Math.min(maxVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
		if (which == "min" && minVal > maxVal)
			maxVal = minVal;
		else if (which == "max" && maxVal < minVal)
			minVal = maxVal;
		minElem.value = minVal.toString();
		maxElem.value = maxVal.toString();
		redrawQrCode();
	}
	initialize();
}