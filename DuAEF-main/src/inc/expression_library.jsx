/* License
	DuExpression Library

	Copyright (c) 2020-2022 Nicolas Dufresne and contributors

	This file is part of DuExpression - The Duduf Expression Library.

		DuExpression is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.

		DuExpression is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with DuExpression. If not, see <http://www.gnu.org/licenses/>.
*/

/*
    This script can be included in any other script and can be used to easily include Functions from the Duduf Expression Library into your own expressions.
    It is also available in DuAEF, along with some useful functions to help you include requirements when adding a function to your expressions.
*/

if (typeof DuAEExpression === "undefined") DuAEExpression = {};

/**
 * Expression Library<br />
 * Using DuAEF, you can easily include the methods and classes listed here to your expressions,<br />
 * using {@link DuAEExpression.Library.get} and {@link DuAEExpression.Library.getRequirements}. These methods take the name of the function/class as arguments.
 * @namespace
 * @name Library
 * @memberof DuAEExpression
 * @category DuAEF
 */
if (typeof DuAEExpression.Library === "undefined") DuAEExpression.Library = [];
/**
 * Blends two colors together
 * @function
 * @param {float[]} colorA The first color
 * @param {float[]} colorB The second color
 * @param {float} [opacity] The opacity of the second color, overrides colorB[3].
 * @param {int} [blendlingMode=0] The blending mode, one of:<br/>
 * 0: Normal<br/>
 * 1: Add<br/>
 * 2: Lighter color<br/>
 * 3: Multiply<br/>
 * 4: Darker color<br/>
 * @return {float[]} The new color
 * @requires blendColorValue
 * @category ExpressionLibrary
 */
DuAEExpression.Library["blendColor"] = {};
DuAEExpression.Library["blendColor"].expression = [
  "function blendColor(colorA, colorB, alpha, blendingMode) {",
  "if (typeof alpha === 'undefined') alpha = colorB[3];",
  "if (typeof blendingMode === 'undefined') blendingMode = 0;",
  "if (alpha == 0) return colorA;",
  "if (alpha == 1 && blendingMode == 0) return colorB;",
  "if (blendingMode == 0 || blendingMode == 1 || blendingMode == 3) {",
  "var r = blendColorValue(colorA[0], colorB[0], alpha, blendingMode);",
  "var g = blendColorValue(colorA[1], colorB[1], alpha, blendingMode);",
  "var b = blendColorValue(colorA[2], colorB[2], alpha, blendingMode);",
  "var a = blendColorValue(colorA[3], colorB[3], alpha, 0);",
  "return [r,g,b,a];",
  "}",
  "var lA = colorA[0] + colorA[1] + colorA[2];",
  "var lB = colorB[0] + colorB[1] + colorB[2];",
  "if (blendingMode == 2) {",
  "if (lA >= lB) return colorA;",
  "return blendColor( colorA, colorB, alpha, 0);",
  "}",
  "if (blendingMode == 4) {",
  "if (lA <= lB) return colorA;",
  "return blendColor( colorA, colorB, alpha, 0);",
  "}",
  "}",
].join("\n");
DuAEExpression.Library["blendColor"].requirements = ["blendColorValue"];

/**
 * Blends two colors together
 * @function
 * @param {float} colorA The first color
 * @param {float} colorB The second color
 * @param {float} [opacity=1] The opacity
 * @param {int} [blendlingMode=0] The blending mode, one of:<br/>
 * 0: Normal<br/>
 * 1: Add<br/>
 * 3: Multiply<br/>
 * @return {float} The new value
 * @category ExpressionLibrary
 */
DuAEExpression.Library["blendColorValue"] = {};
DuAEExpression.Library["blendColorValue"].expression = [
  "function blendColorValue(colorA, colorB, alpha, blendingMode) {",
  "if (typeof alpha === 'undefined') alpha = 1;",
  "if (typeof blendingMode === 'undefined') blendingMode = 0;",
  "if (alpha == 0) return colorA;",
  "if (blendingMode == 0) {",
  "if (alpha == 1) return colorB;",
  "return (1-alpha)*colorA + alpha*colorB;",
  "}",
  "if (blendingMode == 1) {",
  "return colorA + colorB*alpha;",
  "}",
  "if (blendingMode == 3) {",
  "return blendColorValue( colorA, colorA * colorB, alpha, 0 );",
  "}",
  "}",
].join("\n");
DuAEExpression.Library["blendColorValue"].requirements = [];

/**
 * Fuzzy Logics for expressions. See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
 * @class
 * @classdesc Fuzzy Logics for expressions. See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
 * @author Nicolas "Duduf" Dufresne
 * @license GPL-v3
 * @copyright 2020-2022 Nicolas Dufresne and contributors
 * @requires gaussian
 * @requires inverseGaussian
 * @requires inverseLogistic
 * @requires logistic
 * @requires mean
 * @category ExpressionLibrary
 */
DuAEExpression.Library["FuzzyLogic"] = {};
DuAEExpression.Library["FuzzyLogic"].expression = [
  "function FuzzySet( name, valueNot, valueIS, shape, shapeAbove, plateauMin, plateauMax)",
  "{",
  "var min;",
  "var max;",
  "if (valueNot > valueIS){",
  "max = valueNot;",
  "min = valueNot - (valueNot - valueIS) * 2;",
  "}",
  "else",
  "{",
  "min = valueNot;",
  "max = valueNot + (valueIS - valueNot) * 2;",
  "}",
  'if (typeof shape === "undefined") shape = "linear";',
  'if (typeof shapeAbove === "undefined") shapeAbove = shape;',
  'if (typeof plateauMin === "undefined") plateauMin = mean([min, max]);',
  'if (typeof plateauMax === "undefined") plateauMax = mean([min, max]);',
  "this.min = min;",
  "this.max = max;",
  "this.shapeIn = shape;",
  "this.shapeOut = shapeAbove;",
  "this.plateauMin = plateauMin;",
  "this.plateauMax = plateauMax;",
  "this.name = name;",
  "}",
  "FuzzySet.prototype = {",
  "contains: function ( v, quantifier )",
  "{",
  "var val;",
  "if (v instanceof FuzzyValue) val = v.crispify(false);",
  "else val = v;",
  "quantifier = getQuantifier(quantifier);",
  "if (val >= this.plateauMin && val <= this.plateauMax)",
  "{",
  "return quantifier(1);",
  "}",
  "else if (val < this.plateauMin)",
  "{",
  'if (this.shapeIn === "constant")',
  "{",
  "return quantifier(1);",
  "}",
  'else if (this.shapeIn === "square")',
  "{",
  "var min = mean(this.plateauMin, this.min);",
  "if (val >= min) return quantifier(1);",
  "else return quantifier(0);",
  "}",
  'else if (this.shapeIn === "linear")',
  "{",
  "if (val < this.min) return quantifier(0);",
  "else return quantifier( (val-this.min) / (this.plateauMin - this.min) );",
  "}",
  'else if (this.shapeIn === "sigmoid")',
  "{",
  "var mid = (this.plateauMin + this.min) / 2;",
  "var rate = 6 / (this.plateauMin - this.min);",
  "return quantifier(logistic(val, mid, 0, 1, rate));",
  "}",
  'else if (this.shapeIn === "gaussian")',
  "{",
  "var width = this.plateauMin - this.min;",
  "return quantifier( gaussian( val, 0, 1, this.plateauMin, width));",
  "}",
  "else return quantifier(0);",
  "}",
  "else",
  "{",
  'if (this.shapeOut === "constant")',
  "{",
  "return quantifier(1);",
  "}",
  'else if (this.shapeOut === "square")',
  "{",
  "var max = mean(this.plateauMax, this.max);",
  "if (val <= max) return quantifier(1);",
  "else return quantifier(0);",
  "}",
  'else if (this.shapeOut === "linear")',
  "{",
  "if (val > this.max) return quantifier(0);",
  "else return quantifier (1 - ((val - this.plateauMax ) / (this.max - this.plateauMax) ));",
  "}",
  'else if (this.shapeOut === "sigmoid")',
  "{",
  "var mid = (this.plateauMax + this.max) / 2;",
  "var rate = 6 / (this.max - this.plateauMax);",
  "return quantifier( 1 - logistic(val, mid, 0, 1, rate));",
  "}",
  'else if (this.shapeOut === "gaussian")',
  "{",
  "var width = this.max - this.plateauMax;",
  "return quantifier( gaussian( val, 0, 1, this.plateauMax, width) );",
  "}",
  "else return quantifier(0);",
  "}",
  "},",
  "getValues: function ( veracity )",
  "{",
  'if (typeof veracity === "undefined") veracity = 0.5;',
  "if (veracity instanceof FuzzyVeracity) veracity = veracity.veracity;",
  "var defaultValue = mean( [this.plateauMin, this.plateauMax] );",
  'if ( this.shapeIn === "constant" && this.shapeOut === "constant" ) return [ this.min, this.plateauMin, defaultValue, this.plateauMax, this.max];',
  "var crisp = [];",
  "if (veracity >= 1) crisp = [this.plateauMin, defaultValue, this.plateauMax];",
  'if (this.shapeIn === "constant" && veracity == 1)',
  "{",
  "crisp.push(this.min);",
  "}",
  'else if (this.shapeIn === "square")',
  "{",
  "if (veracity >= 0.5) crisp.push( this.plateauMin );",
  "else crisp.push( this.min );",
  "}",
  'else if (this.shapeIn === "linear")',
  "{",
  "range = this.plateauMin - this.min;",
  "crisp.push( this.min + range * veracity );",
  "}",
  'else if (this.shapeIn === "sigmoid")',
  "{",
  "mid = (this.plateauMin + this.min) / 2;",
  "crisp.push( inverseLogistic(veracity, mid, 0, 1, 1) );",
  "}",
  'else if (this.shapeIn === "gaussian")',
  "{",
  "var width = this.plateauMin - this.min;",
  "var g = inverseGaussian( veracity, 0, 1, this.plateauMin, width);",
  "crisp.push( g[0] );",
  "}",
  'if (this.shapeOut === "constant" && veracity == 1)',
  "{",
  "crisp.push(this.max);",
  "}",
  'if (this.shapeOut === "square")',
  "{",
  "if (veracity >= 0.5) crisp.push( this.plateauMax );",
  "else crisp.push( this.max );",
  "}",
  'else if (this.shapeOut === "linear")',
  "{",
  "range = this.max - this.plateauMax;",
  "crisp.push( this.max + 1 - (range * veracity) );",
  "}",
  'else if (this.shapeOut === "sigmoid")',
  "{",
  "mid = (this.plateauMax + this.max) / 2;",
  "crisp.push( inverseLogistic( 1-veracity, mid, 0, 1, 1 ) );",
  "}",
  'else if (this.shapeOut === "gaussian")',
  "{",
  "width = this.max - this.plateauMax;",
  "var g = inverseGaussian( 1-veracity, 0, 1, this.plateauMax, width);",
  "crisp.push( g[1] );",
  "}",
  "for(var i = 0, num = crisp.length; i < num; i++)",
  "{",
  "if ( crisp[i] > this.max ) crisp[i] = this.max;",
  "if ( crisp[i] < this.min ) crisp[i] = this.min;",
  "}",
  "return crisp.sort();",
  "},",
  "crispify: function ( quantifier, veracity )",
  "{",
  "quantifier = getQuantifier(quantifier);",
  "var v;",
  'if (typeof veracity === "undefined") v = quantifier();',
  "else if (veracity instanceof FuzzyVeracity) v = veracity.veracity;",
  "else v = veracity;",
  "v = quantifier(v, true).veracity;",
  "return this.getValues( v );",
  "}",
  "};",
  "function FuzzyValue( val )",
  "{",
  'if (typeof unit === "undefined") unit = "";',
  'if (typeof val === "undefined") val = 0;',
  "this.val = val;",
  "this.sets = [];",
  "this.report = [];",
  "this.reportEnabled = false;",
  "this.numRules = 0;",
  "}",
  "FuzzyValue.prototype = {",
  "IS: function(fuzzyset, quantifier)",
  "{",
  "var v = fuzzyset.contains( this, quantifier );",
  "return v;",
  "},",
  "IS_NOT: function (fuzzyset, quantifier)",
  "{",
  "var x = fuzzyset.contains( this.val, quantifier );",
  "return x.NEGATE();",
  "},",
  "SET: function ( fuzzyset,  quantifier, v )",
  "{",
  'if (typeof v === "undefined") v = new FuzzyVeracity(1);',
  "quantifier = getQuantifier(quantifier);",
  "this.numRules++;",
  "v.ruleNum = this.numRules;",
  "for (var i = 0, num = this.sets.length; i < num; i++)",
  "{",
  "var s = this.sets[i].fuzzyset;",
  "if (fuzzyset.name == s.name)",
  "{",
  "this.sets[i].quantifiers.push(quantifier);",
  "this.sets[i].veracities.push(v);",
  "return;",
  "}",
  "}",
  "var s = {};",
  "s.fuzzyset = fuzzyset;",
  "s.quantifiers = [quantifier];",
  "s.veracities = [v];",
  "this.sets.push( s );",
  "},",
  "crispify: function ( clearSets )",
  "{",
  'if (typeof clearSets === "undefined") clearSets = true;',
  "if (this.sets.length == 0) return this.val;",
  "var crisp = 0;",
  "this.report = [];",
  "function ruleSorter(a, b)",
  "{",
  "return a.number - b.number;",
  "}",
  "var sumWeights = 0;",
  "for (var i = 0, num = this.sets.length; i < num; i++)",
  "{",
  "var s = this.sets[i];",
  "for( var j = 0, numV = s.veracities.length; j < numV; j++)",
  "{",
  "var v = s.veracities[j];",
  "var q = s.quantifiers[j];",
  "var vals = s.fuzzyset.crispify( q, v );",
  "var val;",
  "var ver;",
  "val = mean(vals);",
  "crisp += val * v.veracity;",
  "ver = v.veracity;",
  "sumWeights += ver;",
  "if (this.reportEnabled)",
  "{",
  "for (var iVals = 0, numVals = vals.length; iVals < numVals; iVals++)",
  "{",
  "vals[iVals] = Math.round(vals[iVals]*1000)/1000;",
  "}",
  "var reportRule = [];",
  'reportRule.push( "Rule #" + v.ruleNum +": Set " + fuzzyset.toString() + " (" + q.toString() + ")" );',
  'reportRule.push( "Gives val: " + Math.round(val*1000)/1000 + " from these values: [ " + vals.join(", ") + " ]");',
  'reportRule.push( "With a veracity of: " + Math.round(ver*1000)/1000 );',
  "reportRule.number = v.ruleNum;",
  "this.report.push( reportRule );",
  "}",
  "}",
  "}",
  "if (sumWeights != 0) crisp = crisp / sumWeights;",
  "if (this.reportEnabled) this.report.sort(ruleSorter);",
  "if (clearSets)",
  "{",
  "this.val = crisp;",
  "this.sets = [];",
  "}",
  "return crisp;",
  "},",
  "toNumber: this.crispify,",
  "toFloat: this.crispify,",
  "defuzzify: this.crispify",
  "};",
  "function FuzzyVeracity( veracity )",
  "{",
  'if (typeof above === "undefined") above = false;',
  "this.veracity = veracity;",
  "}",
  "FuzzyVeracity.prototype = {",
  "NEGATE: function()",
  "{",
  "return new FuzzyVeracity( 1 - this.veracity );",
  "},",
  "AND: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = Math.min(x, y);",
  "return new FuzzyVeracity( v );",
  "},",
  "OR: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = Math.max(x, y);",
  "return new FuzzyVeracity( v );",
  "},",
  "XOR: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = x+y - 2*Math.min(x,y);",
  "return new FuzzyVeracity( v );",
  "},",
  "IS_NOT: this.XOR,",
  "DIFFERENT: this.XOR,",
  "NXR: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = 1-x-y + 2*Math.min(x,y);",
  "return new FuzzyVeracity( v );",
  "},",
  "IS: this.NXR,",
  "EQUALS: this.NXR,",
  "IMPLIES: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = 1-Math.min(x, 1-y);",
  "return new FuzzyVeracity( v );",
  "},",
  "WITH: this.IMPLIES,",
  "HAS: this.IMPLIES,",
  "DOES_NOT_IMPLY: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = Math.min(x, 1-y);",
  "return new FuzzyVeracity( v );",
  "},",
  "WITHOUT: this.DOES_NOT_IMPLY,",
  "DOES_NOT_HAVE: this.DOES_NOT_IMPLY,",
  "NAND: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = 1 - Math.min(x, y);",
  "return new FuzzyVeracity( v );",
  "},",
  "NOT_BOTH: this.NAND,",
  "NOR: function( other )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = 0;",
  "v = 1 - Math.max(x, y);",
  "return new FuzzyVeracity( v );",
  "},",
  "NONE: this.NOR,",
  "WEIGHTED: function( other, weight )",
  "{",
  "var x = this.veracity;",
  "var y = other.veracity;",
  "var v = (1-w)*x +  w*y;",
  "return new FuzzyVeracity( v );",
  "}",
  "};",
  "function FuzzyLogic( )",
  "{",
  "this.veracity = new FuzzyVeracity(0);",
  "this.sets = [];",
  "}",
  "FuzzyLogic.prototype = {",
  "newValue: function (val, unit)",
  "{",
  "return new FuzzyValue( val, unit );",
  "},",
  "newVeracity: function (veracity)",
  "{",
  "return new FuzzyVeracity(veracity);",
  "},",
  "newSet: function ( name, extremeValue, referenceValue, shape, shapeAbove, plateauMin, plateauMax)",
  "{",
  "return new FuzzySet(name, extremeValue, referenceValue, shape, shapeAbove, plateauMin, plateauMax);",
  "},",
  "IF: function ( veracity )",
  "{",
  "this.veracity = veracity;",
  "return veracity;",
  "},",
  "THEN: function ( val, fuzzyset, quantifier )",
  "{",
  "val.SET(fuzzyset, quantifier, this.veracity);",
  "}",
  "};",
  "function getQuantifier( name )",
  "{",
  'if (typeof name === "undefined") name = "moderately";',
  'if (name == "not" || name == "less") {',
  "function qObj (v, inverse) {",
  'if (typeof v === "undefined") return 0;',
  "var p = inverse ? 0 : 1;",
  "return new FuzzyVeracity( p );",
  "}",
  "return qObj;",
  "}",
  'if (name == "slightly") return createQuantifier( 1/3 );',
  'if (name == "somewhat") return createQuantifier( 0.5 );',
  'if (name == "moderately") return createQuantifier( 1 );',
  'if (name == "very") return createQuantifier( 2 );',
  'if (name == "extremely") return createQuantifier( 3 );',
  "function qObj (v, inverse) {",
  'if (typeof v === "undefined") return 1;',
  "var p = inverse ? 1 : 0;",
  "return new FuzzyVeracity( p );",
  "}",
  "return qObj;",
  "}",
  "function createQuantifier( q )",
  "{",
  "function qObj (v, inverse) {",
  'if (typeof v === "undefined") return Math.pow( 0.5, 1/q);',
  "var p = inverse ? 1/q : q;",
  "return new FuzzyVeracity( Math.pow(v, p) );",
  "}",
  "return qObj;",
  "}",
].join("\n");
DuAEExpression.Library["FuzzyLogic"].requirements = [
  "gaussian",
  "inverseGaussian",
  "inverseLogistic",
  "logistic",
  "mean",
];

/**
 * A (very) simplified version of FuzzyLogics, better for performance with expressions.<br />
 * See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
 * @class
 * @classdesc A (very) simplified version of FuzzyLogics, better for performance with expressions.
 * See {@link https://github.com/Nico-Duduf/DuFuzzyLogic} for more explanations
 * @author Nicolas "Duduf" Dufresne
 * @license GPL-v3
 * @copyright 2020-2022 Nicolas Dufresne and contributors
 * @param {Number} v The original veracity, must be in the range [0.0, 1.0]
 * @param {Number} [f=1] A factor to adjust the <i>importance</i> of the veracity, when compared to others.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["FuzzyVeracity"] = {};
DuAEExpression.Library["FuzzyVeracity"].expression = [
  "function FuzzyVeracity( v, f )",
  "{",
  "if (typeof f === 'undefined') f = 1;",
  "this.veracity = v;",
  "this.factor = f;",
  "}",
  "FuzzyVeracity.prototype = {",
  "NEGATE: function() {",
  "return new FuzzyVeracity(1 - this.veracity, 0.5);",
  "},",
  "AND: function(other) {",
  "var x = this.veracity * this.factor;",
  "var y = other.veracity * other.factor;",
  "var v = x*y;",
  "return new FuzzyVeracity( v );",
  "},",
  "OR: function(other) {",
  "var x = this.veracity * this.factor;",
  "var y = other.veracity * other.factor;",
  "var v = x + y - x*y;",
  "return new FuzzyVeracity( v );",
  "},",
  "DIFFERENT: function(other) {",
  "var x = this.veracity * this.factor;",
  "var y = other.veracity * other.factor;",
  "var v = x+y - 2*x*y;",
  "return new FuzzyVeracity( v );",
  "},",
  "EQUALS: function(other) {",
  "var x = this.veracity * this.factor;",
  "var y = other.veracity * other.factor;",
  "var v = 1-x-y + 2*x*y;",
  "return new FuzzyVeracity( v );",
  "},",
  "};",
].join("\n");
DuAEExpression.Library["FuzzyVeracity"].requirements = [];

/**
 * Animates the property using the given keyframes
 * @function
 * @param {Object[]} keyframes The keyframes. An object with four properties:<br/>
 * <code>value</code> The value of the keyframe<br />
 * <code>time</code> The time of the keyframe<br />
 * <code>interpolation</code> (optional. Default: linear) A function taking 5 arguments to interpolate between this keyframe and the next one<br />
 * <code>params</code> (optional.) A sixth argument passed to the interpolation function. To be used with DuAEF interpolations.<br />
 * Note that the keyframes <strong>must be sorted</strong>. The function does not sort them, as it would have a bad impact on performance.
 * @param {string} [loopOut='none'] One of 'none', 'cycle', 'pingpong'.
 * @param {string} [loopIn='none'] One of 'none', 'cycle', 'pingpong'.
 * @param {float} [time=time] Use this to control how time flows.
 * @example
 * var keyframes = [
 *    {value: 0, time: 1, interpolation: linear},
 *    {value: 180, time: 2, interpolation: gaussianInterpolation, params: -0.5}, //You need to include the gaussianInterpolation function from DuAEF
 *    {value: 250, time: 4, interpolation: ease},
 *    {value: 360, time: 5},
 * ];
 * animate(keyframes, 'cycle', 'pingpong');
 * @return {number} the animated value.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["animate"] = {};
DuAEExpression.Library["animate"].expression = [
  "function animate(ks, loopOut, loopIn, ct) {",
  "if (ks.length == 0) return value;",
  "if (ks.length == 1) return ks[0].value;",
  "if (typeof loopOut === 'undefined') loopOut = 'none';",
  "if (typeof loopIn === 'undefined') loopIn = 'none';",
  "if (typeof ct === 'undefined') ct = time;",
  "var startTime = ks[0].time;",
  "var endTime = ks[ks.length-1].time;",
  "var duration = endTime - startTime;",
  "if ( ct >= endTime )",
  "{",
  "if ( loopOut == 'cycle' ) ct = ((ct - startTime) % duration) + startTime;",
  "else if ( loopOut == 'pingpong' ) {",
  "var d = duration * 2;",
  "ct = (ct-startTime) % d;",
  "if (ct > duration) ct = d - ct;",
  "ct += startTime;",
  "}",
  "}",
  "else if ( ct < startTime) {",
  "if ( loopIn == 'cycle' ) ct = ((ct - startTime) % duration) + startTime + duration;",
  "else if ( loopIn == 'pingpong' ) {",
  "var d = duration * 2;",
  "ct += d;",
  "ct = (ct-startTime) % d;",
  "if (ct > duration) ct = d - ct;",
  "ct += startTime;",
  "}",
  "}",
  "for (var i = 0; i < ks.length; i++) {",
  "var k = ks[i];",
  "if (k.time > ct && i == 0) return k.value;",
  "if (k.time == ct) return k.value;",
  "if (k.time < ct) {",
  "if (i == ks.length - 1) return k.value;",
  "var nk = ks[i+1];",
  "if (nk.time < ct) continue;",
  "if (typeof k.interpolation === 'undefined') return linear(ct, k.time, nk.time, k.value, nk.value);",
  "if (typeof k.params === 'undefined') return k.interpolation(ct, k.time, nk.time, k.value, nk.value);",
  "else return k.interpolation(ct, k.time, nk.time, k.value, nk.value, k.params);",
  "}",
  "}",
  "return value;",
  "}",
].join("\n");
DuAEExpression.Library["animate"].requirements = [];

/**
 * Interpolates a value with a bezier curve.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a custom bézier interpolation.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number[]} [bezierPoints=[0.33,0.0,0.66,1.0]] an Array of 4 coordinates wihtin the [0.0, 1.0] range which describes the Bézier interpolation. The default mimics the native ease() function<br />
 * [ outTangentX, outTangentY, inTangentX, inTangentY ]
 * @return {number} the value.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["bezierInterpolation"] = {};
DuAEExpression.Library["bezierInterpolation"].expression = [
  "function bezierInterpolation(t, tMin, tMax, value1, value2, bezierPoints) {",
  "if (typeof tMin === 'undefined') tMin = 0;",
  "if (typeof tMax === 'undefined') tMax = 1;",
  "if (typeof value1 === 'undefined') value1 = 0;",
  "if (typeof value2 === 'undefined') value2 = 0;",
  "if (typeof bezierPoints === 'undefined') bezierPoints = [0.33,0.0,0.66,1.0];",
  "if (arguments.length !== 5 && arguments.length !== 6) return (value1+value2)/2;",
  "var a = value2 - value1;",
  "var b = tMax - tMin;",
  "if (b == 0) return (value1+value2)/2;",
  "var c = clamp((t - tMin) / b, 0, 1);",
  "if (!(bezierPoints instanceof Array) || bezierPoints.length !== 4) bezierPoints = [0.33,0.0,0.66,1];",
  "return a * h(c, bezierPoints) + value1;",
  "function h(f, g) {",
  "var x = 3 * g[0];",
  "var j = 3 * (g[2] - g[0]) - x;",
  "var k = 1 - x - j;",
  "var l = 3 * g[1];",
  "var m = 3 * (g[3] - g[1]) - l;",
  "var n = 1 - l - m;",
  "var d = f;",
  "for (var i = 0; i < 5; i++) {",
  "var z = d * (x + d * (j + d * k)) - f;",
  "if (Math.abs(z) < 1e-3) break;",
  "d -= z / (x + d * (2 * j + 3 * k * d));",
  "}",
  "return d * (l + d * (m + d * n));",
  "}",
  "}",
].join("\n");
DuAEExpression.Library["bezierInterpolation"].requirements = [];

/**
 * Interpolates a value with an exponential function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @return {number} the value.
 * @requires linearExtrapolation
 * @category ExpressionLibrary
 */
DuAEExpression.Library["expInterpolation"] = {};
DuAEExpression.Library["expInterpolation"].expression = [
  "function expInterpolation(t, tMin, tMax, vMin, vMax, rate)",
  "{",
  "if (typeof tMin === 'undefined') tMin = 0;",
  "if (typeof tMax === 'undefined') tMax = 1;",
  "if (typeof value1 === 'undefined') value1 = 0;",
  "if (typeof value2 === 'undefined') value2 = 0;",
  "if (typeof rate === 'undefined') rate = 1;",
  "if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);",
  "tMax = ( tMax - tMin ) * rate;",
  "t = ( t - tMin ) * rate;",
  "var m = Math.exp(tMax);",
  "t = Math.exp(t);",
  "return linearExtrapolation(t, 1, m, vMin, vMax);",
  "}",
].join("\n");
DuAEExpression.Library["expInterpolation"].requirements = [
  "linearExtrapolation",
];

/**
 * Interpolates a value with a gaussian function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=0] The raising speed in the range [-1.0, 1.0].
 * @return {number} the value.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["gaussianInterpolation"] = {};
DuAEExpression.Library["gaussianInterpolation"].expression = [
  "function gaussianInterpolation( t, tMin, tMax, value1, value2, rate )",
  "{",
  "if (typeof tMin === 'undefined') tMin = 0;",
  "if (typeof tMax === 'undefined') tMax = 1;",
  "if (typeof value1 === 'undefined') value1 = 0;",
  "if (typeof value2 === 'undefined') value2 = 0;",
  "if (typeof rate === 'undefined') rate = 0;",
  "if (value1 == value2) return value1;",
  "if (t >= tMax) return value2;",
  "if (t <= tMin) return value1;",
  "if (t != tMin)",
  "{",
  "var newValue1 = gaussianInterpolation( tMin, tMin, tMax, value1, value2, rate );",
  "var offset = newValue1 - value1;",
  "value1 = value1 - offset;",
  "}",
  "if (rate < 0) rate = rate*10;",
  "rate = linear(t, tMin, tMax, 0.25, rate);",
  "var r = ( 1 - rate );",
  "var fwhm = (tMax-tMin) * r;",
  "var center = tMax;",
  "if (t >= tMax) return value2;",
  "if (fwhm === 0 && t == center) return value2;",
  "else if (fwhm === 0) return value1;",
  "var exp = -4 * Math.LN2;",
  "exp *= Math.pow((t - center),2);",
  "exp *= 1/ Math.pow(fwhm, 2);",
  "var result = Math.pow(Math.E, exp);",
  "result = result * (value2-value1) + value1;",
  "return result;",
  "}",
].join("\n");
DuAEExpression.Library["gaussianInterpolation"].requirements = [];

/**
 * Converts a Gaussian rate (as used with <code>gaussianInterpolation</code>) to the closest possible Bézier controls for use with <code>bezierInterpolation</code>.
 * @function
 * @param {number} rate The raising speed in the range [-1.0, 1.0].
 * @return {number} the value.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["gaussianRateToBezierPoints"] = {};
DuAEExpression.Library["gaussianRateToBezierPoints"].expression = [
  "function gaussianRateToBezierPoints(rate) {",
  "var i = 0;",
  "var o = 1;",
  "if (rate <= -.025) {",
  "i = linear(rate, -0.4, -0.025, 0.17, 0.415);",
  "o = 1-easeIn(rate, -0.4, -0.025, 1, 0.415);",
  "}",
  "else {",
  "i = linear(rate, -0.025, 0.7, 0.415, 1);",
  "o = 1-easeOut(rate, -0.025, 0.7, 0.415, 0.15);",
  "}",
  "return [i,0,o,1];",
  "}",
].join("\n");
DuAEExpression.Library["gaussianRateToBezierPoints"].requirements = [];

/**
 * Integrates the (linear) keyframe values. Useful to animate frequencies!
 * cf. {@link http://www.motionscript.com/articles/speed-control.html} for more explanation.
 * @function
 * @param {Property} [prop=thisProperty] The property with the keyframes.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["integrateLinearKeys"] = {};
DuAEExpression.Library["integrateLinearKeys"].expression = [
  "function integrateLinearKeys( prop ) {",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "var nK = prop.numKeys;",
  "if (nK < 2) return prop.value*(time - inPoint);",
  "if (prop.key(1).time > time ) return prop.value*(time - inPoint);",
  "var result = prop.key(1).value * (prop.key(1).time - inPoint);",
  "for (var i = 2; i <= nK; i++){",
  "if ( prop.key(i).time > time ) break;",
  "var k1 = prop.key(i-1);",
  "var k2 = prop.key(i);",
  "result += (k1.value + k2.value) * (k2.time - k1.time)/2;",
  "}",
  "result += (prop.value + prop.key(i-1).value) * (time - prop.key(i-1).time) / 2;",
  "return result;",
  "}",
].join("\n");
DuAEExpression.Library["integrateLinearKeys"].requirements = [];

/**
 * Fixes interpolation of colors by using HSL or a smart HSL taking the smallest path
 * @function
 * @param {number} [t=time] The value to interpolate and extrapolate
 * @param {int} [mode=2] How to interpolate the colors, one of: 0 for 'RGB', 1 for 'HSL', or 2 for 'shortest-path HSL', 3 for 'longest-path HSL', or 4 for 'combined-RGB SL'
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number[]} [colorA=[0,0,0,0]] The first color
 * @param {number[]} [colorB=[1,1,1,1]] The second color
 * @param {function} [interpolationMethod=ease] The interpolation function, like linear(), easeIn(), easeOut(), etc.<br/>
 * Or any other method taking the same five arguments.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["interpolateColor"] = {};
DuAEExpression.Library["interpolateColor"].expression = [
  "function interpolateColor(t, colorspace, tMin, tMax, colorA, colorB, interpolationMethod) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof colorspace === 'undefined') colorspace = 2;",
  "if (typeof tMin === 'undefined') tMin = 0;",
  "if (typeof tMax === 'undefined') tMax = 1;",
  "if (typeof colorA === 'undefined') colorA = [0, 0, 0, 0];",
  "if (typeof colorB === 'undefined') colorB = [1, 1, 1, 1];",
  "if (typeof interpolationMethod === 'undefined') interpolationMethod = ease;",
  "var result = [0, 0, 0, 0];",
  "if (colorspace > 0 && colorspace < 4) {",
  "var a = rgbToHsl(colorA);",
  "var b = rgbToHsl(colorB);",
  "var dist = Math.abs(a[0] - b[0]);",
  "result = interpolationMethod(t, tMin, tMax, a, b);",
  "if ((dist > 0.5 && colorspace == 2) || (dist < 0.5 && colorspace == 3)) {",
  "var hA = a[0];",
  "var hB = b[0];",
  "var h = hA;",
  "dist = 1 - dist;",
  "if (hA < hB) {",
  "var limit = hA / dist * tMax;",
  "if (t < limit) h = interpolationMethod(t, tMin, limit, hA, 0);",
  "else h = interpolationMethod(t, limit, tMax, 1, hB);",
  "} else {",
  "var limit = (1 - hA) / dist * tMax;",
  "if (t < limit) h = interpolationMethod(t, tMin, limit, hA, 1);",
  "else h = interpolationMethod(t, limit, tMax, 0, hB);",
  "}",
  "result = [h, result[1], result[2], result[3]];",
  "}",
  "result = hslToRgb(result);",
  "}",
  "else {",
  "var rgbResult = interpolationMethod(t, tMin, tMax, colorA, colorB);",
  "if (colorspace == 0) result = rgbResult;",
  "else {",
  "var a = rgbToHsl(colorA);",
  "var b = rgbToHsl(colorB);",
  "var hslResult = interpolationMethod(t, tMin, tMax, a, b);",
  "var h = rgbToHsl(rgbResult)[0];",
  "result = [h, hslResult[1], hslResult[2], hslResult[3]];",
  "result = hslToRgb(result);",
  "}",
  "}",
  "return result;",
  "}",
].join("\n");
DuAEExpression.Library["interpolateColor"].requirements = [];

/**
 * Clamps a value, but with a smooth interpolation according to a softness parameter
 * @function
 * @param {number|number[]} value The value to limit
 * @param {number|number[]|null} [min] The minimum value
 * @param {number|number[]|null} [max] The maximum value
 * @param {number} [softness=0] The softness, a value corresponding value, from which the interpolation begins to slow down
 * @category ExpressionLibrary
 */
DuAEExpression.Library["limit"] = {};
DuAEExpression.Library["limit"].expression = [
  "function limit(val, min, max, softness) {",
  "if (typeof min === 'undefined') min = null;",
  "if (typeof max === 'undefined') max = null;",
  "if (typeof softness === 'undefined') softness = 0;",
  "if (min === null && max === null) return val;",
  "if (typeof val.length !== 'undefined') {",
  "var n = val.length;",
  "if (min !== null) {",
  "if (typeof min.length === 'undefined') {",
  "min = [min];",
  "while(min.length < val.length) min.push(min[0]);",
  "}",
  "n = Math.min(n, min.length);",
  "}",
  "else if (max !== null) {",
  "if (typeof max.length === 'undefined') {",
  "max = [max];",
  "while(max.length < val.length) max.push(max[0]);",
  "}",
  "n = Math.min(n, max.length);",
  "}",
  "for (var i = 0; i < n; i++) {",
  "if (min !== null && max !== null) val[i] = limit(val[i], min[i], max[i], softness);",
  "else if (min !== null) val[i] = limit(val[i], min[i], null, softness);",
  "else if (max !== null) val[i] = limit(val[i], null, max[i], softness);",
  "}",
  "return val;",
  "}",
  "if (max !== null) {",
  "if (typeof max.length !== 'undefined') max = max[0];",
  "max = max - softness;",
  "if ( val > max ) {",
  "if (softness == 0) return max;",
  "return max + softness - softness / ( 1 + (val - max)/softness);",
  "}",
  "}",
  "if (min !== null) {",
  "if (typeof min.length !== 'undefined') min = min[0];",
  "min = min + softness;",
  "if (val < min && min != null) {",
  "if (softness == 0) return min;",
  "return min - softness + softness / (1 + (min - val)/softness);",
  "}",
  "}",
  "return val;",
  "}",
].join("\n");
DuAEExpression.Library["limit"].requirements = [];

/**
 * Interpolates a value with a linear function, but also extrapolates it outside of known values.<br />
 * This method can replace <code>linear()</code>, adding extrapolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate and extrapolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @return {number} the value.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["linearExtrapolation"] = {};
DuAEExpression.Library["linearExtrapolation"].expression = [
  "function linearExtrapolation( t, tMin, tMax, value1, value2 )",
  "{",
  "if (tMax == tMin) return (value1+value2) / 2;",
  "return value1 + (( t - tMin) / (tMax - tMin)) * (value2 - value1);",
  "}",
].join("\n");
DuAEExpression.Library["linearExtrapolation"].requirements = [];

/**
 * Interpolates a value with a logarithmic function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @return {number} the value.
 * @requires linearExtrapolation
 * @category ExpressionLibrary
 */
DuAEExpression.Library["logInterpolation"] = {};
DuAEExpression.Library["logInterpolation"].expression = [
  "function logInterpolation(t, tMin, tMax, vMin, vMax, rate)",
  "{",
  "if (typeof tMin === 'undefined') tMin = 0;",
  "if (typeof tMax === 'undefined') tMax = 1;",
  "if (typeof value1 === 'undefined') value1 = 0;",
  "if (typeof value2 === 'undefined') value2 = 0;",
  "if (typeof rate === 'undefined') rate = 1;",
  "if (rate == 0) return linearExtrapolation(t, tMin, tMax, vMin, vMax);",
  "tMax = ( tMax - tMin ) * rate + 1;",
  "t = ( t - tMin ) * rate + 1;",
  "if (t <= 1) return vMin;",
  "var m = Math.log(tMax);",
  "var v = Math.log(t);",
  "return linearExtrapolation(v, 0, m, vMin, vMax);",
  "}",
].join("\n");
DuAEExpression.Library["logInterpolation"].requirements = [
  "linearExtrapolation",
];

/**
 * Interpolates a value with a logistic (sigmoid) function.<br />
 * This method can replace <code>linear()</code> and <code>ease()</code> with a gaussian interpolation.
 * @function
 * @param {number} t The value to interpolate
 * @param {number} [tMin=0] The minimum value of the initial range
 * @param {number} [tMax=1] The maximum value of the initial range
 * @param {number} [value1=0] The minimum value of the interpolated result
 * @param {number} [value2=1] The maximum value of the interpolated result
 * @param {number} [rate=1] The raising speed in the range [0, inf].
 * @param {number} [tMid] The t value at which the interpolated value should be half way. By default, (tMin+tMax)/2
 * @return {number} the value.s
 * @requires logistic
 * @requires linearExtrapolation
 * @category ExpressionLibrary
 */
DuAEExpression.Library["logisticInterpolation"] = {};
DuAEExpression.Library["logisticInterpolation"].expression = [
  "function logisticInterpolation( t, tMin, tMax, value1, value2, rate, tMid )",
  "{",
  "if (typeof tMin === 'undefined') tMin = 0;",
  "if (typeof tMax === 'undefined') tMax = 1;",
  "if (typeof value1 === 'undefined') value1 = 0;",
  "if (typeof value2 === 'undefined') value2 = 0;",
  "if (typeof rate === 'undefined') rate = 1;",
  "if (typeof tMid === 'undefined') tMid = (tMin+tMax)/2;",
  "if (rate == 0) return linearExtrapolation(t, tMin, tMax, value1, value2);",
  "t = logistic( t, tMid, tMin, tMax, rate);",
  "var m = logistic( tMin, tMid, tMin, tMax, rate);",
  "var M = logistic( tMax, tMid, tMin, tMax, rate);",
  "return linearExtrapolation( t, m, M, value1, value2);",
  "}",
].join("\n");
DuAEExpression.Library["logisticInterpolation"].requirements = [
  "logistic",
  "linearExtrapolation",
];

/**
 * Gets the key immediately before the given time
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getNextKey"] = {};
DuAEExpression.Library["getNextKey"].expression = [
  "function getNextKey(t, prop) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "if (prop.numKeys == 0) return null;",
  "var nKey = prop.nearestKey(t);",
  "if (nKey.time >= t) return nKey;",
  "if (nKey.index < prop.numKeys) return prop.key(nKey.index + 1);",
  "return null;",
  "}",
].join("\n");
DuAEExpression.Library["getNextKey"].requirements = [];

/**
 * Gets the next key where there is no motion after it
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @requires isStill
 * @requires getNextKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getNextStopKey"] = {};
DuAEExpression.Library["getNextStopKey"].expression = [
  "function getNextStopKey(t, prop) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "var k = getNextKey(t, prop);",
  "if (!k) return null;",
  "var i = k.index;",
  "while (i < prop.numKeys) {",
  "if (isStill( k.time + thisComp.frameDuration )) return k;",
  "k = key(k.index + 1);",
  "}",
  "return k;",
  "}",
].join("\n");
DuAEExpression.Library["getNextStopKey"].requirements = [
  "isStill",
  "getNextKey",
];

/**
 * Gets the key immediately before the given time
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPrevKey"] = {};
DuAEExpression.Library["getPrevKey"].expression = [
  "function getPrevKey(t, prop) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "if (prop.numKeys == 0) return null;",
  "var nKey = prop.nearestKey(t);",
  "if (nKey.time <= t) return nKey;",
  "if (nKey.index > 1) return prop.key(nKey.index - 1);",
  "return null;",
  "}",
].join("\n");
DuAEExpression.Library["getPrevKey"].requirements = [];

/**
 * Gets the previous key where there is no motion before it
 * @function
 * @param {number} [t=time] Time at which to get the key
 * @param {Property} [prop=thisProperty] The property from which to get the key
 * @return {Key|null} The key, or null if there's no key before.
 * @requires isStill
 * @requires getPrevKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPrevStartKey"] = {};
DuAEExpression.Library["getPrevStartKey"].expression = [
  "function getPrevStartKey(t, prop) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "var k = getPrevKey(t, prop);",
  "if (!k) return null;",
  "var i = k.index;",
  "while (i > 0) {",
  "if (isStill( k.time - thisComp.frameDuration )) return k;",
  "k = key(k.index - 1);",
  "}",
  "return k;",
  "}",
].join("\n");
DuAEExpression.Library["getPrevStartKey"].requirements = [
  "isStill",
  "getPrevKey",
];

/**
 * Checks if current time is after the time of the last key in the property
 * @function
 * @return {boolean} true if time is > lastkey.time
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isAfterLastKey"] = {};
DuAEExpression.Library["isAfterLastKey"].expression = [
  "function isAfterLastKey() {",
  "if (numKeys == 0) return false;",
  "var nKey = nearestKey(time);",
  "return nKey.time <= time && nKey.index == numKeys;",
  "}",
].join("\n");
DuAEExpression.Library["isAfterLastKey"].requirements = [];

/**
 * Checks if the key is a maximum or minimum
 * @function
 * @param {Keyframe} k The key to check
 * @param {int} axis The axis to check for multi-dimensionnal properties
 * @return {boolean} true if the key is a maximum or minimum
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isKeyTop"] = {};
DuAEExpression.Library["isKeyTop"].expression = [
  "function isKeyTop(k, axis) {",
  "var prevSpeed = velocityAtTime(k.time - thisComp.frameDuration/2);",
  "var nextSpeed = velocityAtTime(k.time + thisComp.frameDuration/2);",
  "if (value instanceof Array) {",
  "prevSpeed = prevSpeed[axis];",
  "nextSpeed = nextSpeed[axis];",
  "}",
  "if (Math.abs(prevSpeed) < 0.01 || Math.abs(nextSpeed) < 0.01) return true;",
  "return prevSpeed * nextSpeed < 0;",
  "}",
].join("\n");
DuAEExpression.Library["isKeyTop"].requirements = [];

/**
 * Bounce, to be used when the speed is 0.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} elasticity The elasticity, which controls the amplitude and frequence according to the last known velocity
 * @param {float} damping Damping
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 * @requires bezierInterpolation
 * @category ExpressionLibrary
 */
DuAEExpression.Library["bounce"] = {};
DuAEExpression.Library["bounce"].expression = [
  "function bounce(t, elasticity, damping, vAtTime) {",
  "if (elasticity == 0) return value;",
  "if (numKeys < 2) return value;",
  "if (nearestKey(t).index == 1) return value;",
  "var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;",
  "var pSpeed = length( pVelocity );",
  "if (pSpeed >= 0.001 ) return value;",
  "var bounceStart = 0;",
  "var bounceTime = 0;",
  "var bouceKey = getPrevKey(t, thisProperty);",
  "bounceStart = bouceKey.time;",
  "bounceTime = t - bounceStart;",
  "pVelocity = ( vAtTime( bounceStart ) - vAtTime( bounceStart - thisComp.frameDuration * .5 ) );",
  "var bounceValue = ( pVelocity / thisComp.frameDuration ) ;",
  "var cycleDamp = Math.exp(bounceTime * damping * .1);",
  "var damp = Math.exp(bounceTime * damping) / (elasticity / 2);",
  "var cycleDuration = 1 / (elasticity * 2);",
  "cycleDuration = Math.round(timeToFrames(cycleDuration));",
  "cycleDuration = framesToTime(cycleDuration);",
  "var midDuration = cycleDuration / 2;",
  "var maxValue = bounceValue * midDuration;",
  "var cycvarime = bounceTime;",
  "var numEndCycles = 1;",
  "while (cycvarime > cycleDuration) {",
  "cycvarime = cycvarime - cycleDuration;",
  "cycleDuration = cycleDuration / cycleDamp;",
  "cycleDuration = Math.round(timeToFrames(cycleDuration));",
  "if (cycleDuration < 2) {",
  "cycleDuration = 2;",
  "numEndCycles++;",
  "}",
  "cycleDuration = framesToTime(cycleDuration);",
  "midDuration = cycleDuration / 2;",
  "maxValue = bounceValue * midDuration / damp;",
  "if (numEndCycles > 100 / damping && maxValue < 0.001 ) return value;",
  "}",
  "if (cycvarime < midDuration) bounceValue = bezierInterpolation(cycvarime, 0, midDuration, 0, maxValue, [0, .1, .33, 1]);",
  "else bounceValue = bezierInterpolation(cycvarime, midDuration, cycleDuration, maxValue, 0, [.66, 0, 1, .9]);",
  "var prevValue = valueAtTime(bounceStart - thisComp.frameDuration);",
  "var startValue = valueAtTime(bounceStart);",
  "if (value instanceof Array) {",
  "for (var i = 0; i < prevValue.length; i++) {",
  "if (prevValue[i] > startValue[i]) bounceValue[i] = Math.abs(bounceValue[i]);",
  "if (prevValue[i] < startValue[i]) bounceValue[i] = -Math.abs(bounceValue[i]);",
  "}",
  "} else {",
  "if (prevValue > startValue) bounceValue = Math.abs(bounceValue);",
  "if (prevValue < startValue) bounceValue = -Math.abs(bounceValue);",
  "}",
  "return bounceValue + value;",
  "}",
].join("\n");
DuAEExpression.Library["bounce"].requirements = [
  "getPrevKey",
  "bezierInterpolation",
];

/**
 * Animatable equivalent to loopIn('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["continueIn"] = {};
DuAEExpression.Library["continueIn"].expression = [
  "function continueIn(t, damping) {",
  "if (numKeys <= 1) return value;",
  "var firstKey = getNextKey(t, thisProperty);",
  "if (!firstKey) return value;",
  "var firstVelocity = velocityAtTime(firstKey.time + 0.001);",
  "var timeSpent = firstKey.time - t;",
  "var damp = Math.exp(timeSpent * damping);",
  "return (-timeSpent * firstVelocity) / damp + firstKey.value;",
  "}",
].join("\n");
DuAEExpression.Library["continueIn"].requirements = ["getNextKey"];

/**
 * Animatable equivalent to loopOut('continue').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["continueOut"] = {};
DuAEExpression.Library["continueOut"].expression = [
  "function continueOut(t, damping) {",
  "if (numKeys <= 1) return value;",
  "var lastKey = getPrevKey(t, thisProperty);",
  "if (!lastKey) return value;",
  "var lastVelocity = velocityAtTime(lastKey.time - 0.001);",
  "var timeSpent = t - lastKey.time;",
  "var damp = Math.exp(timeSpent * damping);",
  "return lastKey.value + (timeSpent * lastVelocity) / damp;",
  "}",
].join("\n");
DuAEExpression.Library["continueOut"].requirements = ["getNextKey"];

/**
 * Animatable equivalent to loopIn('cycle') and loopIn('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["cycleIn"] = {};
DuAEExpression.Library["cycleIn"].expression = [
  "function cycleIn(t, nK, o, vAtTime, damping) {",
  "var currentValue = vAtTime(t);",
  "if (numKeys <= 1) return currentValue;",
  "var lastKeyIndex = numKeys;",
  "var firstKey = getNextKey(t, thisProperty);",
  "if (!firstKey) return currentValue;",
  "if (firstKey.index == lastKeyIndex) return currentValue;",
  "if (nK >= 2) {",
  "nK = nK - 1;",
  "lastKeyIndex = firstKey.index + nK;",
  "if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;",
  "}",
  "var loopStartTime = firstKey.time;",
  "var loopEndTime = key(lastKeyIndex).time;",
  "var loopDuration = loopEndTime - loopStartTime;",
  "if (t >= loopStartTime) return currentValue;",
  "var timeSpent = loopStartTime - t;",
  "var numLoops = Math.floor(timeSpent / loopDuration);",
  "var loopTime = loopDuration - timeSpent;",
  "if (numLoops > 0) loopTime = loopDuration - (timeSpent - numLoops * loopDuration);",
  "var r = vAtTime(loopStartTime + loopTime);",
  "if (o) r -= (key(lastKeyIndex).value - firstKey.value) * (numLoops + 1);",
  "var damp = Math.exp(timeSpent * damping);",
  "return (r-currentValue) / damp + currentValue;",
  "}",
].join("\n");
DuAEExpression.Library["cycleIn"].requirements = ["getNextKey"];

/**
 * Animatable equivalent to loopOut('cycle') and loopOut('offset').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {Boolean} o Wether to offset or cycle
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["cycleOut"] = {};
DuAEExpression.Library["cycleOut"].expression = [
  "function cycleOut(t, nK, o, vAtTime, damping) {",
  "var currentValue = vAtTime(t);",
  "if (numKeys <= 1) return currentValue;",
  "var firstKeyIndex = 1;",
  "var lastKey = getPrevKey(t, thisProperty);",
  "if (!lastKey) return currentValue;",
  "if (lastKey.index == firstKeyIndex) return currentValue;",
  "if (nK >= 2) {",
  "nK = nK - 1;",
  "firstKeyIndex = lastKey.index - nK;",
  "if (firstKeyIndex < 1) firstKeyIndex = 1;",
  "}",
  "var loopStartTime = key(firstKeyIndex).time;",
  "var loopEndTime = key(lastKey.index).time;",
  "var loopDuration = loopEndTime - loopStartTime;",
  "if (t <= loopEndTime) return currentValue;",
  "var timeSpent = t - loopEndTime;",
  "var numLoops = Math.floor(timeSpent / loopDuration);",
  "var loopTime = timeSpent;",
  "if (numLoops > 0) loopTime = timeSpent - numLoops * loopDuration;",
  "var r = vAtTime(loopStartTime + loopTime);",
  "if (o) r += (key(lastKey.index).value - key(firstKeyIndex).value) * (numLoops + 1);",
  "var damp = Math.exp(timeSpent * damping);",
  "return (r-currentValue) / damp + currentValue;",
  "}",
].join("\n");
DuAEExpression.Library["cycleOut"].requirements = ["getPrevKey"];

/**
 * Overshoot animation, to be used when the speed is 0.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {float} elasticity The elasticity, which controls the amplitude and frequence according to the last known velocity
 * @param {float} damping Damping
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @returns {float|float[]} The new value
 * @function
 * @requires getPrevKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["overshoot"] = {};
DuAEExpression.Library["overshoot"].expression = [
  "function overShoot(t, elasticity, damping, vAtTime) {",
  "if (elasticity == 0) return value;",
  "if (numKeys < 2) return value;",
  "if (nearestKey(t).index == 1) return value;",
  "var pVelocity = ( vAtTime(t) - vAtTime( t - .01 ) ) * 100;",
  "var pSpeed = length( pVelocity );",
  "if (pSpeed >= 0.001 ) return value;",
  "var oShootStart = 0;",
  "var oShootTime = 0;",
  "var oShootKey = getPrevKey(t, thisProperty);",
  "oShootStart = oShootKey.time;",
  "oShootTime = t - oShootStart;",
  "pVelocity = ( vAtTime( oShootStart ) - vAtTime( oShootStart - thisComp.frameDuration * .5 ) );",
  "var damp = Math.exp(oShootTime * damping);",
  "var sinus = elasticity * oShootTime * 2 * Math.PI;",
  "sinus = Math.sin(sinus);",
  "sinus = (.3 / elasticity) * sinus;",
  "sinus = sinus / damp;",
  "if (Math.abs(sinus) < .00001) return value;",
  "var oShoot = ( pVelocity / thisComp.frameDuration ) * sinus;",
  "return oShoot+value;",
  "}",
].join("\n");
DuAEExpression.Library["overshoot"].requirements = ["getPrevKey"];

/**
 * Animatable equivalent to loopIn('pingpong').
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all previous frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float} The new value
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["pingPongIn"] = {};
DuAEExpression.Library["pingPongIn"].expression = [
  "function pingPongIn(t, nK, vAtTime, damping) {",
  "var currentValue = vAtTime(t);",
  "if (numKeys <= 1) return currentValue;",
  "var lastKeyIndex = numKeys;",
  "var firstKey = getNextKey(t, thisProperty);",
  "if (!firstKey) return currentValue;",
  "if (firstKey.index == lastKeyIndex) return currentValue;",
  "if (nK >= 2) {",
  "nK = nK - 1;",
  "lastKeyIndex = firstKey.index + nK;",
  "if (lastKeyIndex > numKeys) lastKeyIndex = numKeys;",
  "}",
  "var loopStartTime = firstKey.time;",
  "var loopEndTime = key(lastKeyIndex).time;",
  "var loopDuration = loopEndTime - loopStartTime;",
  "if (t >= loopStartTime) return currentValue;",
  "var timeSpent = loopStartTime - t;",
  "var numLoops = Math.floor(timeSpent / loopDuration);",
  "var loopTime = timeSpent;",
  "if (numLoops > 0) {",
  "loopTime = timeSpent - numLoops * loopDuration;",
  "if (numLoops % 2 != 0) loopTime = loopDuration - loopTime;",
  "}",
  "var damp = Math.exp(timeSpent * damping);",
  "return ( vAtTime(loopStartTime + loopTime) - currentValue) / damp + currentValue;",
  "}",
].join("\n");
DuAEExpression.Library["pingPongIn"].requirements = ["getNextKey"];

/**
 * Animatable equivalent to loopOut('pingpong').
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @param {float} t The time at which the value must be got. To end the loop, pass the same time for all subsequent frames.
 * @param {int} nK The number of keyframes to loop. Use 0 to loop all keyframes
 * @param {function} [vAtTime=valueAtTime] A function to replace valueAtTime. Use this to loop after an expression+keyframe controlled animation, by providing a function used to generate the animation.
 * @param {float} [damping=0] Exponentially attenuates the effect over time
 * @returns {float} The new value
 * @function
 * @requires getPrevKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["pingPongOut"] = {};
DuAEExpression.Library["pingPongOut"].expression = [
  "function pingPongOut(t, nK, vAtTime, damping) {",
  "var currentValue = vAtTime(t);",
  "if (numKeys <= 1) return currentValue;",
  "var firstKeyIndex = 1;",
  "var lastKey = getPrevKey(t, thisProperty);",
  "if (!lastKey) return currentValue;",
  "if (lastKey.index == firstKeyIndex) return currentValue;",
  "if (nK >= 2) {",
  "nK = nK - 1;",
  "firstKeyIndex = lastKey.index - nK;",
  "if (firstKeyIndex < 1) firstKeyIndex = 1;",
  "}",
  "var loopStartTime = key(firstKeyIndex).time;",
  "var loopEndTime = key(lastKey.index).time;",
  "var loopDuration = loopEndTime - loopStartTime;",
  "if (t <= loopEndTime) return currentValue;",
  "var timeSpent = t - loopEndTime;",
  "var numLoops = Math.floor(timeSpent / loopDuration);",
  "var loopTime = loopDuration - timeSpent;",
  "if (numLoops > 0) {",
  "loopTime = timeSpent - numLoops * loopDuration;",
  "if (numLoops % 2 == 0) loopTime = loopDuration - loopTime;",
  "}",
  "var damp = Math.exp(timeSpent * damping);",
  "return ( vAtTime(loopStartTime + loopTime) - currentValue) / damp + currentValue;",
  "}",
].join("\n");
DuAEExpression.Library["pingPongOut"].requirements = ["getPrevKey"];

/**
 * Adds two lists of points/vectors.
 * @function
 * @param {float[][]} p1 The list of points
 * @param {float[][]} p2 The other list of points
 * @param {float} w A weight to multiply the values of p2
 * @returns {float[][]} The added points
 * @category ExpressionLibrary
 */
DuAEExpression.Library["addPoints"] = {};
DuAEExpression.Library["addPoints"].expression = [
  "function addPoints(p1, p2, w) {",
  "var n = p1.length;",
  "if (p2.length > n) n = p2.length;",
  "var r = [];",
  "for (var i = 0; i < n; i++) {",
  "if (i >= p1.length) {",
  "r.push(p2[i] * w);",
  "continue;",
  "}",
  "if (i >= p2.length) {",
  "r.push(p1[i]);",
  "continue;",
  "}",
  "r.push(p1[i] + p2[i] * w);",
  "}",
  "return r;",
  "}",
].join("\n");
DuAEExpression.Library["addPoints"].requirements = [];

/**
 * A fast pseudo random number generator
 * usage: `var rng = alea(seed); rng(5, 10);` Generates a number between  5 and 10.
 * @function
 * @param {*} seed
 * @category ExpressionLibrary
 */
DuAEExpression.Library["alea"] = {};
DuAEExpression.Library["alea"].expression = [
  "function alea(seed) {",
  "function Mash() {",
  "var n = 0xefc8249d;",
  "var mash = function (data) {",
  "data = String(data);",
  "for (var i = 0; i < data.length; i++) {",
  "n += data.charCodeAt(i);",
  "var h = 0.02519603282416938 * n;",
  "n = h >>> 0;",
  "h -= n;",
  "h *= n;",
  "n = h >>> 0;",
  "h -= n;",
  "n += h * 0x100000000;",
  "}",
  "return (n >>> 0) * 2.3283064365386963e-10;",
  "};",
  "return mash;",
  "}",
  "function Alea(seed) {",
  "var me = this, mash = Mash();",
  "me.next = function (minVal, maxVal) {",
  "if (typeof minVal === 'undefined') minVal = 0;",
  "if (typeof maxVal === 'undefined') maxVal = 1;",
  "var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10;",
  "me.s0 = me.s1;",
  "me.s1 = me.s2;",
  "var r = me.s2 = t - (me.c = t | 0);",
  "return r * (maxVal - minVal) + minVal;",
  "};",
  "me.c = 1;",
  "me.s0 = mash(' ');",
  "me.s1 = mash(' ');",
  "me.s2 = mash(' ');",
  "me.s0 -= mash(seed);",
  "if (me.s0 < 0) { me.s0 += 1; }",
  "me.s1 -= mash(seed);",
  "if (me.s1 < 0) { me.s1 += 1; }",
  "me.s2 -= mash(seed);",
  "if (me.s2 < 0) { me.s2 += 1; }",
  "mash = null;",
  "}",
  "var xg = new Alea(seed);",
  "return xg.next;",
  "}",
].join("\n");
DuAEExpression.Library["alea"].requirements = [];

/**
 * Fix for the ExtendScript engine, implements the Math.cbrt (cubic root) function.
 * @function
 * @name Math.cbrt
 * @param {Number} x The value
 * @return {Number} The cubic root
 * @category ExpressionLibrary
 */
DuAEExpression.Library["cbrt"] = {};
DuAEExpression.Library["cbrt"].expression = [
  "if (typeof Math.cbrt === 'undefined') {",
  "Math.cbrt = (function(pow) {",
  "return function cbrt(x){",
  "return x < 0 ? -pow(-x, 1/3) : pow(x, 1/3);",
  "};",
  "})(Math.pow);",
  "}",
].join("\n");
DuAEExpression.Library["cbrt"].requirements = [];

/**
 * Gets the distance of a point to a line
 * @function
 * @param {float[]} point The point [x,y]
 * @param {float[][]} line The line [ A , B ] where A and B are two points
 * @return {float} The distance
 * @category ExpressionLibrary
 */
DuAEExpression.Library["distanceToLine"] = {};
DuAEExpression.Library["distanceToLine"].expression = [
  "function distanceToLine( point, line ) {",
  "var b = line[0];",
  "var c = line [1];",
  "var a = point;",
  "var line = Math.pow( length( b, c ), 2 );",
  "if ( line === 0 ) return Math.pow( length( a, b ), 2 );",
  "var d = ( ( a[ 0 ] - b[ 0 ] ) * ( c[ 0 ] - b[ 0 ] ) + ( a[ 1 ] - b[ 1 ] ) * ( c[ 1 ] - b[ 1 ] ) ) / line;",
  "d = Math.max( 0, Math.min( 1, d ) );",
  "var distance = Math.pow( length( a, [ b[ 0 ] + d * ( c[ 0 ] - b[ 0 ] ), b[ 1 ] + d * ( c[ 1 ] - b[ 1 ] ) ] ), 2 );",
  "return Math.sqrt( distance );",
  "};",
].join("\n");
DuAEExpression.Library["distanceToLine"].requirements = [];

/**
 * The gaussian function
 * @function
 * @param {Number} value The variable
 * @param {Number} [min=0] The minimum return value
 * @param {Number} [max=1] The maximum return value
 * @param {Number} [center=0] The center of the peak
 * @param {Number} [fwhm=1] The full width at half maximum of the curve
 * @return {Number} The result
 * @category ExpressionLibrary
 */
DuAEExpression.Library["gaussian"] = {};
DuAEExpression.Library["gaussian"].expression = [
  "function gaussian( value, min, max, center, fwhm)",
  "{",
  "if (typeof min === 'undefined') min = 0;",
  "if (typeof max === 'undefined') max = 1;",
  "if (typeof center === 'undefined') center = 0;",
  "if (typeof fwhm === 'undefined') fwhm = 1;",
  "if (fwhm === 0 && value == center) return max;",
  "else if (fwhm === 0) return 0;",
  "var exp = -4 * Math.LN2;",
  "exp *= Math.pow((value - center),2);",
  "exp *= 1/ Math.pow(fwhm, 2);",
  "var result = Math.pow(Math.E, exp);",
  "return result * (max-min) + min;",
  "}",
].join("\n");
DuAEExpression.Library["gaussian"].requirements = [];

/**
 * The inverse gaussian function
 * @function
 * @param {Number} v The variable
 * @param {Number} [min=0] The minimum return value of the corresponding gaussian function
 * @param {Number} [max=1] The maximum return value of the corresponding gaussian function
 * @param {Number} [center=0] The center of the peak of the corresponding gaussian function
 * @param {Number} [fwhm=1] The full width at half maximum of the curve of the corresponding gaussian function
 * @return {Number[]} The two possible results, the lower is the first in the list. If both are the same, it is the maximum
 * @category ExpressionLibrary
 */
DuAEExpression.Library["inverseGaussian"] = {};
DuAEExpression.Library["inverseGaussian"].expression = [
  "function inverseGaussian ( v, min, max, center, fwhm)",
  "{",
  "if (typeof min === 'undefined') min = 0;",
  "if (typeof max === 'undefined') max = 1;",
  "if (typeof center === 'undefined') center = 0;",
  "if (typeof fwhm === 'undefined') fwhm = 1;",
  "if (v == 1) return [center, center];",
  "if (v === 0) return [center + fwhm/2, center - fwhm/2];",
  "if (fwhm === 0) return [center, center];",
  "var result = (v-min)/(max-min);",
  "result = Math.log( result ) * Math.pow(fwhm,2);",
  "result = result / ( -4 * Math.LN2 );",
  "result = Math.sqrt( result );",
  "return [ result + center, -result + center ];",
  "}",
].join("\n");
DuAEExpression.Library["inverseGaussian"].requirements = [];

/**
 * The inverse logistic function (inverse sigmoid)
 * @function
 * @param {Number} v The variable
 * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2 in the original logistic function
 * @param {Number} [min=0] The minimum return value of the original logistic function
 * @param {Number} [max=1] The maximum return value of the original logistic function
 * @param {Number} [rate=1] The logistic growth rate or steepness of the original logistic function
 * @return {Number} The result
 * @category ExpressionLibrary
 */
DuAEExpression.Library["inverseLogistic"] = {};
DuAEExpression.Library["inverseLogistic"].expression = [
  "function inverseLogistic ( v, midValue, min, max, rate)",
  "{",
  "if (typeof midValue === 'undefined') midValue = 0;",
  "if (typeof min === 'undefined') min = 0;",
  "if (typeof max === 'undefined') max = 1;",
  "if (typeof rate === 'undefined') rate = 1;",
  "if (v == min) return 0;",
  "return midValue - Math.log( (max-min)/(v-min) - 1) / rate;",
  "}",
].join("\n");
DuAEExpression.Library["inverseLogistic"].requirements = [];

/**
 * Checks if the value is 0; works with arrays.
 * @function
 * @param {Number|Number[]} x The value(s)
 * @return {Boolean} true if all values are 0.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isZero"] = {};
DuAEExpression.Library["isZero"].expression = [
  "function isZero(a)",
  "{",
  "if (a instanceof Array)",
  "{",
  "for ( var i = 0; i < a.length; i++ )",
  "{",
  "if ( a[i] != 0 ) return false;",
  "}",
  "}",
  "else if (a != 0) return false;",
  "return true;",
  "}",
].join("\n");
DuAEExpression.Library["isZero"].requirements = [];

/**
 * The logistic function (sigmoid)
 * @function
 * @param {Number} value The value
 * @param {Number} [midValue=0] The midpoint value, at which the function returns max/2
 * @param {Number} [min=0] The minimum return value
 * @param {Number} [max=1] The maximum return value
 * @param {Number} [rate=1] The logistic growth rate or steepness of the function
 * @return {Number} The result in the range [min, max] (excluding min and max)
 * @category ExpressionLibrary
 */
DuAEExpression.Library["logistic"] = {};
DuAEExpression.Library["logistic"].expression = [
  "function logistic( value, midValue, min, max, rate)",
  "{",
  "if (typeof midValue === 'undefined') midValue = 0;",
  "if (typeof min === 'undefined') min = 0;",
  "if (typeof max === 'undefined') max = 1;",
  "if (typeof rate === 'undefined') rate = 1;",
  "var exp = -rate*(value - midValue);",
  "var result = 1 / (1 + Math.pow(Math.E, exp));",
  "return result * (max-min) + min;",
  "}",
].join("\n");
DuAEExpression.Library["logistic"].requirements = [];

/**
 * Returns the mean of a set of values
 * @function
 * @param {Number[]} values The values
 * @return {Number} The mean
 * @category ExpressionLibrary
 */
DuAEExpression.Library["mean"] = {};
DuAEExpression.Library["mean"].expression = [
  "function mean( values )",
  "{",
  "var num = values.length;",
  "var result = 0;",
  "for (var i = 0; i < num; i++)",
  "{",
  "result += values[i];",
  "}",
  "return result / num;",
  "}",
].join("\n");
DuAEExpression.Library["mean"].requirements = [];

/**
 * Multiplies a list of points/vectors with a scalar.
 * @function
 * @param {float[][]} p The list of points
 * @param {float} w The multiplier
 * @returns {float[][]} The multiplied points
 * @category ExpressionLibrary
 */
DuAEExpression.Library["multPoints"] = {};
DuAEExpression.Library["multPoints"].expression = [
  "function multPoints(p, w) {",
  "var r = [];",
  "for (var i = 0, n = p.length; i < n; i++) {",
  "r.push(p[i] * w);",
  "}",
  "return r;",
  "}",
].join("\n");
DuAEExpression.Library["multPoints"].requirements = [];

/**
 * Multiplies two sets of values, one with each other. If the lists are not the same length, additional values will be ignored
 * @function
 * @param {float[]} setA The first list
 * @param {float[]} setB The other list
 * @returns {float[]} The new values
 * @category ExpressionLibrary
 */
DuAEExpression.Library["multSets"] = {};
DuAEExpression.Library["multSets"].expression = [
  "function multSets(setA, setB) {",
  "var r = [];",
  "var countA = setA.length;",
  "var countB = setB.length;",
  "var count = countA;",
  "if (countB < countA) count = countB;",
  "for (var i = 0; i < count; i++) {",
  "r.push(setA[i] * setB[i]);",
  "}",
  "return r;",
  "}",
].join("\n");
DuAEExpression.Library["multSets"].requirements = [];

/**
 * Normalizes a list of weights so their sum equals 1.0
 * @function
 * @param {float[]} weights The weights to normalize
 * @param {float} [sum] The sum of the weights; provide it if it's already computed to improve performance.
 * @returns {float[]} The normalized weights
 * @category ExpressionLibrary
 */
DuAEExpression.Library["normalizeWeights"] = {};
DuAEExpression.Library["normalizeWeights"].expression = [
  "function normalizeWeights(weights, sum) {",
  "if(typeof sum === 'undefined') {",
  "sum = 0;",
  "for (var i = 0, n = weights.length; i < n; i++) {",
  "sum += weights[i];",
  "}",
  "}",
  "if (sum == 1 || sum == 0) return weights;",
  "var o = 1 - sum;",
  "var normalized = [];",
  "for (var i = 0, n = weights.length; i < n; i++) {",
  "var w = weights[i];",
  "normalized.push(w + (w / sum) * o);",
  "}",
  "return normalized;",
  "}",
].join("\n");
DuAEExpression.Library["normalizeWeights"].requirements = [];

/**
 * Generates a unit vector in 2 or 3 dimensions
 * @function
 * @param {Number} dimensions The number of dimensions, either 2 or 3
 * @param {function} [rng=random] A Random number generator which can take a min and max value like the random() function.
 * @returns {Number[]} The vector
 * @category ExpressionLibrary
 */
DuAEExpression.Library["randomUnitVector"] = {};
DuAEExpression.Library["randomUnitVector"].expression = [
  "function randomUnitVector( dimensions, rng ) {",
  "if (typeof rng === 'undefined') rng = random;",
  "var angle = rng(0, 2*Math.PI);",
  "if (dimensions == 2) {",
  "return [Math.cos(angle), Math.sin(angle)];",
  "}",
  "else if (dimensions == 3) {",
  "var z = rng(-1, 1);",
  "var f = Math.sqrt(1-z*z);",
  "return [",
  "f*Math.cos(angle),",
  "f*Math.sin(angle),",
  "z",
  "];",
  "}",
  "else {",
  "return null;",
  "}",
  "}",
].join("\n");
DuAEExpression.Library["randomUnitVector"].requirements = [];

/**
 * Fix for the ExtendScript engine, implements the Math.sign function.
 * @function
 * @name Math.sign
 * @param {Number} x The value
 * @return {Number} The sign, 1, -1 or 0.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["sign"] = {};
DuAEExpression.Library["sign"].expression = [
  "if (typeof Math.sign === 'undefined') Math.sign = function(x) { return ((x > 0) - (x < 0)) || +x; };",
].join("\n");
DuAEExpression.Library["sign"].requirements = [];

/**
 * Substracts two lists of points/vectors.
 * @function
 * @param {float[][]} p1 The list of points
 * @param {float[][]} p2 The other list of points
 * @param {float} w A weight to multiply the values of p2
 * @returns {float[][]} The substracted points
 * @category ExpressionLibrary
 */
DuAEExpression.Library["subPoints"] = {};
DuAEExpression.Library["subPoints"].expression = [
  "function subPoints(p1, p2, w) {",
  "var n = p1.length;",
  "if (p2.length > n) n = p2.length;",
  "var r = [];",
  "for (var i = 0; i < n; i++) {",
  "if (i >= p1.length) {",
  "r.push(-p2[i] * w);",
  "continue;",
  "}",
  "if (i >= p2.length) {",
  "r.push(p1[i]);",
  "continue;",
  "}",
  "r.push(p1[i] - p2[i] * w);",
  "}",
  "return r;",
  "}",
].join("\n");
DuAEExpression.Library["subPoints"].requirements = [];

/**
 * Creates a unit vector along a given axis
 * @function
 * @param {Number} dimensions
 * @param {Number} axis
 * @returns {Number[]}
 * @category ExpressionLibrary
 */
DuAEExpression.Library["unitVector"] = {};
DuAEExpression.Library["unitVector"].expression = [
  "function unitVector(dimensions, axis) {",
  "var vec = new Array(dimensions)",
  "for (var i = 0; i < dimensions; i++) {",
  "if (i == axis) vec[i] = 1;",
  "else vec[i] = 0;",
  "}",
  "return vec;",
  "}",
].join("\n");
DuAEExpression.Library["unitVector"].requirements = [];

/**
 * Adds two paths together.<br />
 * The paths must be objects with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path1 First path
 * @param {Object} path2 Second path
 * @param {float} path2weight A weight to multiply the second path values
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires addPoints
 * @category ExpressionLibrary
 */
DuAEExpression.Library["addPath"] = {};
DuAEExpression.Library["addPath"].expression = [
  "function addPath(path1, path2, path2weight) {",
  "var vertices = addPoints(path1.points, path2.points, path2weight);",
  "var inT = addPoints(path1.inTangents, path2.inTangents, path2weight);",
  "var outT = addPoints(path1.outTangents, path2.outTangents, path2weight);",
  "var path = {};",
  "path.points = vertices;",
  "path.inTangents = inT;",
  "path.outTangents = outT;",
  "return path;",
  "}",
].join("\n");
DuAEExpression.Library["addPath"].requirements = ["addPoints"];

/**
 * Checks if a point is inside a given polygon.
 * @function
 * @param {float[]} point A 2D point [x, y]
 * @param {float[][]} points The vertices of the polygon
 * @returns {object} An object with two properties:
 * - `inside (bool)` is true if the point is inside the polygon
 * - `closestVertex` is the index of the closest vertex of the polygon
 * @category ExpressionLibrary
 */
DuAEExpression.Library["inside"] = {};
DuAEExpression.Library["inside"].expression = [
  "function inside( point, points ) {",
  "var x = point[ 0 ],",
  "y = point[ 1 ];",
  "var result = 0;",
  "var inside = false;",
  "for ( var i = 0, j = points.length - 1; i < points.length; j = i++ ) {",
  "var xi = points[ i ][ 0 ],",
  "yi = points[ i ][ 1 ];",
  "var xj = points[ j ][ 0 ],",
  "yj = points[ j ][ 1 ];",
  "var intersect = ( ( yi > y ) != ( yj > y ) ) &&",
  "( x <",
  "( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi );",
  "if ( intersect ) inside = !inside;",
  "var t1 = length( points[ i ], point );",
  "var t2 = length( points[ result ], point );",
  "if ( t1 < t2 ) {",
  "result = i;",
  "}",
  "}",
  "return { inside: inside, closestVertex: result };",
  "};",
].join("\n");
DuAEExpression.Library["inside"].requirements = [];

/**
 * Multiplies a path with a scalar.<br />
 * The path must be an object with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path The path
 * @param {float} weight The multipliers
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires multPoints
 * @category ExpressionLibrary
 * @category ExpressionLibrary
 */
DuAEExpression.Library["multPath"] = {};
DuAEExpression.Library["multPath"].expression = [
  "function multPath(path, weight) {",
  "var vertices = multPoints(path.points, weight);",
  "var inT = multPoints(path.inTangents, weight);",
  "var outT = multPoints(path.outTangents, weight);",
  "var path = {};",
  "path.points = vertices;",
  "path.inTangents = inT;",
  "path.outTangents = outT;",
  "return path;",
  "}",
].join("\n");
DuAEExpression.Library["multPath"].requirements = ["multPoints"];

/**
 * Substracts two paths together.<br />
 * The paths must be objects with three array attributes: points, inTangents, outTangents
 * @function
 * @param {Object} path1 First path
 * @param {Object} path2 Second path
 * @param {float} path2weight A weight to multiply the second path values
 * @returns {Object} A path object with three array attributes: points, inTangents, outTangents
 * @requires subPoints
 * @category ExpressionLibrary
 */
DuAEExpression.Library["subPath"] = {};
DuAEExpression.Library["subPath"].expression = [
  "function subPath(path1, path2, path2weight) {",
  "var vertices = subPoints(path1.points, path2.points, path2weight);",
  "var inT = subPoints(path1.inTangents, path2.inTangents, path2weight);",
  "var outT = subPoints(path1.outTangents, path2.outTangents, path2weight);",
  "var path = {};",
  "path.points = vertices;",
  "path.inTangents = inT;",
  "path.outTangents = outT;",
  "return path;",
  "}",
].join("\n");
DuAEExpression.Library["subPath"].requirements = ["subPoints"];

/**
 * Checks the type of a pseudo-effect used by Duik.<br />
 * This is a workaround for the missing matchName in expressions.<br />
 * Pseudo-Effects used by Duik start with a hidden property which name is the same as the matchName of the effect itself (without the 'Pseudo/' part).
 * @function
 * @example
 * if ( checkEffect(thisLayer.effect(1), "DUIK parentConstraint2") ) { "This is the second version of the parent constraint by Duik" }
 * else { "Who knows what this is?" }
 * @param {Property} fx The effect to check
 * @param {string} duikMatchName The matchName of a pseudo-effect used by Duik (without the 'Pseudo/' part)
 * @return {boolean} True when the property at propIndex is named propName
 * @category ExpressionLibrary
 */
DuAEExpression.Library["checkDuikEffect"] = {};
DuAEExpression.Library["checkDuikEffect"].expression = [
  "function checkDuikEffect(fx, duikMatchName) {",
  "if (fx.numProperties  < 3) return false;",
  "try { if (fx(2).name != duikMatchName) return false; }",
  "catch (e) { return false; }",
  "return true;",
  "}",
].join("\n");
DuAEExpression.Library["checkDuikEffect"].requirements = [];

/**
 * Checks the type of an effect.<br />
 * This is a workaround for the missing matchName in expressions.<br />
 * It checks if the given effect has a specific property at a specific index.
 * @function
 * @example
 * if ( checkEffect(thisLayer.effect(1), 1, "Blur") ) { "The first effect is a blur!" }
 * else { "Who knows what this is?" }
 * @param {Property} fx The effect to check
 * @param {int} propIndex The index of the property
 * @param {string} propName The expected name of the property. Be careful with the internationalization of After Effects...
 * @return {boolean} True when the property at propIndex is named propName
 * @category ExpressionLibrary
 */
DuAEExpression.Library["checkEffect"] = {};
DuAEExpression.Library["checkEffect"].expression = [
  "function checkEffect(fx, propIndex, propName) {",
  "if (fx.numProperties  < propIndex) return false;",
  "if (!!$.engineName) {",
  "if ( fx(propIndex).name != propName ) return false;",
  "}",
  "else {",
  "try { if (fx(propIndex).name != propName) return false; }",
  "catch (e) { return false; }",
  "}",
  "return true;",
  "}",
].join("\n");
DuAEExpression.Library["checkEffect"].requirements = [];

/**
 * Gets a layer from a layer property in an effect, without generating an error if "None" is selected with the Legacy expression engine.
 * @function
 * @param {Property} fx The effect
 * @param {int|string} ind The index or the name of the property
 * @return {Layer|null} The layer, or null if set to "None"
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getEffectLayer"] = {};
DuAEExpression.Library["getEffectLayer"].expression = [
  "function getEffectLayer( fx, ind ) {",
  "try { var l = fx( ind ); return l; }",
  "catch ( e ) { return null; }",
  "}",
].join("\n");
DuAEExpression.Library["getEffectLayer"].requirements = [];

/**
 * Gets the path from the current property at a given time.
 * @function
 * @return {Object} A path object with three array attributes: points, inTangents, outTangents
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPath"] = {};
DuAEExpression.Library["getPath"].expression = [
  "function getPath(t) {",
  "var path = {};",
  "path.points = points(t);",
  "path.inTangents = inTangents(t);",
  "path.outTangents = outTangents(t);",
  "return path;",
  "}",
].join("\n");
DuAEExpression.Library["getPath"].requirements = [];

/**
 * Gets a property from an array of indices as returned by getPropPath.
 * @function
 * @param {Layer} l The layer containing the needed property
 * @param {int[]} p The indices to the property.
 * @return {Property} The property.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPropFromPath"] = {};
DuAEExpression.Library["getPropFromPath"].expression = [
  "function getPropFromPath( l, p )",
  "{",
  "prop = l;",
  "for ( var i = p.length - 1; i >= 0; i-- )",
  "prop = prop(p[i]);",
  "return prop;",
  "}",
].join("\n");
DuAEExpression.Library["getPropFromPath"].requirements = [];

/**
 * Gets an array of all indices needed to get the current property from the layer level.
 * @function
 * @return {int[]} All indices to the property.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPropPath"] = {};
DuAEExpression.Library["getPropPath"].expression = [
  "function getPropPath()",
  "{",
  "var path = [];",
  "var prop = thisProperty;",
  "ok = true;",
  "while( ok )",
  "{",
  "try {",
  "path.push( prop.propertyIndex );",
  "prop = prop.propertyGroup();",
  "}",
  "catch (e) { ok = false; }",
  "}",
  "return path;",
  "}",
].join("\n");
DuAEExpression.Library["getPropPath"].requirements = [];

/**
 * Gets the same property as the current one but from another layer.
 * @function
 * @param {Layer} l The layer containing the needed property
 * @return {Property} The property.
 * @requires getPropFromPath
 * @requires getPropPath
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getSameProp"] = {};
DuAEExpression.Library["getSameProp"].expression = [
  "function getSameProp( l )",
  "{",
  "return getPropFromPath( l, getPropPath() );",
  "}",
].join("\n");
DuAEExpression.Library["getSameProp"].requirements = [
  "getPropFromPath",
  "getPropPath",
];

/**
 * Checks if a property is a layer. Useful when traversing up the property tree to stop when getting the layer.
 * @function
 * @param {Property} prop - The property to test
 * @return {boolean} true if the prop is a layer
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isLayer"] = {};
DuAEExpression.Library["isLayer"].expression = [
  "function isLayer( prop ) {",
  "try { if ( prop.index ) return true; }",
  "catch (e) { return false; }",
  "}",
].join("\n");
DuAEExpression.Library["isLayer"].requirements = [];

/**
 * Checks if a property is a path property.
 * @function
 * @param {Property} prop The property
 * @return {boolean} true if the property is a path property.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isPath"] = {};
DuAEExpression.Library["isPath"].expression = [
  "function isPath(prop) {",
  "try {",
  "createPath();",
  "return true;",
  "} catch (e) {",
  "return false;",
  "}",
  "}",
].join("\n");
DuAEExpression.Library["isPath"].requirements = [];

/**
 * Checks if a property is a transform.position property.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Property} [prop=thisProperty] The property
 * @return {boolean} true if the property is the transform.position property.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isPosition"] = {};
DuAEExpression.Library["isPosition"].expression = [
  "function isPosition(prop) {",
  "return  prop === position;",
  "}",
].join("\n");
DuAEExpression.Library["isPosition"].requirements = [];

/**
 * Checks if a property is a shape layer.
 * @function
 * @param {Property} [lay=thisLayer] - The layer to test
 * @return {boolean} true if the prop is a layer
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isShapeLayer"] = {};
DuAEExpression.Library["isShapeLayer"].expression = [
  "function isShapeLayer( lay ) {",
  "if (typeof(lay) === 'undefined')",
  "lay = thisLayer;",
  'try { if (lay("ADBE Root Vectors Group")) return true; }',
  "catch (e) { return false; }",
  "}",
].join("\n");
DuAEExpression.Library["isShapeLayer"].requirements = [];

/**
 * Checks if a property is spatial
 * @function
 * @param {Property} [prop=thisProperty] The property to check
 * @return {boolean} true if the property is spatial.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isSpatial"] = {};
DuAEExpression.Library["isSpatial"].expression = [
  "function isSpatial(prop) {",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "if (!(prop.value instanceof Array)) return false;",
  "if (prop.value.length != 2 && prop.value.length != 3) return false;",
  'try { if (typeof prop.speed !== "undefined") return true; }',
  "catch (e) { return false; }",
  "}",
].join("\n");
DuAEExpression.Library["isSpatial"].requirements = [];

/**
 * Checks if the current property is animated at a given time.
 * @function
 * @param {number} [t=time] The time
 * @param {number} [threshold=0.01] The speed under which the property is considered still.
 * @param {number} [axis=-1] The axis to check. If < 0, will check all axis.
 * @return {boolean} true if the property does not vary.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["isStill"] = {};
DuAEExpression.Library["isStill"].expression = [
  "function isStill(t, threshold, axis) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof threshold === 'undefined') threshold = 0.01;",
  "if (typeof axis === 'undefined') axis = -1;",
  "var d = valueAtTime(t) - valueAtTime(t + thisComp.frameDuration*.1);",
  "if (d instanceof Array) {",
  "if (axis >= 0) return Math.abs(d[axis]) <= threshold;",
  "for (var i = 0; i < d.length; i++) {",
  "if (Math.abs(d[i]) > threshold) return false;",
  "}",
  "return true;",
  "} else return Math.abs(d) <= threshold;",
  "}",
].join("\n");
DuAEExpression.Library["isStill"].requirements = [];

/**
 * Checks the last previous time at which the property value was not 0. (meant to be used on boolean property, works on single dimension properties too).
 * @param {Property} prop The property to check
 * @param {float} t The time before which to run the check
 * @returns {float} The last active time before t
 * @function
 * @category ExpressionLibrary
 * @requires getPrevKey
 */
DuAEExpression.Library["lastActiveTime"] = {};
DuAEExpression.Library["lastActiveTime"].expression = [
  "function lastActiveTime( prop, t ) {",
  "if ( prop.valueAtTime(t) ) return t;",
  "while( t > 0 )",
  "{",
  "var prevKey = getPrevKey( t, prop );",
  "if ( !prevKey ) break;",
  "if ( prevKey.value ) return t;",
  "t = prevKey.time - .001;",
  "}",
  "return 0;",
  "}",
].join("\n");
DuAEExpression.Library["lastActiveTime"].requirements = ["getPrevKey"];

/**
 * Checks the next time at which the property value was not 0. (meant to be used on boolean property, works on single dimension properties too).
 * @param {Property} prop The property to check
 * @param {float} t The time after which to run the check
 * @returns {float} The next active time after t
 * @function
 * @requires getNextKey
 * @category ExpressionLibrary
 */
DuAEExpression.Library["nextActiveTime"] = {};
DuAEExpression.Library["nextActiveTime"].expression = [
  "function nextActiveTime( prop, t )",
  "{",
  "if ( prop.valueAtTime(t) ) return t;",
  "while( t < thisComp.duration )",
  "{",
  "var nextKey = getNextKey( t + .001, prop );",
  "if ( !nextKey ) break;",
  "t = nextKey.time;",
  "if ( nextKey.value ) return t;",
  "}",
  "return 0;",
  "}",
].join("\n");
DuAEExpression.Library["nextActiveTime"].requirements = ["getNextKey"];

/**
 * Generates a "zero" value for the current property, i.e. <code>0</code> or <code>[0,0]</code>, etc. according to the property type.<br />
 * Note that for path properties, this method returns a path object with three array attributes: points, inTangents, outTangents.
 * @function
 * @return {any} The zero value.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["zero"] = {};
DuAEExpression.Library["zero"].expression = [
  "function zero() {",
  'if (typeof thisProperty.value === "number") return 0;',
  "if (thisProperty.value instanceof Array) {",
  "var result = [0];",
  "for (var i = 1, n = value.length; i < n; i++) result.push(0);",
  "return result;",
  "}",
  "if (isPath(thisProperty)) {",
  "var path = {};",
  "var vertices = [",
  "[0, 0]",
  "];",
  "var inT = [",
  "[0, 0]",
  "];",
  "var outT = [",
  "[0, 0]",
  "];",
  "for (var i = 1, n = points(0).length; i < n; i++) {",
  "vertices.push([0, 0]);",
  "inT.push([0, 0]);",
  "outT.push([0, 0]);",
  "}",
  "path.points = vertices;",
  "path.inTangents = inT;",
  "path.outTangents = outT;",
  "return path;",
  "}",
  "}",
].join("\n");
DuAEExpression.Library["zero"].requirements = [];

/**
 * Adds some noise to a value.<br />
 * You may use seedRandom() before using this function as it will influence the generated noise.
 * A timeless noise can be achieved with <code>seedRandom(index,true)</code> for example.
 * @function
 * @param {number|number[]} val The value to add noise to.
 * @param {float} quantity The quantity of noise. A percentage. 100 means the value can range from (val * 0) to (val * 2).
 * @example
 * seedRandom(index, true) // a timeless noise
 * addNoise(value, 50 ); // the property value will have noise between (value * 0.5) and (value * 1.5) which won't vary through time.
 * @example
 * seedRandom(index, false);
 * addNoise(value, 33 ); // the noise will change at each frame, varying between (value * .66) and (value * 1.33)
 * @category ExpressionLibrary
 */
DuAEExpression.Library["addNoise"] = {};
DuAEExpression.Library["addNoise"].expression = [
  "function addNoise( val, quantity ) {",
  "var randomValue = random(0.9,1.1);",
  "var noiseValue = noise(valueAtTime(0) * randomValue);",
  "noiseValue = noiseValue * (quantity / 100);",
  "return val * ( noiseValue + 1 );",
  "}",
].join("\n");
DuAEExpression.Library["addNoise"].requirements = [];

/**
 * Removes the ancestors rotation from the rotation of a layer.
 * This is very useful to make a layer keep its orientation without being influenced by its parents.<br />
 * @function
 * @example
 * //in a rotation property, just include the function and use:
 * dishineritRotation();
 * //the layer will now keep its own orientation.
 * @example
 * //you can also combine the result with something else
 * var result = dishineritRotation();
 * result + wiggle(5,20);
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {float} The new rotation value, in degrees.
 * @requires sign
 * @category ExpressionLibrary
 */
DuAEExpression.Library["dishineritRotation"] = {};
DuAEExpression.Library["dishineritRotation"].expression = [
  "function dishineritRotation( l ) {",
  "if (typeof l === 'undefined') l = thisLayer;",
  "var r = l.rotation.value;",
  "while ( l.hasParent ) {",
  "l = l.parent;",
  "var s = l.scale.value;",
  "r -= l.rotation.value * Math.sign(s[0]*s[1]);",
  "}",
  "return r;",
  "}",
].join("\n");
DuAEExpression.Library["dishineritRotation"].requirements = ["sign"];

/**
 * Removes the ancestors scale from the scale of a layer.
 * This is very useful to make a layer keep its scale without being influenced by its parents.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @example
 * //in a rotation property, just include the function and use:
 * dishineritScale();
 * //the layer will now keep its own scale.
 * @example
 * //you can also combine the result with something else
 * var result = dishineritScale();
 * result + wiggle(5,20);
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {float[]} The new scale value, in percent.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["dishineritScale"] = {};
DuAEExpression.Library["dishineritScale"].expression = [
  "function dishineritScale( l ) {",
  "var s = l.scale.value;",
  "var threeD = s.length == 3;",
  "while ( l.hasParent ) {",
  "l = l.parent;",
  "var ps = l.scale.value / 100;",
  "if (threeD && ps.length == 3) {",
  "s = [ s[0]/ps[0], s[1]/ps[1], s[2]/ps[2] ];",
  "}",
  "else if (threeD) {",
  "s = [ s[0]/ps[0], s[1]/ps[1], s[2] ];",
  "}",
  "else {",
  "s = [ s[0]/ps[0], s[1]/ps[1] ];",
  "}",
  "}",
  "return s;",
  "}",
].join("\n");
DuAEExpression.Library["dishineritScale"].requirements = [];

/**
 * Converts the point coordinates from the current group in the shape layer to the Layer.<br />
 * Use toWorld and toComp with the result if you need te coordinates in the world or the comp.
 * @function
 * @param {number[]} point The 2D coordinates of the point in the current group.
 * @return {number[]} The 2D coordinates of the point in the Layer.
 * @requires Matrix
 * @requires getGroupTransformMatrix
 * @category ExpressionLibrary
 */
DuAEExpression.Library["fromGroupToLayer"] = {};
DuAEExpression.Library["fromGroupToLayer"].expression = [
  "function fromGroupToLayer( point ) {",
  "var matrix = getGroupTransformMatrix();",
  "return matrix.applyToPoint( point );",
  "}",
].join("\n");
DuAEExpression.Library["fromGroupToLayer"].requirements = [
  "Matrix",
  "getGroupTransformMatrix",
];

/**
 * Converts the point coordinates from Layer to the current group in the shape layer.<br />
 * Use fromWorld or fromComp first if you need to convert from the world or composition coordinates, and pass the result to this function.
 * @function
 * @param {number[]} point The 2D coordinates of the point in the Layer.
 * @return {number[]} The 2D coordinates of the point in the current group.
 * @requires Matrix
 * @requires getGroupTransformMatrix
 * @category ExpressionLibrary
 */
DuAEExpression.Library["fromLayerToGroup"] = {};
DuAEExpression.Library["fromLayerToGroup"].expression = [
  "function fromLayerToGroup( point ) {",
  "var matrix = getGroupTransformMatrix().inverse();",
  "return matrix.applyToPoint( point );",
  "}",
].join("\n");
DuAEExpression.Library["fromLayerToGroup"].requirements = [
  "Matrix",
  "getGroupTransformMatrix",
];

/**
 * Gets the "real" scale of a layer, resulting to its scale property, the scale of its parents, and it's location in Z-space if it's 3D.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @param {number} [t=time] The time when to get the scale
 * @return {number} The scale ratio. This is not a percent, 1.0 is 100%.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getCompScale"] = {};
DuAEExpression.Library["getCompScale"].expression = [
  "function getCompScale( l, t ) {",
  "var originalWidth = length( l.anchorPoint, [ l.width, 0 ] );",
  "var anchorInComp = l.toComp( l.anchorPoint, t );",
  "var widthInComp = l.toComp( [ l.width, 0 ], t );",
  "var newWidth = length(anchorInComp, widthInComp);",
  "return newWidth / originalWidth;",
  "}",
].join("\n");
DuAEExpression.Library["getCompScale"].requirements = [];

/**
 * Gets the transformation Matrix for the current group in a shape layer, including the transformation from the ancestor groups<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Property} [prop=thisProperty] The property from which to get the matrix
 * @return {Matrix} The 2D Transform Matrix.
 * @requires isLayer
 * @requires Matrix
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getGroupTransformMatrix"] = {};
DuAEExpression.Library["getGroupTransformMatrix"].expression = [
  "function getGroupTransformMatrix( prop ) {",
  "var matrix = new Matrix();",
  "var shapeGroups = [];",
  "var parentProp = prop.propertyGroup(1);",
  "while( parentProp && !isLayer(parentProp) )",
  "{",
  "try { if ( parentProp.transform ) shapeGroups.push( parentProp.transform ); }",
  "catch (e) {}",
  "parentProp = parentProp.propertyGroup(1);",
  "}",
  "for (var i = shapeGroups.length - 1; i >= 0; i--)",
  "{",
  "var group = shapeGroups[i];",
  "matrix.translate( group.position.value );",
  "matrix.rotate( group.rotation.value );",
  "var aPX = -( group.anchorPoint.value[ 0 ] * group.scale.value[ 0 ] / 100 );",
  "var aPY = -( group.anchorPoint.value[ 1 ] * group.scale.value[ 1 ] / 100 );",
  "matrix.translate( [ aPX, aPY ] );",
  "matrix.scale( group.scale.value / 100 );",
  "}",
  "return matrix;",
  "}",
].join("\n");
DuAEExpression.Library["getGroupTransformMatrix"].requirements = [
  "isLayer",
  "Matrix",
];

/**
 * Gets the comp position (2D Projection in the comp) of a layer.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The comp position
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getLayerCompPos"] = {};
DuAEExpression.Library["getLayerCompPos"].expression = [
  "function getLayerCompPos( t, l ) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof l === 'undefined') l = thisLayer;",
  "if (l.hasParent) return l.parent.toComp(l.position, t);",
  "return l.toComp(l.anchorPoint, t);",
  "}",
].join("\n");
DuAEExpression.Library["getLayerCompPos"].requirements = [];

/**
 * Gets the world position of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} other The other layer
 * @param {Layer} [origin=thisLayer] The origin
 * @param {number} [t=time] Time from when to get the position
 * @return {number[]} The world position
 * @requires getLayerWorldPos
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getLayerDistance"] = {};
DuAEExpression.Library["getLayerDistance"].expression = [
  "function getLayerDistance(other, origin, t) {",
  "if (typeof origin === 'undefined') origin = thisLayer;",
  "if (typeof t === 'undefined') t = time;",
  "var p1 = getLayerWorldPos(t, other);",
  "var p2 = getLayerWorldPos(t, origin);",
  "return length(p1, p2);",
  "}",
].join("\n");
DuAEExpression.Library["getLayerDistance"].requirements = ["getLayerWorldPos"];

/**
 * Gets the world position of a layer.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The world position
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getLayerWorldPos"] = {};
DuAEExpression.Library["getLayerWorldPos"].expression = [
  "function getLayerWorldPos(t, l) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof l === 'undefined') l = thisLayer;",
  "if (l.hasParent) return l.parent.toWorld(l.position, t);",
  "return l.position.valueAtTime(t);",
  "}",
].join("\n");
DuAEExpression.Library["getLayerWorldPos"].requirements = [];

/**
 * Gets the world instant speed of a layer.
 * @function
 * @param {number} [t=time] The time when to get the velocity
 * @param {Layer} [l=thisLayer] The layer
 * @return {number} A positive number. The speed.
 * @requires getLayerWorldVelocity
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getLayerWorldSpeed"] = {};
DuAEExpression.Library["getLayerWorldSpeed"].expression = [
  "function getLayerWorldSpeed(t, l) {",
  "return length(getWorldVelocity(t, l));",
  "}",
].join("\n");
DuAEExpression.Library["getLayerWorldSpeed"].requirements = [
  "getLayerWorldVelocity",
];

/**
 * Gets the world instant velocity of a layer.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] The time when to get the velocity
 * @param {Layer} [l=thisLayer] The layer
 * @return {number[]} The velocity.
 * @requires getLayerWorldPos
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getLayerWorldVelocity"] = {};
DuAEExpression.Library["getLayerWorldVelocity"].expression = [
  "function getLayerWorldVelocity(t, l) {",
  "return (getLayerWorldPos(t, l) - getLayerWorldPos(t - 0.01, l)) * 100;",
  "}",
].join("\n");
DuAEExpression.Library["getLayerWorldVelocity"].requirements = [
  "getLayerWorldPos",
];

/**
 * Gets the world orientation of a (2D) layer.
 * @function
 * @param {Layer} l The layer to get the orientation from
 * @return {float} The orientation, in degrees.
 * @requires sign
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getOrientation"] = {};
DuAEExpression.Library["getOrientation"].expression = [
  "function getOrientation( l ) {",
  "var sign = getScaleMirror( l );",
  "var uTurn = getScaleUTurn( l )",
  "var r = l.rotation.value * sign + uTurn;",
  "while ( l.hasParent ) {",
  "l = l.parent;",
  "var lr = l.rotation.value;",
  "if (l.hasParent) {",
  "var s = l.parent.scale.value;",
  "lr *= Math.sign(s[0]*s[1]);",
  "}",
  "r += lr;",
  "}",
  "return r;",
  "}",
  "function getScaleMirror( l ) {",
  "var sign = 1;",
  "while (l.hasParent) {",
  "l = l.parent;",
  "var s = l.scale.value;",
  "sign *= Math.sign(s[0]*s[1]);",
  "}",
  "return sign;",
  "}",
  "function getScaleUTurn( l ) {",
  "var u = 1;",
  "while (l.hasParent) {",
  "l = l.parent;",
  "var s = l.scale.value;",
  "u = u*s[1];",
  "}",
  "if (u < 0) return 180;",
  "else return 0;",
  "}",
].join("\n");
DuAEExpression.Library["getOrientation"].requirements = ["sign"];

/**
 * Gets the world orientation of a (2D) layer at a specific time.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} l The layer to get the orientation from
 * @param {float} [t=time] The time at which to get the orientation
 * @return {float} The orientation, in degrees.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getOrientationAtTime"] = {};
DuAEExpression.Library["getOrientationAtTime"].expression = [
  "function getOrientationAtTime( l, t ) {",
  "var r = 0;",
  "r += l.rotation.valueAtTime( t );",
  "while ( l.hasParent ) {",
  "l = l.parent;",
  "r += l.rotation.valueAtTime( t );",
  "}",
  "return r;",
  "}",
].join("\n");
DuAEExpression.Library["getOrientationAtTime"].requirements = [];

/**
 * Gets the world speed of a property.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world speed
 * @requires getPropWorldVelocity
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPropWorldSpeed"] = {};
DuAEExpression.Library["getPropWorldSpeed"].expression = [
  "function getPropWorldSpeed(t, prop) {",
  "return length(getPropWorldVelocity(t, prop));",
  "}",
].join("\n");
DuAEExpression.Library["getPropWorldSpeed"].requirements = [
  "getPropWorldVelocity",
];

/**
 * Gets the world coordinates of a property.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world coordinates
 * @requires getLayerWorldPos
 * @requires isPosition
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPropWorldValue"] = {};
DuAEExpression.Library["getPropWorldValue"].expression = [
  "function getPropWorldValue(t, prop) {",
  "if (typeof t === 'undefined') t = time;",
  "if (typeof prop === 'undefined') prop = thisProperty;",
  "if (isPosition(prop)) return getLayerWorldPos(t, thisLayer);",
  "return thisLayer.toWorld(prop.valueAtTime(t), t);",
  "}",
].join("\n");
DuAEExpression.Library["getPropWorldValue"].requirements = [
  "getLayerWorldPos",
  "isPosition",
];

/**
 * Gets the world velocity of a property.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {number} [t=time] Time from when to get the position
 * @param {Layer} [prop=thisProperty] The property
 * @return {number[]} The world velocity
 * @requires getPropWorldValue
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getPropWorldVelocity"] = {};
DuAEExpression.Library["getPropWorldVelocity"].expression = [
  "function getPropWorldVelocity(t, prop) {",
  "return (getPropWorldValue(t + 0.005, prop) - getPropWorldValue(t - 0.005, prop)) * 100;",
  "}",
].join("\n");
DuAEExpression.Library["getPropWorldVelocity"].requirements = [
  "getPropWorldValue",
];

/**
 * Gets the world scale of a layer.
 * @function
 * @param {Layer} l The layer to get the scale from
 * @return {float[]} The scale, in percent.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["getScale"] = {};
DuAEExpression.Library["getScale"].expression = [
  "function getScale( l ) {",
  "var s = l.scale.value;",
  "var threeD = s.length == 3;",
  "while ( l.hasParent ) {",
  "l = l.parent;",
  "var ps = l.scale.value / 100;",
  "if (threeD && ps.length == 3) {",
  "s = [ s[0]*ps[0], s[1]*ps[1], s[2]*ps[2] ];",
  "}",
  "else if (threeD) {",
  "s = [ s[0]*ps[0], s[1]*ps[1], s[2] ];",
  "}",
  "else {",
  "s = [ s[0]*ps[0], s[1]*ps[1] ];",
  "}",
  "}",
  "return s;",
  "}",
].join("\n");
DuAEExpression.Library["getScale"].requirements = [];

/**
 * Checks if the layer has been flipped (scale sign is not the same on both axis).
 * @function
 * @param {Layer} [l=thisLayer] The layer
 * @return {bool} Whether the layer is flipped
 * @category ExpressionLibrary
 * @requires sign
 */
DuAEExpression.Library["isLayerFlipped"] = {};
DuAEExpression.Library["isLayerFlipped"].expression = [
  "function isLayerFlipped( l ) {",
  'if (typeof l === "undefined") l = thisLayer;',
  "var signX = Math.sign( l.scale.value[0] );",
  "var signY = Math.sign( l.scale.value[1] );",
  "return signX != signY;",
  "}",
].join("\n");
DuAEExpression.Library["isLayerFlipped"].requirements = ["sign"];

/**
 * 2D transformation matrix object initialized with identity matrix. See the source code for more documentation.
 * @class
 * @classdesc 2D Transformation Matrix. Simplified for use in After Effects Expressions by Nicolas "Duduf" Dufresne
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @author Epistemex
 * @version 2.7.5
 * @license MIT license (header required)
 * @copyright Epistemex.com 2014-2018
 * @category ExpressionLibrary
 */
DuAEExpression.Library["Matrix"] = {};
DuAEExpression.Library["Matrix"].expression = [
  "function Matrix() {",
  "/*!",
  "2D Transformation Matrix v2.7.5 LT",
  "(c) Epistemex.com 2014-2018",
  "License: MIT",
  "*/",
  "var me = this, _el;",
  "me._t = me.transform;",
  "me.a = me.d = 1;",
  "me.b = me.c = me.e = me.f = 0;",
  "}",
  "Matrix.prototype = {",
  "rotate: function(angle) {",
  "angle = degreesToRadians(angle);",
  "var",
  "cos = Math.cos(angle),",
  "sin = Math.sin(angle);",
  "return this._t(cos, sin, -sin, cos, 0, 0)",
  "},",
  "rotateFromVector: function(x, y) {",
  'return this.rotate(typeof x === "number" ? Math.atan2(y, x) : Math.atan2(x.y, x.x))',
  "},",
  "scale: function(s) {",
  "return this._t(s[0], 0, 0, s[1], 0, 0);",
  "},",
  "shear: function(sx, sy) {",
  "return this._t(1, sy, sx, 1, 0, 0)",
  "},",
  "skew: function(ax, ay) {",
  "return this.shear(Math.tan(ax), Math.tan(ay))",
  "},",
  "setTransform: function(a, b, c, d, e, f) {",
  "var me = this;",
  "me.a = a;",
  "me.b = b;",
  "me.c = c;",
  "me.d = d;",
  "me.e = e;",
  "me.f = f;",
  "return me._x()",
  "},",
  "translate: function(t) {",
  "return this._t(1, 0, 0, 1, t[0], t[1]);",
  "},",
  "transform: function(a2, b2, c2, d2, e2, f2) {",
  "var",
  "me = this,",
  "a1 = me.a,",
  "b1 = me.b,",
  "c1 = me.c,",
  "d1 = me.d,",
  "e1 = me.e,",
  "f1 = me.f;",
  "/* matrix column order is:",
  "*	a c e",
  "*	b d f",
  "*	0 0 1",
  "*/",
  "me.a = a1 * a2 + c1 * b2;",
  "me.b = b1 * a2 + d1 * b2;",
  "me.c = a1 * c2 + c1 * d2;",
  "me.d = b1 * c2 + d1 * d2;",
  "me.e = a1 * e2 + c1 * f2 + e1;",
  "me.f = b1 * e2 + d1 * f2 + f1;",
  "return me._x()",
  "},",
  "multiply: function(m) {",
  "return this._t(m.a, m.b, m.c, m.d, m.e, m.f)",
  "},",
  "inverse: function(cloneContext) {",
  "var",
  "me = this,",
  "m  = new Matrix(cloneContext ? me.context : null),",
  "dt = me.determinant();",
  'if (dt === 0) throw "Matrix not invertible.";',
  "m.a = me.d / dt;",
  "m.b = -me.b / dt;",
  "m.c = -me.c / dt;",
  "m.d = me.a / dt;",
  "m.e = (me.c * me.f - me.d * me.e) / dt;",
  "m.f = -(me.a * me.f - me.b * me.e) / dt;",
  "return m",
  "},",
  "decompose: function() {",
  "var",
  "me		= this,",
  "a		 = me.a,",
  "b		 = me.b,",
  "c		 = me.c,",
  "d		 = me.d,",
  "acos	  = Math.acos,",
  "atan	  = Math.atan,",
  "sqrt	  = Math.sqrt,",
  "pi		= Math.PI,",
  "translate = {x: me.e, y: me.f},",
  "rotation  = 0,",
  "scale	 = {x: 1, y: 1},",
  "skew	  = {x: 0, y: 0},",
  "determ	= a * d - b * c,",
  "r, s;",
  "if (a || b) {",
  "r = sqrt(a * a + b * b);",
  "rotation = b > 0 ? acos(a / r) : -acos(a / r);",
  "scale = {x: r, y: determ / r};",
  "skew.x = atan((a * c + b * d) / (r * r));",
  "}",
  "else if (c || d) {",
  "s = sqrt(c * c + d * d);",
  "rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));",
  "scale = {x: determ / s, y: s};",
  "skew.y = atan((a * c + b * d) / (s * s));",
  "}",
  "else {",
  "scale = {x: 0, y: 0};",
  "}",
  "return {",
  "translate: translate,",
  "rotation : rotation,",
  "scale	: scale,",
  "skew	 : skew",
  "}",
  "},",
  "determinant: function() {",
  "return this.a * this.d - this.b * this.c",
  "},",
  "applyToPoint: function(pt) {",
  "var me = this;",
  "var x = pt[0] * me.a + pt[1] * me.c + me.e;",
  "var y = pt[0] * me.b + pt[1] * me.d + me.f;",
  "var result = [x,y];",
  "if (pt.length == 3) result.push(pt[2]);",
  "return result;",
  "},",
  "isIdentity: function() {",
  "var me = this;",
  "return me.a === 1 && !me.b && !me.c && me.d === 1 && !me.e && !me.f",
  "},",
  "isInvertible: function() {",
  "return !this._q(this.determinant(), 0)",
  "},",
  "isValid: function() {",
  "return !(this.a * this.d)",
  "},",
  "isEqual: function(m) {",
  "var",
  "me = this,",
  "q = me._q;",
  "return  q(me.a, m.a) &&",
  "q(me.b, m.b) &&",
  "q(me.c, m.c) &&",
  "q(me.d, m.d) &&",
  "q(me.e, m.e) &&",
  "q(me.f, m.f)",
  "},",
  "clone: function(noContext) {",
  "return new Matrix(noContext ? null : this.context).multiply(this)",
  "},",
  "_q: function(f1, f2) {",
  "return Math.abs(f1 - f2) < 1e-14",
  "},",
  "_x: function() {",
  "var me = this;",
  "try { if (me.context)",
  "me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);",
  "} catch(e) {}",
  "return me",
  "}",
  "};",
].join("\n");
DuAEExpression.Library["Matrix"].requirements = [];

/**
 * Transform the points from layer to world coordinates
 * @function
 * @param {float[][]} points The points
 * @param {Layer} layer The layer
 * @return {float[][]} The points in world coordinates
 * @category ExpressionLibrary
 */
DuAEExpression.Library["pointsToWorld"] = {};
DuAEExpression.Library["pointsToWorld"].expression = [
  "function pointsToWorld( points, layer ) {",
  "for (var i = 0; i < points.length; i++) {",
  "points[i] = layer.toWorld(points[i]);",
  "}",
  "return points;",
  "}",
].join("\n");
DuAEExpression.Library["pointsToWorld"].requirements = [];

/**
 * Gets the points of the shape path in layer coordinates (applies the group transform)
 * @function
 * @param {Property} prop The property from which to get the path
 * @return {float[][]} The points in layer coordinates
 * @requires getGroupTransformMatrix
 * @category ExpressionLibrary
 */
DuAEExpression.Library["shapePointsToLayer"] = {};
DuAEExpression.Library["shapePointsToLayer"].expression = [
  "function shapePointsToLayer( prop ) {",
  "var points = prop.points();",
  "var matrix = getGroupTransformMatrix( prop );",
  "for (var i = 0; i < points.length; i++) {",
  "points[i] = matrix.applyToPoint( points[i] );",
  "}",
  "return points;",
  "}",
].join("\n");
DuAEExpression.Library["shapePointsToLayer"].requirements = [
  "getGroupTransformMatrix",
];

/**
 * Translates a point with a layer, as if it was parented to it.<br />
 * Note that for performance reasons with expressions, even if the parameters of the function are documented with optional/default values, you MUST provide ALL the arguments when using them.
 * @function
 * @param {Layer} l The layer to get the translation from.
 * @param {float[]} [point=[0,0]] The [X,Y] point to translate (using world coordinates).
 * @param {float} [startT=0] The start time of the translation
 * @param {float} [endT=time] The end time of the translation
 * @return {float[]} The coordinates of the translated point.
 * @category ExpressionLibrary
 */
DuAEExpression.Library["translatePointWithLayer"] = {};
DuAEExpression.Library["translatePointWithLayer"].expression = [
  "function translatePointWithLayer( l, point, startT, endT ) {",
  "try {",
  "var pos = l.fromWorld( point, startT );",
  "} catch ( e ) {",
  "var pos = [ 0, 0 ];",
  "}",
  "var prevPos = l.toWorld( pos, startT );",
  "var newPos = l.toWorld( pos, endT );",
  "return newPos - prevPos;",
  "}",
].join("\n");
DuAEExpression.Library["translatePointWithLayer"].requirements = [];
