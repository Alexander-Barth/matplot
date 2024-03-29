/*
  matplot, JavaScript Matrix Plotting library

  Copyright (C) 2012-2015 Alexander Barth <a dot barth at ulg.ac.be>.

  Released under the MIT license

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*jslint browser: true, continue: true, devel: true, indent: 4, maxerr: 50, newcap: false, plusplus: false, regexp: true, vars: false, white: false, nomen: true */

/*jshint browser: true, devel: true, indent: 4, maxerr: 50, newcap: false, plusplus: false, regexp: true, white: false, nomen: false, onevar: false */
/*global numeric: false, XMLSerializer: false, Blob: false, URL: false, WheelEvent: false */

// creates a global "addwheelListener" method
// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
// https://developer.mozilla.org/en-US/docs/Mozilla_event_reference/wheel

(function (window, document) {
    "use strict";

    var prefix = "", _addEventListener, onwheel, support;

    // detect event model
    if (window.addEventListener) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    if ( document.onmousewheel !== undefined ) {
        // Webkit and IE support at least "mousewheel"
        support = "mousewheel";
    }
    try {
        // Modern browsers support "wheel"
        WheelEvent("wheel");
        support = "wheel";
    } catch (e) {}
    if ( !support ) {
        // let's assume that remaining browsers are older Firefox
        support = "DOMMouseScroll";
    }

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support === "wheel" ? callback : function( originalEvent ) {
            if (!originalEvent) {
                originalEvent = window.event;
            }

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                delatZ: 0,
                preventDefault: function() {
                    if (originalEvent.preventDefault) {
                        originalEvent.preventDefault();
                    }
                    else {
                        originalEvent.returnValue = false;
                    }
                }
            };

            // calculate deltaY (and deltaX) according to the event
            if ( support === "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                if (originalEvent.wheelDeltaX) {
                    event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
                }

                // Alex: position of mouse during scroll event
                event.pageX = originalEvent.pageX;
                event.pageY = originalEvent.pageY;
                event.clientX = originalEvent.clientX;
                event.clientY = originalEvent.clientY;
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support === "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };


}(window,document));


var matplot = (function() {
    "use strict";

    var mp = {};

    mp.DEFAULT_FONT = '"Liberation Sans"';
    mp.DEFAULT_FONT = 'Arial';
    mp.DEFAULT_FONT_SIZE = 18;

    mp.colormaps = {
        'jet': [
            [0.000000000000000,0.000000000000000,0.500000000000000],
            [0.000000000000000,0.000000000000000,0.563492063492063],
            [0.000000000000000,0.000000000000000,0.626984126984127],
            [0.000000000000000,0.000000000000000,0.690476190476190],
            [0.000000000000000,0.000000000000000,0.753968253968254],
            [0.000000000000000,0.000000000000000,0.817460317460317],
            [0.000000000000000,0.000000000000000,0.880952380952381],
            [0.000000000000000,0.000000000000000,0.944444444444444],
            [0.000000000000000,0.007936507936508,1.000000000000000],
            [0.000000000000000,0.071428571428571,1.000000000000000],
            [0.000000000000000,0.134920634920635,1.000000000000000],
            [0.000000000000000,0.198412698412698,1.000000000000000],
            [0.000000000000000,0.261904761904762,1.000000000000000],
            [0.000000000000000,0.325396825396825,1.000000000000000],
            [0.000000000000000,0.388888888888889,1.000000000000000],
            [0.000000000000000,0.452380952380952,1.000000000000000],
            [0.000000000000000,0.515873015873016,1.000000000000000],
            [0.000000000000000,0.579365079365079,1.000000000000000],
            [0.000000000000000,0.642857142857143,1.000000000000000],
            [0.000000000000000,0.706349206349206,1.000000000000000],
            [0.000000000000000,0.769841269841270,1.000000000000000],
            [0.000000000000000,0.833333333333333,1.000000000000000],
            [0.000000000000000,0.896825396825397,1.000000000000000],
            [0.000000000000000,0.960317460317460,1.000000000000000],
            [0.023809523809524,1.000000000000000,0.976190476190476],
            [0.087301587301587,1.000000000000000,0.912698412698413],
            [0.150793650793651,1.000000000000000,0.849206349206349],
            [0.214285714285714,1.000000000000000,0.785714285714286],
            [0.277777777777778,1.000000000000000,0.722222222222222],
            [0.341269841269841,1.000000000000000,0.658730158730159],
            [0.404761904761905,1.000000000000000,0.595238095238095],
            [0.468253968253968,1.000000000000000,0.531746031746032],
            [0.531746031746032,1.000000000000000,0.468253968253968],
            [0.595238095238095,1.000000000000000,0.404761904761905],
            [0.658730158730159,1.000000000000000,0.341269841269841],
            [0.722222222222222,1.000000000000000,0.277777777777778],
            [0.785714285714286,1.000000000000000,0.214285714285714],
            [0.849206349206349,1.000000000000000,0.150793650793651],
            [0.912698412698413,1.000000000000000,0.087301587301587],
            [0.976190476190476,1.000000000000000,0.023809523809524],
            [1.000000000000000,0.960317460317460,0.000000000000000],
            [1.000000000000000,0.896825396825397,0.000000000000000],
            [1.000000000000000,0.833333333333333,0.000000000000000],
            [1.000000000000000,0.769841269841270,0.000000000000000],
            [1.000000000000000,0.706349206349207,0.000000000000000],
            [1.000000000000000,0.642857142857143,0.000000000000000],
            [1.000000000000000,0.579365079365080,0.000000000000000],
            [1.000000000000000,0.515873015873016,0.000000000000000],
            [1.000000000000000,0.452380952380953,0.000000000000000],
            [1.000000000000000,0.388888888888889,0.000000000000000],
            [1.000000000000000,0.325396825396826,0.000000000000000],
            [1.000000000000000,0.261904761904762,0.000000000000000],
            [1.000000000000000,0.198412698412699,0.000000000000000],
            [1.000000000000000,0.134920634920635,0.000000000000000],
            [1.000000000000000,0.071428571428572,0.000000000000000],
            [1.000000000000000,0.007936507936508,0.000000000000000],
            [0.944444444444445,0.000000000000000,0.000000000000000],
            [0.880952380952381,0.000000000000000,0.000000000000000],
            [0.817460317460318,0.000000000000000,0.000000000000000],
            [0.753968253968254,0.000000000000000,0.000000000000000],
            [0.690476190476191,0.000000000000000,0.000000000000000],
            [0.626984126984127,0.000000000000000,0.000000000000000],
            [0.563492063492064,0.000000000000000,0.000000000000000],
            [0.500000000000000,0.000000000000000,0.000000000000000]
        ],

        /*
          julia code:
          using Printf, ColorSchemes
          A = [@printf("[%1.8f,%1.8f,%1.8f],\n",a.r,a.g,a.b) for a in get.(Ref(ColorSchemes.turbo), LinRange(0,1,64))];

         */
        'turbo': [
            [0.18995000,0.07176000,0.23217000],
            [0.20880524,0.11856524,0.34735905],
            [0.22535714,0.16461333,0.45332381],
            [0.23960571,0.20991286,0.55008286],
            [0.25156905,0.25444619,0.63761048],
            [0.26123048,0.29823000,0.71592000],
            [0.26859143,0.34125857,0.78501714],
            [0.27365667,0.38353000,0.84489000],
            [0.27642857,0.42505048,0.89553857],
            [0.27690286,0.46580714,0.93696857],
            [0.27507762,0.50581190,0.96918286],
            [0.26986571,0.54528333,0.99125381],
            [0.25612286,0.58524857,0.99887429],
            [0.23511238,0.62545095,0.99309810],
            [0.20932667,0.66539333,0.97601667],
            [0.18123571,0.70458571,0.94971571],
            [0.15332762,0.74252714,0.91627667],
            [0.12808476,0.77870905,0.87778571],
            [0.10799286,0.81265000,0.83632714],
            [0.09552762,0.84384429,0.79398333],
            [0.09317476,0.87179714,0.75284286],
            [0.10342000,0.89600000,0.71500000],
            [0.12770762,0.91724619,0.67576000],
            [0.16419762,0.93651286,0.63022810],
            [0.21057714,0.95359429,0.58015429],
            [0.26449905,0.96827286,0.52728048],
            [0.32365762,0.98035905,0.47337571],
            [0.38570143,0.98963000,0.42018000],
            [0.44832000,0.99588333,0.36943333],
            [0.50918190,0.99890810,0.32289952],
            [0.56596429,0.99849000,0.28232571],
            [0.61633238,0.99443524,0.24946190],
            [0.65935619,0.98643524,0.22591429],
            [0.70112429,0.97407143,0.21144286],
            [0.74233381,0.95764429,0.20443333],
            [0.78239000,0.93757000,0.20327333],
            [0.82069286,0.91426714,0.20631286],
            [0.85663714,0.88815238,0.21192857],
            [0.88963238,0.85964476,0.21849333],
            [0.91905857,0.82916000,0.22437714],
            [0.94433762,0.79710667,0.22794667],
            [0.96485190,0.76391476,0.22756714],
            [0.98000000,0.73000000,0.22161000],
            [0.98994429,0.69335619,0.21026952],
            [0.99541857,0.65239667,0.19537762],
            [0.99668000,0.60815429,0.17775429],
            [0.99395762,0.56162762,0.15822571],
            [0.98749238,0.51384143,0.13760143],
            [0.97753571,0.46582857,0.11670714],
            [0.96432333,0.41858333,0.09635333],
            [0.94809762,0.37313381,0.07735857],
            [0.92909857,0.33049571,0.06054714],
            [0.90756857,0.29169000,0.04672095],
            [0.88363619,0.25723524,0.03631476],
            [0.85679571,0.22502143,0.02761857],
            [0.82693476,0.19460095,0.02028857],
            [0.79407000,0.16597000,0.01431333],
            [0.75818857,0.13914714,0.00970286],
            [0.71928667,0.11410619,0.00644714],
            [0.67738238,0.09085905,0.00455095],
            [0.63245000,0.06941143,0.00401000],
            [0.58451619,0.04975571,0.00482857],
            [0.53356333,0.03189190,0.00701810],
            [0.47960000,0.01583000,0.01055000]
        ]
    };


    mp.projection = {};

    mp.projection.Stereographic = function() {
        this.R = 1;
        this.lambda0 = 0;
        this.phi1 = 0;
    },

    // http://mathworld.wolfram.com/StereographicProjection.html
    mp.projection.Stereographic.prototype.transform = function (v) {
        var lambda = Math.PI*v[0]/180;
        var phi = Math.PI*v[1]/180;

        var k = (2*this.R)/(1+Math.sin(this.phi1)*Math.sin(phi)+Math.cos(this.phi1)*Math.cos(phi)*Math.cos(lambda-this.lambda0));

        var x = k*Math.cos(phi)*Math.sin(lambda-this.lambda0);
        var y = k*(Math.cos(this.phi1)*Math.sin(phi)-Math.sin(this.phi1)*Math.cos(phi)*Math.cos(lambda-this.lambda0));

        return [x,y,v[2],v[3]];
    },

    mp.projection.Stereographic.prototype.invtransform = function (v) {
        var x = v[0];
        var y = v[1];
        var rho = Math.sqrt(x*x + y*y);
        var c = 2 * Math.atan(rho/(2*this.R));

        // The inverse formulas for latitude phi and longitude  lambda are then given by

        var phi = Math.asin(Math.cos(c)*Math.sin(this.phi1) + y*Math.sin(c)*Math.cos(this.phi1)/rho);

        var lambda = this.lambda0 + Math.atan((x * Math.sin(c))/(rho * Math.cos(this.phi1) * Math.cos(c) - y * Math.sin(this.phi1) * Math.sin(c)));

        return [180*lambda/Math.PI,180*phi/Math.PI,v[2],v[3]];
    },

    mp.trans = {
        'mercator': {
            transform:
            function(x) {
                return [x[0]*Math.PI/180,
                        Math.log(Math.tan(Math.PI/4 + x[1]/2 * Math.PI/180)),
                        x[2],x[3]];
            },
            invtransform:
            function(x) {
                return [x[0]*180/Math.PI,
                        360*Math.atan(Math.exp(x[1]))/Math.PI - 90,
                        x[2],x[3]];
            }
        }
    };

    mp.supportsSVG = function () {
        return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1");
    };

    // clone a object
    // http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object

    mp.clone = function (obj) {
        var copy, i, attr, len;

        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" !== typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (i = 0, len = obj.length; i < len; i++) {
                copy[i] = mp.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = mp.clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
    };

    mp.peaks = function(N) {
        var i, j, x=[], y=[], z=[], f;
        N = (N === undefined ? 50 : N);

        f = function(x,y) {
            return 3*(1-x)*(1-x)*Math.exp(-x*x - (y+1)*(y+1)) -
                10*(x/5 - x*x*x - Math.pow(y,5))*Math.exp(-x*x-y*y) -
                1/3*Math.exp(-(x+1)*(x+1) - y*y); };

        for (i=0; i < N-1; i++) {
            x[i] = [];
            y[i] = [];
            z[i] = [];

            for (j=0; j < N-1; j++) {
                x[i][j] = -3 + 6.25 * i/N;
                y[i][j] = -3 + 6.25 * j/N;
                z[i][j] = f(x[i][j],y[i][j]);
            }
        }

        return {x: x, y: y, z:z};
    };

    mp.range = function (start,end,step) {
        var i, r = [];
        step = step || 1;

        for (i=start; i<=end; i+=step) {
            r.push(i);
        }
        return r;
    };

    // Propose about n ticks for range (min,max)
    // Code taken from yapso

    mp.ticks = function ticks(min,max,n) {
        var nt, range, dt, base, sdt, t0, i, t, eps;

        // a least 2 ticks
        if (n<2) {
            n = 2;
        }

        range = max-min;
        dt = range/n;

        // transform dt in "scientific notation"
        // dt = sdt * 10^(log10(base))

        base = Math.pow(10.0,Math.floor(Math.log(dt)/Math.LN10) );
        sdt = dt/base;

        // pefered increments

        if (sdt <= 1.5) {
            sdt = 1;
        }
        else if (sdt < 2.5) {
           sdt = 2;
        }
        else if (sdt <= 4) {
           sdt = 3;
        }
        else if (sdt <= 7) {
           sdt = 5;
        }
        else {
           sdt = 10;
        }

        dt = sdt * base;

        // the first label will be:  ceil(min/dt)*dt
        // the last label will be: floor(max/dt)*dt

        t0 = Math.ceil(min/dt)*dt;

        // the difference between first and last label
        // gives the number of labels

        nt = Math.round(Math.floor(max/dt) - Math.ceil(min/dt) +1);

        t = [];

        for(i=0;i<nt;i++) {
           t[i] = t0 + i*dt;

           // attempt to remove spurious decimals
           eps = dt;
           t[i] = Math.round(t[i]/eps)*eps;

           if (Math.abs(t[i])<1e-14) {
                t[i]=0;
            }
        }

        return t;
    };

    mp.remove_spurious_decimals = function(s) {
        var re1,re2,s2,s3;

        if (typeof s === "number") {
           s = s.toString();
        }

        re1 = new RegExp("(\\.[0-9]*[1-9]+)0{4,}.*$");

        s2 = s.replace(re1,"$1");

        re2 = new RegExp("(\\.)0{4,}.*$");
        s3 = s2.replace(re2,"$1");
        return s3;
    };

    // create DOM nodes with the tag name tag and the given attributes (attribs) and children.
    // attribs: fields are attributes of the new element. Undefined fields are ignored.
    //
    //

    mp.mk = function mk(xmlns,tag,attribs,children) {
        var elem, child, a, c, style, obj, s, setAttr;

        attribs = attribs || {};
        children = children || [];

        if (xmlns === '') {
            elem = document.createElement(tag);
            setAttr = function(elem,attr,val) { elem.setAttribute(attr,val); };
        }
        else {
            elem = document.createElementNS(xmlns, tag);
            setAttr = function(elem,attr,val) { elem.setAttributeNS(null,attr,val); };
        }

        for (a in attribs) {
            if (attribs.hasOwnProperty(a) && attribs[a] !== undefined) {
                if (typeof attribs[a] === 'function') {
                    // event handler
                    elem[a] = attribs[a];
                }
                else if (a === 'style' && typeof attribs[a] === 'object') {
                    // style attribute can be a object
                    obj = attribs[a];
                    style = '';

                    for (s in obj) {
                        if (obj.hasOwnProperty(s)) {
                            // ignore style if undefined
                            if (obj[s] !== undefined) {
                                style += s + ': ' + obj[s] + ';';
                            }
                        }
                    }

                    setAttr(elem, a, style);
                }
                else {
                    setAttr(elem, a, attribs[a]);
                }
            }
        }

        for (c in children) {
            if (children.hasOwnProperty(c)) {
                if (typeof children[c] === 'string') {
                    child = document.createTextNode(children[c]);
                }
                else {
                    child = children[c];
                }

                elem.appendChild(child);
            }
        }
        return elem;
    };

    mp.html = function mk(tag,attribs,children) {
        return mp.mk('',tag,attribs,children);
    };

    mp.dasharray = function(linespec) {
        if (linespec === '-') {
            return [];
        }
        else if (linespec === '-.') {
            return [15,5,1,5];
        }
        else if (linespec === ':') {
            return [1,3];
        }
        else if (linespec === '--') {
            return [15,5];
        }
    };

    mp.SVGCanvas = function SVGCanvas(container,width,height) {
        this.xmlns = "http://www.w3.org/2000/svg";
        this.width = width;
        this.height = height;
        this.layers = [];

        this.container = container;
        this.container.appendChild(
            this.svg = this.mk('svg',{
                version: '1.1',
                baseProfile: 'basic',
                //xmlns: this.xmlns,
                width: width,
                height: height
            }));

        // some event handler will be attached to this.elem
        this.elem = this.svg;

        this.clear();
        this.idconter = 0;
    };

    mp.SVGCanvas.prototype.id = function () {
        return 'matplot_svg_canvas_' + (this.idconter++);
    };

    mp.SVGCanvas.prototype.push = function (elem) {
        this._currentLayer.groups.push(elem);
    };

    mp.SVGCanvas.prototype.pop = function () {
        return this._currentLayer.groups.pop();
    };

    mp.SVGCanvas.prototype.parent = function () {
        var g = this._currentLayer.groups;
        return g[g.length-1];
    };

    mp.SVGCanvas.prototype.mk = function mk(tag,attribs,children) {
        return mp.mk(this.xmlns,tag,attribs,children);
    };

    // create a new layer and make it current
     mp.SVGCanvas.prototype.newLayer = function() {
         var layer = {groups: [this.mk('g')]};

         this.elem.appendChild(layer.groups[0]);
         this.layers.push(layer);
         this._currentLayer = layer;
         return layer;
    };

    // remove a layer and make previous one current
     mp.SVGCanvas.prototype.removeLayer = function(layer) {
         this.elem.removeChild(layer.groups[0]);
         this.layers = this.layers.filter(function(_) {
             return _.groups !== layer.groups; });
    };

    mp.SVGCanvas.prototype.currentLayer = function(layer) {
        if (arguments.length === 0) {
            // get current layer
            return this._currentLayer;
        }
        else {
            // set current layer
            this._currentLayer = layer;
            return this._currentLayer;
        }
    };


    mp.SVGCanvas.prototype.clear = function() {
        var elem = this.svg.firstChild;

        while (elem) {
            this.svg.removeChild(elem);
            elem = this.svg.firstChild;
        }

        this.newLayer();
    };

    mp.SVGCanvas.prototype.clipRect = function(x,y,w,h,style) {
        var id = this.id(), g;

        this.parent().appendChild(
            this.mk('defs',{},[
                this.mk('clipPath',{id: id},[
                    this.mk('rect',{x: x, y:y,
                                    width: w, height: h,
                                    style: style
                                   },[])
                ])
            ]));

        this.push(g = this._group({'clip-path': 'url(#' + id + ')'}));
        return g;
    };

    mp.SVGCanvas.prototype.exitClipRect = function() {
        this.pop();
    };

    mp.SVGCanvas.prototype._group = function(style) {
        var group;
        style = style || {};

        this.parent().appendChild(
            group = this.mk('g',
                            {'clip-path': style['clip-path']}));

        return group;
    };

    mp.SVGCanvas.prototype.rect = function(x,y,width,height,style) {
        var rect;
        style = style || {};

        this.parent().appendChild(
            rect = this.mk('rect',
                           {x: x,
                            y: y,
                            width: width,
                            height: height,
                            onclick: style.onclick,
                            style: {
                                'fill': style.fill || 'none',
                                'fill-opacity': style['fill-opacity'],
                                'pointer-events': style['pointer-events'],
                                'stroke':  style.stroke || 'black'}
                           }));

        return rect;
    };


    mp.SVGCanvas.prototype.circle = function(x,y,radius,style) {
        var circle;
        style = style || {};

        this.parent().appendChild(
            circle = this.mk('circle',
                             {cx: x,
                              cy: y,
                              r: radius,
                              onclick: style.onclick,
                              style: {
                                  'fill': style.fill || 'none',
                                  'stroke':  style.stroke || 'black',
                                  'pointer-events': style['pointer-events']
                              }
                             }));

        return circle;
    };



    mp.SVGCanvas.prototype.polygon = function(x,y,style) {
        var polygon, points = '', i;

        for (i = 0; i < x.length; i++) {
            points += x[i] + ',' + y[i] + ' ';
        }

        this.parent().appendChild(
            polygon = this.mk('polygon',
                              {points: points,
                               onclick: style.onclick,
                               style: {fill: style.fill, stroke: style.stroke}
                              }
                             ));

        return polygon;
    };

    mp.SVGCanvas.prototype.textBBox = function(string,style) {
        var text, FontSize, FontFamily, bbox;

        style = style || {};
        FontSize = style.FontSize || mp.DEFAULT_FONT_SIZE;
        FontFamily = style.FontFamily || mp.DEFAULT_FONT;

        // text should not be visible
        text = this.mk('text',{'x': -10000,
                               'y': 0,
                               'style': {'font-family': FontFamily,
                                         'font-size': FontSize}},
                       [string]);

        this.parent().appendChild(text);
        bbox = text.getBBox();
        this.parent().removeChild(text);

        return {width: bbox.width, height: bbox.height};
    };

    mp.SVGCanvas.prototype.text = function(x,y,string,style) {
        var text, offseti, offsetj, FontSize, FontFamily, color, HorizontalAlignment, VerticalAlignment,
        TextAnchor, dy = 0;

        style = style || {};
        offseti = style.offseti || 0;
        offsetj = style.offsetj || 0;
        FontSize = style.FontSize || mp.DEFAULT_FONT_SIZE;
        FontFamily = style.FontFamily || mp.DEFAULT_FONT;
        color = style.color || 'black';
        HorizontalAlignment = style.HorizontalAlignment || 'left';
        VerticalAlignment = style.VerticalAlignment || 'baseline';


        //console.log('offsetj',offsetj,VerticalAlignment);
        if (HorizontalAlignment === 'left') {
            TextAnchor = 'start';
        }
        else if (HorizontalAlignment === 'center') {
            TextAnchor = 'middle';
        }
        else if (HorizontalAlignment === 'right') {
            TextAnchor = 'end';
        }
        else {
            console.error(HorizontalAlignment);
        }

        if (VerticalAlignment === 'top') {
            dy = FontSize;
            //dy = this.textBBox(string).height;
        }
        else if (VerticalAlignment === 'middle') {
            dy = FontSize/2-1.5;
            //dy = this.textBBox(string).height/2;
        }
        else if (VerticalAlignment === 'baseline') {
            dy = 0;
        }

        this.parent().appendChild(
            text = this.mk('text',
                           {'x': x+offseti,
                            'y': y+offsetj,
                            'style': {'font-family': FontFamily,
                                      'font-size': FontSize},
                            'text-anchor': TextAnchor,
                            'dy': dy,
                            'onclick': style.onclick,
                            'fill': color},
                           [string] ));
        return text;
    };


    mp.SVGCanvas.prototype.line = function(x,y,style) {
        var polyline, points = '', i, linespec, dasharray;

        linespec = style.linespec || '-';

        if (linespec === 'none') {
            return null;
        }

        if (linespec === '-') {
            dasharray = 'none';
        }
        else {
            dasharray = mp.dasharray(linespec).map(function(x) { return x.toString(); }).join();
        }

        for (i = 0; i < x.length; i++) {
            points += x[i] + ',' + y[i] + ' ';
        }

        this.parent().appendChild(
            polyline = this.mk('polyline',
                               {points: points,
                                onclick: style.onclick,
                                style: {'fill': 'none',
                                        'stroke': (style.color || 'black'),
                                        'stroke-width': (style.linewidth || 1),
                                        'stroke-dasharray': dasharray}
                               }
                              ));


        return polyline;
    };

    mp.SVGCanvas.prototype.serialize = function(callback) {
        var s, xml, blob, mimetype = 'image/svg+xml';

        s = new XMLSerializer();
        xml = s.serializeToString(this.svg);

        // Hack to work around this bug which is namespace issue
        // http://code.google.com/p/chromium/issues/detail?id=88295
        // Chrome 24
        if (xml.match(' xmlns="') === null) {
            xml = xml.replace('<svg ', '<svg xmlns="' + this.xmlns + '" ');
        }

        // no longer necessary?
        /*
        if (!document.createElement('a').hasOwnProperty('download')) {
            // if download attribute is not supported force download by using different mime-type
            // This is the case for Firefox 18
            mimetype = 'application/octet-stream';
        }
        */

		mimetype = 'application/octet-stream';
        blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>',xml],
                        {'type': mimetype});

        callback({data: blob, download: 'figure.svg'});
    };



    mp.RasterCanvas = function RasterCanvas(container,width,height) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.layers = [];

        this.container.appendChild(
            this.canvasLayers = mp.html('div', { style: {
                width: width + 'px',
                height: height + 'px'
            }}));

        // some event handler will be attached to this.elem
        this.elem = this.canvasLayers;
        this.clear();

        var that = this;
        //this.elem.addEventListener('mousedown',function(ev) {
        this.container.addEventListener('mousedown',function(ev) {
            var ev2 = {};

            ev2.x = ev.pageX - that.container.offsetLeft;
            ev2.y = ev.pageY - that.container.offsetTop;

            console.log('click pe',ev2);
            that.processEvent(ev2);
        });

    };


    mp.RasterCanvas.prototype.processEvent = function (ev) {
        var i, j, elem, elements;

        for (j = this.layers.length-1; j >= 0; j--) {
            elements = this.layers[j].interactive;

            for (i = elements.length-1; i >= 0; i--) {
                elem = elements[i];

                if (elem[0] <= ev.x && ev.x <= elem[1] &&
                    elem[2] <= ev.y && ev.y <= elem[3]) {

                    ev.target = elem;
                    // call event handler
                    elem[4](ev);
                }
            }
        }
    };

    // create a new layer and make it current
    mp.RasterCanvas.prototype.newLayer = function() {
        var layer = {}, canvas, parent;

        canvas = mp.html('canvas',{
                width: this.width,
                height: this.height,
                style: {position: 'absolute',
                        top: '0px',
                        left: '0px'
                       }
        });


        this.canvasLayers.appendChild(canvas);

         layer = {canvas: canvas,
                  context: canvas.getContext('2d'),
                  interactive:  []
                 };

         this.layers.push(layer);
         this.context = layer.context;
         this.interactive = layer.interactive;

         return layer;
    };

    // remove a layer and make previous one current
    mp.RasterCanvas.prototype.removeLayer = function(layer) {
         // make sure that this is not the current layer
         if (this.context === layer.context) {
             console.error('cannot remove current layer');
         }

         this.canvasLayers.removeChild(layer.canvas);
         this.layers = this.layers.filter(function(_) {
             return _.context !== layer.context; });
    };

    mp.RasterCanvas.prototype.currentLayer = function(layer) {
        if (arguments.length !== 0) {
            // set current layer
            this.context = layer.context;
            this.interactive = layer.interactive;
        }

        // get current layer
        return {context: this.context, interactive: this.interactive};
    };

    mp.RasterCanvas.prototype.clear = function() {
        var elem = this.canvasLayers.firstChild;

        while (elem) {
            this.canvasLayers.removeChild(elem);
            elem = this.canvasLayers.firstChild;
        }

        this.newLayer();
    };

    mp.RasterCanvas.prototype.clipRect = function(x,y,w,h,style) {
        this.context.save();
        this.context.rect(x,y,w,h);
        this.context.clip();
    };

    mp.RasterCanvas.prototype.exitClipRect = function() {
        this.context.restore();
    };


    mp.RasterCanvas.prototype.rect = function(x,y,width,height,style) {
        var rect, fill;
        style = style || {};
        fill = style.fill || 'none';

        this.context.save();

        if (fill !== 'none') {
            this.context.fillStyle = fill;
            this.context.fillRect(x,y,width,height);
        }

        this.context.beginPath();
        this.context.rect(x,y,width,height);
        this.context.lineWidth = 1;
        this.context.strokeStyle = style.stroke || 'black';
        this.context.stroke();

        this.context.restore();

        if (style.onclick) {
            this.interactive.push([x,x+width,y,y+height,style.onclick]);
        }
    };


    mp.RasterCanvas.prototype.circle = function(x,y,radius,style) {
        var circle, fill;
        style = style || {};

        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI, false);

        fill = style.fill || 'none';
        if (fill !== 'none') {
            this.context.fillStyle = fill;
            this.context.fill();
        }

        this.context.lineWidth = 1;
        this.context.strokeStyle = style.stroke || 'black';
        this.context.stroke();

        if (style.onclick) {
            this.interactive.push([x-radius/2,x+radius/2,
                                   y-radius/2,y+radius/2,style.onclick]);
        }

    };



    mp.RasterCanvas.prototype.polygon = function(x,y,style) {
        var polygon, points = '', i, fill;

        this.context.save();
        this.context.beginPath();
        this.context.moveTo(x[0], y[0]);

        for (i = 1; i < x.length; i++) {
            this.context.lineTo(x[i], y[i]);
        }

        fill = style.fill || 'none';
        this.context.lineWidth = 0;

        if (fill !== 'none') {
            this.context.fillStyle = style.fill;
            this.context.fill();
        }

        this.context.strokeStyle = style.stroke || 'black';
        this.context.stroke();
        this.context.restore();

/*
        if (style.onclick) {
            this.interactive.push([x-radius/2,x+radius/2,
                                   y-radius/2,y+radius/2,style.onclick]);

        }
*/


    };

    mp.RasterCanvas.prototype.textBBox = function(string,style) {
        var text, FontSize, FontFamily, bbox, metrics;

        style = style || {};
        FontSize = style.FontSize || mp.DEFAULT_FONT_SIZE;
        FontFamily = style.FontFamily || mp.DEFAULT_FONT;

        this.context.save();
        this.context.font = '' + FontSize + 'px ' + FontFamily;
        metrics = this.context.measureText(string);
        this.context.restore();

        return {width: metrics.width, height: FontSize};
    };

    mp.RasterCanvas.prototype.text = function(x,y,string,style) {
        var text, offseti, offsetj, FontSize, FontFamily, color, HorizontalAlignment, VerticalAlignment,
        TextAnchor, dy = 0;

        style = style || {};
        offseti = style.offseti || 0;
        offsetj = style.offsetj || 0;
        FontSize = style.FontSize || mp.DEFAULT_FONT_SIZE;
        FontFamily = style.FontFamily || mp.DEFAULT_FONT;
        color = style.color || 'black';
        HorizontalAlignment = style.HorizontalAlignment || 'left';
        VerticalAlignment = style.VerticalAlignment || 'baseline';


        this.context.save();
        this.context.textAlign = HorizontalAlignment;

        if (VerticalAlignment === 'top') {
            dy = FontSize;
            //dy = this.textBBox(string).height;
        }
        else if (VerticalAlignment === 'middle') {
            dy = FontSize/2-1.5;
            //dy = this.textBBox(string).height/2;
        }
        else if (VerticalAlignment === 'baseline') {
            dy = 0;
        }

        this.context.font = '' + FontSize + 'px ' + FontFamily;
        this.context.fillText(string, x+offseti, y+offsetj+dy);
        this.context.restore();
    };


    mp.RasterCanvas.prototype.line = function(x,y,style) {
        var i, linespec, dasharray;

        linespec = style.linespec || '-';
        this.context.save();
        this.context.beginPath();

        if (!this.context.setLineDash) {
            this.context.setLineDash = function() {};
        }

        if (linespec === 'none') {
            return;
        }

        dasharray = mp.dasharray(linespec);
        this.context.setLineDash(dasharray);
        this.context.moveTo(x[0], y[0]);

        for (i = 1; i < x.length; i++) {
            this.context.lineTo(x[i], y[i]);
        }

        this.context.lineWidth = style.linewidth || 1;
        this.context.strokeStyle = style.color || 'black';
        this.context.stroke();
        this.context.restore();

        // check on click

    };

    mp.RasterCanvas.prototype.serialize = function(callback) {
        // http://stackoverflow.com/questions/12796513/html5-canvas-to-png-file
		// would be better to return a blob as the SVG serialize function, however canvas.toBlob is not
        var offscreencanvas, context, dataURL, j;

        // merge all layers in a offscreen canvas

        offscreencanvas = mp.html('canvas',{
            width: this.width,
            height: this.height});

        context = offscreencanvas.getContext('2d');

        for (j = 0; j < this.layers.length; j++) {
            context.drawImage(this.layers[j].context.canvas, 0, 0);
        }

        if (offscreencanvas.toBlob) {
		   offscreencanvas.toBlob(function(blob) {
				callback({data: blob, download: 'figure.png'});
		   },'image/png');
		}
		else {
			dataURL = offscreencanvas.toDataURL("image/png");
			callback({dataURL: dataURL, download: 'figure.png'});
		}
    };



    mp.isArray = function(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };

    // subreference a multidimensional array arr
    // using the list of indices in parameter ind
    //
    // elements of ind can be:
    // number representing the index of arr
    // ':': all indices of the corresponding dimension
    // [start,end] a range of indices
    // [start,step,end] a range of indices
    //
    // For example:
    // A = [[1,2],[3,4]]
    // subsref(A,[0,1]) is 2 (the same as A[0][1])
    // subsref(A,[':',1]) is [2,4] (the same as [A[0][1],A[1][1]])


    mp.subsref = function subsref(arr,ind) {
        var i = ind[0], j, x, ind2;

        if (i === ':') {
            i = [0,1,arr.length-1];
        }

        if (i instanceof Array) {
            // i represents a range

            if (i.length === 2) {
                i = [i[0],1,i[1]];
            }

            // copy of ind
            ind2 = ind.slice(0);

            x = [];
            for (j = i[0]; j <= i[2]; j += i[1]) {
                ind2[0] = j;
                x.push(subsref(arr,ind2));
            }

            return x;
        }
        else {
            // i represents an index
            x = arr[i];

            if (ind.length === 1) {
                return x;
            }
            else {
                return subsref(x,ind.slice(1));
            }
        }
    };

    mp.arrayMap = function arrayMap(arr,fun) {
        var i, tmp;

        for (i = 0; i < arr.length; i++) {
            if (mp.isArray(arr[i])) {
                arrayMap(arr[i],fun);
            }
            else {
                tmp = fun(arr[i]);
                if (tmp !== undefined) {
                    arr[i] = tmp;
                }
            }
        }
    };

    // transform a multidimensional array to a flat vector
    mp.flatten = function flatten(arr) {
        var v = [];

        mp.arrayMap(arr,function(e) {
            v.push(e);
        });

        return v;
    };

    // minimum and maximum of arr
    // returns [NaN,NaN] for empty array

    mp.dataRange = function(arr) {
        var i, tmp, min = Infinity, max = -Infinity;

        mp.arrayMap(arr,function(v) {
            if (!isNaN(v)) {
                min = Math.min(min,v);
                max = Math.max(max,v);
            }
        });

        if (min === Infinity) {
            return [NaN,NaN];
        }
        else {
            return [min,max];
        }
    };

    mp.prettyRange = function (lim) {
        var min = lim[0], max = lim[1];

        if (isNaN(min) || isNaN(max)) {
            min = -1;
            max = 1;
        }

        if (min === max) {
            min = min-1;
            max = max+1;
        }
        return [min,max];
    };


    mp.Surface = function Surface(x,y,z,c,style) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.c = c;
        this.style = style || {};
    };

    mp.Surface.prototype.lim = function(what) {
        var tmp = this[what];
        return mp.dataRange(tmp);
    };

    mp.Surface.prototype.draw = function(axis) {
        var i,j;

        for (i=0; i<this.x.length-1; i++) {
            for (j=0; j<this.x[0].length-1; j++) {
                // does not work for curvilinear grid
                /*axis.rect([this.x[i][j],this.x[i+1][j]],
                  [this.y[i][j],this.y[i+1][j+1]],
                  this.c[i][j]);*/

                if (!isNaN(this.c[i][j])) {
                    axis.polygon([this.x[i][j],this.x[i+1][j],this.x[i+1][j+1],this.x[i][j+1]],
                                 [this.y[i][j],this.y[i+1][j],this.y[i+1][j+1],this.y[i][j+1]],
                                 [this.z[i][j],this.z[i+1][j],this.z[i+1][j+1],this.z[i][j+1]],
                                 this.c[i][j]);
                }
            }
        }
    };


    // Patch object

    mp.Patch = function Patch(x,y,z,style) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.c = [];
        this.style = style || {};
    };

    mp.Patch.prototype.lim = function(what) {
        var tmp = this[what];
        return mp.dataRange(tmp);
    };

    mp.Patch.prototype.draw = function(axis) {
        axis.polygon(this.x,this.y,this.z,0,this.style.color || 'black');
    };


    // Line object

    mp.Line = function Line(x,y,z,style) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.style = style || {};
    };

    mp.Line.prototype.lim = function(what) {
        var i, min, max, tmp = this[what];

        if (what === 'c') {
            return [NaN,NaN];
        }
        return mp.dataRange(tmp);
    };

    mp.Line.prototype.draw = function(axis) {
        axis.drawLine(this.x,this.y,this.z,this.style);
    };




    // Quiver object

    mp.Quiver = function Quiver(x,y,z,u,v,w,c,style) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.u = u;
        this.v = v;
        this.w = w;
        this.c = c;
        this.style = style || {};
    };

    mp.Quiver.prototype.lim = function(what) {
        var i, min, max, tmp = this[what], scale;

        if (what === 'c') {
            if (mp.isArray(tmp)) {
                return mp.dataRange(tmp);
            }

            return [NaN,NaN];
        }

        scale = (this.style.scale === undefined ? 1 : this.style.scale);

        if (what === 'x') {
            tmp = [tmp,numeric.add(tmp,mp.prod(scale,this.u))];
        }

        if (what === 'y') {
            tmp = [tmp,numeric.add(tmp,mp.prod(scale,this.v))];
        }

        if (what === 'z') {
            tmp = [tmp,numeric.add(tmp,mp.prod(scale,this.w))];
        }

        return mp.dataRange(tmp);
    };

    mp.Quiver.prototype.draw = function(axis) {
        var i,xv,yv,zv,uv,vv,scale, a, b, x,y,z, u,v,w, style, key;

        scale = (this.style.scale === undefined ? 1 : this.style.scale);
        a = (this.style.relLen === undefined ? 0.7 : this.style.relLen);
        b = (this.style.relOpen === undefined ? 0.2 : this.style.relOpen);

        // make a copy
        style = {};
        for (key in this.style) {
            if (this.style.hasOwnProperty(key)) {
                style[key] = this.style[key];
            }
        }

        for (i=0; i<this.x.length; i++) {
            x = this.x[i];
            y = this.y[i];
            z = this.z[i];
            u = scale*this.u[i];
            v = scale*this.v[i];
            w = scale*this.w[i];

            if (this.style.color === undefined) {
                if (mp.isArray(this.c)) {
                    style.color = axis.cmap.get(this.c[i]);
                }
            }


            // shaft of the arrow
            xv = [x, x+u];
            yv = [y, y+v];
            zv = [z, z+w];
            axis.drawLine(xv,yv,zv,style);

            // head of the arrow
            // ideally take aspect ratio into account
            // the arrow head parallel to the z=0 plane

            xv = [x + a*u - b*v, xv[1], x + a*u + b*v];
            yv = [y + a*v + b*u, yv[1], y + a*v - b*u];
            zv = [z + a*w      , zv[1], z + a*w      ];
            axis.drawLine(xv,yv,zv,style);
        }
    };


    // Scatter object

    mp.Scatter = function Scatter(x,y,z,size,c,style) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = size;
        this.c = c;
        this.style = style || {};
    };

    mp.Scatter.prototype.lim = function(what) {
        var tmp = this[what];
        return mp.dataRange(tmp);
    };

    mp.Scatter.prototype.draw = function(axis) {
        var i,xv,yv,zv,uv,vv,scale, a, b, x,y,z, u,v,w, style, key;

        scale = (this.style.scale === undefined ? 1 : this.style.scale);
        a = (this.style.relLen === undefined ? 0.7 : this.style.relLen);
        b = (this.style.relOpen === undefined ? 0.2 : this.style.relOpen);

        // make a copy
        style = {};
        for (key in this.style) {
            if (this.style.hasOwnProperty(key)) {
                style[key] = this.style[key];
            }
        }

        style.marker = style.marker || 'o';

        for (i=0; i<this.x.length; i++) {
            x = this.x[i];
            y = this.y[i];
            z = this.z[i];

            if (this.style.color === undefined) {
                if (mp.isArray(this.c)) {
                    style.color = axis.cmap.get(this.c[i]);
                    style.MarkerFaceColor = style.color;
                }
            }

            style.markerSize = this.size[i];

            axis.drawLine([this.x[i]],[this.y[i]],[this.z[i]],style);
        }
    };


    mp.ColorMap = function ColorMap(cLim,type) {
        this.cLim = cLim;
        this.type = type || 'turbo';
        this.cm = mp.colormaps[this.type];
    };

    mp.ColorMap.prototype.get = function (v) {
        var c=[], vs, index;
        vs = (v-this.cLim[0])/(this.cLim[1]-this.cLim[0]);
        c[0] = vs;
        c[1] = 1;
        c[2] = 1;

        index = Math.round(vs * this.cm.length);
        index = Math.max(Math.min(index,this.cm.length-1),0);
        c = this.cm[index];

        return 'rgb(' + Math.round(255*c[0]) + ',' + Math.round(255*c[1]) + ',' + Math.round(255*c[2]) + ')';
    };

    // Axis(fig,x,y,w,h)
    // create a new axes in figure fig
    // at location x,y and width w and height h
    // x,y,w,h are fraction of the total figure height and width

    mp.Axis = function Axis(fig,x,y,w,h) {
        this.fig = fig;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.cmap = new mp.ColorMap([-1,1]);
        this.FontFamily = "Verdana";
        this.FontSize = 15;
        this.color = 'black';
        this.children = [];

        this._projection = 'orthographic';

        // default properties of the x-axis
        this._xLim = [];
        this._xLimMode = 'auto';
        this.xLabel = '';
        this.xGrid = 'on';
        this.xDir = 'normal';
        this.xScale = 'linear';
        this.xMinorGrid = 'off';
        this.xMinorTick = 'off';
        this.xColor = [0,0,0];
        this.xTickLen = 10;
        this.xTickMode = 'auto';
        this.xTick = [];
        this.xTickLabelMode = 'auto';
        this.xTickLabel = [];
        this.xAxisLocation = 'bottom';
        //    this.xAxisLocation = 'top';

        this._yLim = [];
        this._yLimMode = 'auto';
        this.yLabel = '';
        this.yGrid = 'on';
        this.yDir = 'normal';
        this.yScale = 'linear';
        this.yMinorGrid = 'off';
        this.yMinorTick = 'off';
        this.yColor = [0,0,0];
        this.yTickLen = 10;
        this.yTickMode = 'auto';
        this.yTick = [];
        this.yTickLabelMode = 'auto';
        this.yTickLabel = [];
        this.yAxisLocation = 'left';
        //    this.xAxisLocation = 'right';

        this._zLim = [];
        this._zLimMode = 'auto';
        this.zLabel = '';
        this.zGrid = 'on';
        this.zDir = 'normal';
        this.zScale = 'linear';
        this.zMinorGrid = 'off';
        this.zMinorTick = 'off';
        this.zColor = [0,0,0];
        this.zTickLen = 10;
        this.zTickMode = 'auto';
        this.zTick = [];
        this.zTickLabelMode = 'auto';
        this.zTickLabel = [];

        this._cLim = [];
        this._cLimMode = 'auto';

        this._DataAspectRatioMode = 'auto';
        this._DataAspectRatio = [1,1,1];

        this._CameraPosition = [0,0,10];
        this._CameraPositionMode = 'auto';
        this._CameraTarget = [0,0,0];
        this._CameraTargetMode = 'auto';
        this._CameraUpVector = [0,1,0];
        this._CameraUpVectorMode = 'auto';
        this._CameraViewAngle = 10.3396;
        this._CameraViewAngleMode = 'auto';

        this.xLabelFormat = function(x) {return mp.remove_spurious_decimals(x.toString());};
        this.yLabelFormat = function(x) {return mp.remove_spurious_decimals(x.toString());};
        this.zLabelFormat = function(x) {return mp.remove_spurious_decimals(x.toString());};

        this.gridLineStyle = ':';
        this.legendZIndex = 1000;

        this.annotationNDigits = 3;
        this.annotationFormat = function(x) {
            var s1 = x.toString(),s2 = x.toPrecision(this.annotationNDigits);
            if (s2.length < s1.length) {
                return s2;
            }
            else {
                return s1;
            }
        };
        this.annotatedElements = [];
        this._annotations = [];

        // transformation function (direct and inverse)

        this._transform = {
            transform: function(x) { return x; },
            invtransform: function(x) { return x; }
        };

        // all rendered elements
        this.renderedElements = [];
    };

    function getterSetterMode(func,prop,mode) {
        return function (data) {
            if (arguments.length === 0) {
                // get
                if (this[mode] === 'auto') {
                    return func.call(this);
                }
                else {
                    return this[prop];
                }
            }
            else {
                // set
                this[prop] = data;
                this[mode] = 'manual';
            }

            return this;
        };
    }

    function getterSetterVal(prop,vals) {
        return function (data) {
            if (arguments.length === 0) {
                // get
                return this[prop];
            }
            else {
                // set
                if (vals.indexOf(data) === -1) {
                    throw 'Error: value of property ' + prop + ' should be one of ' +
                        vals.join(', ') + ' but got ' + data + '.';
                }
                else {
                    this[prop] = data;
                }
            }

            return this;
        };
    }

    // install getter and setter function
    // getting:
    //   obj.foo(),
    //      if obj._fooMode is 'auto', the getter will call function func to return its value
    //      if obj._fooMode is 'manual', the getter will return obs._foo
    // setter: obj.foo(val)
    //      The setter is set the property obs._foo to val and the property obs._fooMode to 'manual'
    //
    // obs.fooMode() will return the state of obj._fooMode
    // obs.fooMode(val) will set the value to obj._fooMode to 'auto' or 'manual' (no other values are permitted)

    function installGetterSetterMode (prop,func) {
        if (func === undefined) {
            func = function() { this['sensible' + prop].call(this); };
        }

        mp.Axis.prototype[prop] = getterSetterMode(func,'_' + prop,'_' + prop + 'Mode');
        mp.Axis.prototype[prop + 'Mode'] = getterSetterVal('_' + prop + 'Mode',['auto','manual']);

    }

    /*
      mp.Axis.prototype.xLim = getterSetterMode(function() { return this.lim('x'); },'_xLim','_xLimMode');
      mp.Axis.prototype.yLim = getterSetterMode(function() { return this.lim('y'); },'_yLim','_yLimMode');
      mp.Axis.prototype.zLim = getterSetterMode(function() { return this.lim('z'); },'_zLim','_zLimMode');
      mp.Axis.prototype.cLim = getterSetterMode(function() { return this.lim('c'); },'_cLim','_cLimMode');
      mp.Axis.prototype.yLimMode = getterSetterVal('_yLimMode',['auto','manual']);
      mp.Axis.prototype.zLimMode = getterSetterVal('_zLimMode',['auto','manual']);
      mp.Axis.prototype.cLimMode = getterSetterVal('_cLimMode',['auto','manual']);
    */

    mp.Axis.prototype.projection = getterSetterVal('_projection',['orthographic', 'perspective']);



    mp.Axis.prototype.xtick = getterSetterMode(function() { return this.xTick; },'xTick','xTickMode');
    mp.Axis.prototype.ytick = getterSetterMode(function() { return this.yTick; },'yTick','yTickMode');
    mp.Axis.prototype.ztick = getterSetterMode(function() { return this.zTick; },'zTick','zTickMode');

    mp.Axis.prototype.DataAspectRatio = getterSetterMode(function() { return this._DataAspectRatio; },'_DataAspectRatio','_DataAspectRatioMode');
    mp.Axis.prototype.DataAspectRatioMode = getterSetterVal('_DataAspectRatioMode',['auto','manual']);

    installGetterSetterMode('xLim',function() { return this.lim('x'); });
    installGetterSetterMode('yLim',function() { return this.lim('y'); });
    installGetterSetterMode('zLim',function() { return this.lim('z'); });
    installGetterSetterMode('cLim',function() { return this.lim('c'); });
    installGetterSetterMode('CameraPosition',function() { return this._CameraPosition; });
    installGetterSetterMode('CameraUpVector');

    // makes a product of all matrices provided as arguments
    mp.prod = function (M) {
        var i;

        for (i=1; i < arguments.length; i++) {
            M = numeric.dot(M,arguments[i]);
        }

        return M;
    };

    mp.cross = function (a,b) {
        var c = [];
        c[0] = a[1] * b[2] - a[2] * b[1];
        c[1] = a[2] * b[0] - a[0] * b[2];
        c[2] = a[0] * b[1] - a[1] * b[0];
        return c;
    };

    // http://publib.boulder.ibm.com/infocenter/pseries/v5r3/index.jsp?topic=/com.ibm.aix.opengl/doc/openglrf/gluProject.htm
    // http://publib.boulder.ibm.com/infocenter/pseries/v5r3/index.jsp?topic=/com.ibm.aix.opengl/doc/openglrf/gluPerspective.htm

    mp.perspective = function (fovy, aspect, zNear, zFar) {
        var f = 1/Math.tan(fovy/2), z = zNear-zFar;
        /*

          (     f                                  )
          |  ------   0       0            0       |
          |  aspect                                |
          |                                        |
          |                                        |
          |     0     f       0            0       |
          |                                        |
          |                                        |
          |               zFar+zNear  2*zFar*zNear |
          |     0     0   ----------  ------------ |
          |               zNear-zFar   zNear-zFar  |
          |                                        |
          |                                        |
          |     0     0      -1            0       |
          (                                        )*/


        /*    return [[ 0.638,    0,               0,                 0],
              [        0,    0.638,               0,                 0],
              [        0,    0,  1,  0],
              [        0,    0,              0,                 1]];
        */
        /*    return [[ f/aspect,    0,               0,                 0],
              [        0,    f,               0,                 0],
              [        0,    0,  (zFar+zNear)/z,  (2*zFar*zNear)/z],
              [        0,    0,              -1,                 1]];
        */


        return [[ f/aspect,    0,               0,                 0],
                [        0,    f,               0,                 0],
                [        0,    0,  (zFar+zNear)/z,  (2*zFar*zNear)/z],
                [        0,    0,              -1,                 0]];


    };

    mp.scale = function (s) {
        return [[s[0],0,0,0],
                [0,s[1],0,0],
                [0,0,s[2],0],
                [0,0,0,1]];

    };

    mp.translate = function (dx) {
        return [[1,0,0,dx[0]],
                [0,1,0,dx[1]],
                [0,0,1,dx[2]],
                [0,0,0,1]];
    };


    // http://en.wikipedia.org/wiki/Orthographic_projection_%28geometry%29
    // http://publib.boulder.ibm.com/infocenter/pseries/v5r3/index.jsp?topic=/com.ibm.aix.opengl/doc/openglrf/glOrtho.htm

    // The box is translated so that its center is at the origin, then it is scaled to the unit cube which is defined by having a minimum corner at (-1,-1,-1) and a maximum corner at (1,1,1).

    mp.ortho = function (left, right, bottom, top, near, far) {
        return numeric.dot(
            mp.scale([2/(right-left),2/(top-bottom),2/(far-near) ]),
            mp.translate([-(right+left)/2,-(top+bottom)/2,-(far+near)/2 ]));

    };


    // http://publib.boulder.ibm.com/infocenter/pseries/v5r3/index.jsp?topic=/com.ibm.aix.opengl/doc/openglrf/gluLookAt.htm
    /*
      Let E be the 3d column vector (eyeX, eyeY, eyeZ).
      Let C be the 3d column vector (centerX, centerY, centerZ).
      Let U be the 3d column vector (upX, upY, upZ).

    */

    mp.LookAt = function(E,C,U) {
        var L, S, Up, M;
        /*
          Compute L = C - E.
          Normalize L.
          Compute S = L x U.
          Normalize S.
          Compute U' = S x L.
        */

        // L vector pointing from camera to target
        L = numeric.sub(C,E);
        L = numeric.mul(1/numeric.norm2(L),L);

        // side direction to the "right" of L
        S = mp.cross(L,U);
        S = numeric.mul(1/numeric.norm2(S),S);

        // new up vector
        Up = mp.cross(S,L);

        // turn vector
        M = [[ S[0],  S[1],  S[2],  0],
             [Up[0], Up[1], Up[2],  0],
             [-L[0], -L[1], -L[2],  0],
             [0, 0, 0, 1]];

        // translate to the CameraPosition
        M = numeric.dot(M,mp.translate([-E[0], -E[1], -E[2]]));

        return M;
    };

    mp.Axis.prototype.zoom = function(delta,pageX,pageY) {
        var i,j, v, alpha;

        i = pageX - this.fig.container.offsetLeft;
        j = pageY - this.fig.container.offsetTop;

        v = this.unproject([i,j]);
        alpha = (1 + Math.abs(delta)/20);

        function newrange(lim,c) {
            var xr, xc;

            if (delta > 0) {
                xr = alpha * (lim[1]-lim[0]);
                xc = alpha * (lim[0]+lim[1])/2 + (1-alpha) * c;
            }
            else {
                xr =  (lim[1]-lim[0]) / alpha;
                xc = ((lim[0]+lim[1])/2 - (1-alpha) * c)/alpha;
            }

            //console.log('xr ',xr,[xc - xr/2,xc + xr/2]);
            return [xc - xr/2,xc + xr/2];
        }

        this.xLim(newrange(this.xLim(),v[0]));
        this.yLim(newrange(this.yLim(),v[1]));
        this.fig.draw();
    };

    mp.Axis.prototype.resetZoom = function() {
        this.xLimMode('auto');
        this.yLimMode('auto');
        this.fig.draw();
        this.fig.closeContextmenu();
    };


    mp.Axis.prototype.project = function(u,options) {
        var i,j, b, v, viewport, projectionModelView;
        options = options || {};
        viewport = options.viewport || this.viewport;
        projectionModelView = options.projectionModelView || this.projectionModelView;

        // copy array so that we do not modify u
        v = u.slice(0);
        if (v.length === 2) {
            v[2] = 0;
        }
        if (v.length === 3) {
            v[3] = 1;
        }

        v = this._transform.transform(v);


        // Apply first ModelView matrix and then Projection matrix
        v = numeric.dot(projectionModelView,v);

        // Perspective division
        // http://www.glprogramming.com/red/chapter03.html

        v[0] = v[0]/v[3];
        v[1] = v[1]/v[3];
        v[2] = v[2]/v[3];
        v[3] = v[3]/v[3];

        // viewport transformation
        v = numeric.dot(viewport,v);

        // some elements of v might be NaNs depending on the projection
        // we need to deal with it later

        if (isNaN(v[0])) {
        //    throw "Internal error";
            console.warn(u,'produced',v);
        }

        return v;
    };

    mp.Axis.prototype.unproject = function(u) {
        var i,j, b, v;
        v = [u[0],u[1],0,1];

        // inverse viewport transformation
        v = numeric.dot(this.invViewport,v);

        // inverse of ModelView matrix and then Projection matrix
        v = numeric.dot(this.invProjectionModelView,v);

        v = this._transform.invtransform(v);
        return v;
    };

    mp.Axis.prototype.lim = function(what) {
        var i, min = +Infinity, max = -Infinity, range;

        if (this.children.length > 0) {
            for (i = 0; i<this.children.length; i++) {
                range = this.children[i].lim(what);

                if (!isNaN(range[0])) {
                    min = Math.min(min,range[0]);
                }

                if (!isNaN(range[1])) {
                    max = Math.max(max,range[1]);
                }
            }
        }
        else {
            min = max = NaN;
        }

        return [min,max];
    };

    mp.Axis.prototype.transform = function(transform) {
        this._transform = transform;
    };

    mp.Axis.prototype.plot = function(x,y,z,style) {
        var i, lastArg, args;

        // get a real array for arguments
        args = Array.prototype.slice.call(arguments);
        lastArg = args[args.length-1];

        // handle the case of missing style object
        if (Object.prototype.toString.call(lastArg) === '[object Array]' ) {
            args.push({});
            mp.Axis.prototype.plot.apply(this,args);
        }

        if (args.length === 2) {
            // missing x and z
            y = args[0];
            style = args[1];
            x = [];
            z = [];

            for (i = 0; i < y.length; i++) {
                x[i] = i;
                z[i] = 0;
            }
        }
        else if (args.length === 3) {
            // missing z
            x = args[0];
            y = args[1];
            style = args[2];
            z = [];

            for (i = 0; i < x.length; i++) {
                z[i] = 0;
            }
        }

        this.children.push(new mp.Line(x,y,z,style));
    };

    mp.Axis.prototype.pcolor = function(x,y,v) {
        var i, j, z = [], tmpx, tmpy;

        if (arguments.length === 1) {
            v = x;
            x = [];
            y = [];

            x = y = [];
            for (i=0; i<v.length; i++) {
                x[i] = [];
                y[i] = [];

                for (j=0; j<v[0].length; j++) {
                    x[i][j] = i;
                    y[i][j] = j;
                }
            }
        }

        for (i=0; i<v.length; i++) {
            z[i] = [];
            for (j=0; j<v[0].length; j++) {
                z[i][j] = 0;
            }
        }

        // if x and y are vectors, make matrices
        if (!mp.isArray(x[0])) {
            tmpx = x;
            tmpy = y;

            x = [];
            y = [];
            for (i=0; i<v.length; i++) {
                x[i] = [];
                y[i] = [];

                for (j=0; j<v[0].length; j++) {
                    x[i][j] = tmpx[i];
                    y[i][j] = tmpy[j];
                }
            }
        }

        this.children.push(new mp.Surface(x,y,z,v));
    };

    mp.Axis.prototype.surf = function(x,y,z) {
        this.children.push(new mp.Surface(x,y,z,z));
    };

    mp.Axis.prototype.patch = function(x,y,z,c) {
        var i;

        if (arguments.length === 3) {
            c = z;
            z = [];
            for (i=0; i<x.length; i++) {
                z[i] = 0;
            }
        }

        this.children.push(new mp.Patch(x,y,z,c));
    };

    mp.Axis.prototype.quiver = function(x,y,u,v,style) {
        var i, z, w, color;
        style = style || {};
        x = mp.flatten(x);
        y = mp.flatten(y);
        u = mp.flatten(u);
        v = mp.flatten(v);

        z = [];
        for (i=0; i<x.length; i++) {
            z[i] = 0;
        }
        w = z;

        color = style.color; // might be undefined, if which it is not used
        if (color === 'norm') {
            // color == sqrt(u^2 + v^2 + w^2);
            color =
                numeric.sqrt(
                    numeric.add(
                        numeric.pow(u,2),
                        numeric.pow(v,2),
                        numeric.pow(w,2)));

            style.color = undefined;
        }

        this.children.push(new mp.Quiver(x,y,z,u,v,z,color,style));
    };


    mp.Axis.prototype.scatter = function(x,y,size,c,style) {
        var i, z, s;

        x = mp.flatten(x);
        y = mp.flatten(y);

        if (typeof size == 'number') {
            s = [];
            for (i=0; i<x.length; i++) {
                s[i] = size;
            }
        }
        else {
            s = mp.flatten(size);
        }

        c = mp.flatten(c);

        z = [];
        for (i=0; i<x.length; i++) {
            z[i] = 0;
        }

        this.children.push(new mp.Scatter(x,y,z,s,c,style));
    };

    mp.Axis.prototype.scatter3 = function(x,y,z,size,c,style) {
        var i, s, tCT;

        x = mp.flatten(x);
        y = mp.flatten(y);
        z = mp.flatten(z);
        c = mp.flatten(c);

        if (typeof size == 'number') {
            s = [];
            for (i=0; i<x.length; i++) {
                s[i] = size;
            }
        }
        else {
            s = mp.flatten(size);
        }


        this.children.push(new mp.Scatter(x,y,z,s,c,style));
    };

    mp.Axis.prototype.is2dim = function() {
        var _zrange = this._zrange;

        return (_zrange[0] === _zrange[1]);
    };

    mp.Axis.prototype.sensibleCameraUpVector = function() {
        if (this._projection === 'orthographic') {
            // y-direction if upward
            return [0,1,0];
        }
        // z-direction if upward
        return [0, 0, 1];
    };


    mp.Axis.prototype.setupProjection = function() {
        var i, j, k, is2D, databox, pdatabox=[], behindz=Infinity, behindind, scale, that = this, elem, lr, ul,
        v, right = -Infinity, left = Infinity,
        top = -Infinity, bottom = Infinity,
        near = Infinity, far = -Infinity,
        zNear = -10, zFar = 200;

        // real range of x, y and z variable (might be [0,0])
        // or range set by user if ?LimMode is manual
        this._xrange = this.xLim();
        this._yrange = this.yLim();
        this._zrange = this.zLim();
        this._crange = this.cLim();


        // range for plotting which is never zero in length
        this._xLim = mp.prettyRange(this._xrange);
        this._yLim = mp.prettyRange(this._yrange);
        this._zLim = mp.prettyRange(this._zrange);

        this.cmap.cLim = mp.prettyRange(this._crange);

        this.is2D = this.is2dim();

        if (this.xTickMode === 'auto') {
            this.xTick = mp.ticks(this._xLim[0],this._xLim[1],5);
        }

        if (this.xTickLabelMode === 'auto') {
            this.xTickLabel = this.xTick.map(this.xLabelFormat);
        }

        if (this.yTickMode === 'auto') {
            this.yTick = mp.ticks(this._yLim[0],this._yLim[1],5);
        }

        if (this.yTickLabelMode === 'auto') {
            this.yTickLabel = this.yTick.map(this.yLabelFormat);
        }

        if (this.zTickMode === 'auto') {
            this.zTick = mp.ticks(this._zLim[0],this._zLim[1],5);
        }

        if (this.zTickLabelMode === 'auto') {
            this.zTickLabel = this.zTick.map(this.zLabelFormat);
        }


        if (!this.is2D) {
            this._projection = 'perspective';
        }

        //console.log('this.is2D',this.is2D,this._zLim);
        // camera
        this._CameraTarget = [(this._xLim[0]+this._xLim[1])/2,
                              (this._yLim[0]+this._yLim[1])/2,
                              (this._zLim[0]+this._zLim[1])/2];

        if (this._CameraUpVectorMode === 'auto') {
            this._CameraUpVector = this.sensibleCameraUpVector();
        }

        if (this._projection === 'orthographic') {
            // y-direction if upward
            this._CameraUpVector = [0,1,0];

            if (this._DataAspectRatioMode === 'auto') {
                this._DataAspectRatio = [(this._xLim[1]-this._xLim[0])/(this.w*this.fig.canvas.width),
                                         (this._yLim[1]-this._yLim[0])/(this.h*this.fig.canvas.height),
                                         1];
            }

            this._CameraPosition = [this._CameraTarget[0],
                                    this._CameraTarget[1],
                                    this._CameraTarget[2]+1];



        }
        else {
            // need way to calculate it

            if (this._CameraPositionMode === 'auto') {
                this._CameraPosition = [-36.5257, -47.6012, 86.6025];
                //this._CameraPosition = [-27.394,  -35.701,   25.981];
                this._CameraPosition = [27.394,  35.701,   25.981];
                this._CameraPosition = [-36.5257, -47.6012, 86.6025];
            }

            this._CameraViewAngle = 10.339584907201978;


            if (this._DataAspectRatioMode === 'auto') {
                this._DataAspectRatio = [(this._xLim[1]-this._xLim[0]),
                                         (this._yLim[1]-this._yLim[0]),
                                         (this._zLim[1]-this._zLim[0])];

                // scale such that smallest element is one
                this._DataAspectRatio = numeric.div(
                    this._DataAspectRatio,
                    Math.min.apply(null, this._DataAspectRatio));

                //console.log('this._DataAspectRatio',this._DataAspectRatio);
            }
        }

        // scale vector by aspect ratio and apply transformation function
        var tr = function(x) {
            var p, xs = numeric.div(x,that._DataAspectRatio);
            p = that._transform.transform([xs[0],xs[1],xs[2],1]);
            return [p[0],p[1],p[2]];
        };

        this.modelView = numeric.dot(
            mp.LookAt(tr(this._CameraPosition),
                      tr(this._CameraTarget),
                      this._CameraUpVector),
            numeric.inv(mp.scale(this._DataAspectRatio)));
        //console.log('modelView ',numeric.prettyPrint(this.modelView));


        // should be [0,0,....] i.e. the target (transformed) should be at the center
        var tCT = tr(this._CameraTarget);
        console.log('modelView * transformed camera Target',
                    numeric.dot(this.modelView,
                                [tCT[0],tCT[1],tCT[2],1]));



        if (this._projection === 'orthographic') {
            //this.projection = mp.ortho(left, right, bottom, top, near, far);

            // scaling will be done later in viewport
            this.projection = numeric.identity(4);
        }
        else {
            this.projection = mp.perspective(this._CameraViewAngle * Math.PI/180, 1, zNear, zFar);
            //console.log('projection ',numeric.prettyPrint(this.projection));
            //console.log('Target ',this._CameraTarget);
            //console.log('MV * Target',  numeric.dot(this.modelView,[this._CameraTarget[0],this._CameraTarget[1],this._CameraTarget[2],1]));
            //console.log('MV * Target',  numeric.dot(this.modelView,[this._CameraTarget[0]-this._CameraPosition[0],this._CameraTarget[1]-this._CameraPosition[1],this._CameraTarget[2]-this._CameraPosition[2],1]));

        }

        this.projectionModelView = numeric.dot(this.projection,this.modelView);

        right = -Infinity; left = Infinity;
        top = -Infinity; bottom = Infinity;
        near = Infinity; far = -Infinity;

        databox = [];
        pdatabox = [];

        for (i = 0; i < 2; i++) {
            databox[i] = [];
            pdatabox[i] = [];

            for (j = 0; j < 2; j++) {
                databox[i][j] = [];
                pdatabox[i][j] = [];

                for (k = 0; k < 2; k++) {
                    databox[i][j][k] = [this._xLim[i],this._yLim[j],this._zLim[k],1];

                    v = this.project(databox[i][j][k],
                                     {viewport: numeric.identity(4)});

                    left = Math.min(left,v[0]);
                    right = Math.max(right,v[0]);

                    top = Math.max(top,v[1]);
                    bottom = Math.min(bottom,v[1]);

                    pdatabox[i][j][k] = v;

                    if (v[2] < behindz) {
                        behindz = v[2];
                        behindind = [i,j,k];
                    }
                }
            }
        }
        //console.log('behindz ',behindz,behindind);
        this.behindind = behindind;

        /*
          mapping that would fill all plotting space

          [left,top]  -> [this.fig.canvas.width*this.x,this.fig.canvas.height*(1-this.y-this.h)]
          [right,bottom]  -> [this.fig.canvas.width*(this.x+this.w),this.fig.canvas.height*(1-this.y)]

          intervals would be scaled this way:

          right-left -> this.fig.canvas.width*this.w
          bottom-top -> this.fig.canvas.height*this.h

          scaling factor (multiplying projected coordinates, times -1 for vertical coordinate)

          scale_x = this.fig.canvas.width*this.w / (right-left)
          scale_y = this.fig.canvas.height*this.h / (top-bottom)

          if scale_x != scale_y we would alter the aspect ratio, therefore use a unique scaling factor.
          We choose the smallest one to ensure that everything is inside the plotting space

          scale = min(scale_x,scale_y)

          if x,y projected coordinate (modelview, projection and perspective divide applied),
          screen coordinate i,j (in pixel, upper-right is 0,0) are obtained by:

          i = this.fig.canvas.width*(this.x + this.w/2) + scale*x
          j = this.fig.canvas.height*(1 - this.y - this.h/2) - scale*y

          the point [this.fig.canvas.width*(this.x + this.w/2),this.fig.canvas.height*(1 - this.y - this.h/2) ]
          is the center of the plotting area
        */

        scale = Math.min(this.fig.canvas.width*this.w / (right-left),
                         this.fig.canvas.height*this.h / (top-bottom));


        this.viewport = mp.prod(
            mp.translate([this.fig.canvas.width*(this.x + this.w/2),
                          this.fig.canvas.height*(1 - this.y - this.h/2),
                          0]),
            mp.scale([scale,-scale,1]));

        //console.log('upper left  ',[left,top,0,1],this.fig.canvas.width*this.w,right-left);
        //console.log('vp upper left  ',numeric.dot(this.viewport,[left,top,0,1]));
        //console.log('vp lower right ',numeric.dot(this.viewport,[right,bottom,0,1]));

        // inverse of this.viewport and this.projectionModelView

        this.invViewport = numeric.inv(this.viewport);
        this.invProjectionModelView = numeric.inv(this.projectionModelView);

        // define clip rectangle
        this.lr = numeric.dot(this.viewport,[right,bottom,0,1]);
        this.ul = numeric.dot(this.viewport,[left,top,0,1]);


    };

    mp.Axis.prototype.renderElements = function() {
        var i, elem;

        // add order field to rendered elements
        for (i = 0; i < this.renderedElements.length; i++) {
            this.renderedElements[i].order = i;
        }

        // sort all rendered elements depending on zIndex, then on order
        this.renderedElements.sort(function(x,y) {
            var zdiff = x.zIndex - y.zIndex;
            if (zdiff !== 0) {
                return zdiff;
            }
            else {
                return x.order - y.order;
            }
        });

        // pass all rendered elements to canvas
        for (i = 0; i < this.renderedElements.length; i++) {
            elem = this.renderedElements[i];
            elem.fun.apply(this.fig.canvas,elem.args);
        }

        this.renderedElements = [];
    };

    mp.Axis.prototype.draw = function() {
        var i, j, k, is2D, databox, pdatabox=[], behindz=Infinity, behindind, scale, that = this, lr, ul, an;

        this.setupProjection();
        this.renderedElements = [];

        console.log('project ',this.project([25.5,-0.3,0]));

        if (!this.is2D) {
            this.drawAxis(0,this.xTickLabel,this.xTickLen);
            this.drawAxis(1,this.yTickLabel,this.yTickLen);
            this.drawAxis(2,this.zTickLabel,this.zTickLen);
        }

        // set clip rectangle
        this.fig.canvas.clipRect(this.ul[0],this.ul[1],this.lr[0]-this.ul[0],this.lr[1]-this.ul[1]);

        // draw all children
        for (i = 0; i < this.children.length; i++) {
            this.children[i].draw(this);
        }

        // render first batch of elements inside the clipping region
        this.renderElements();

        // annotation
        for (i = 0; i < this._annotations.length; i++) {
            an = this._annotations[i];
            this.drawAnnotation(an.x,an.y,an.z,an.text,an.style);
        }

        // exit clip rectangle
        this.fig.canvas.exitClipRect();

        /*
          this.fig.canvas.rect(
          this.fig.canvas.width*this.x,
          this.fig.canvas.height*this.y,
          this.fig.canvas.width*this.w,
          this.fig.canvas.height*this.h,
          {fill: 'none', stroke: 'blue', 'pointer-events': 'visible'});
        */

        if (this.is2D) {
            this.drawAxis(0,this.xTickLabel,this.xTickLen,
                          {position: this.xAxisLocation, box: true});
            this.drawAxis(1,this.yTickLabel,this.yTickLen,
                          {position: this.yAxisLocation, box: true});
        }

        // legend
        if (this._legend) {
            this.drawLegend();
        }

        // render second batch of elements outside the clipping region
        this.renderElements();
    };


    mp.Axis.prototype.drawAxis = function(sv,tickLabel,tickLen,options) {
        var dist2 = Infinity, tmp, axind, p1, p2, style, i, j, k, v=1, ref,
        behindind = this.behindind, save_project,
        bbox = [this._xLim,this._yLim,this._zLim];

        function mod(x,n) {
            return ((x%n)+n)%n;
        }

        function cshift(v,n) {
            n = mod(n,v.length);

            if (n === 0) {
                return v;
            }
            if (n === 1) {
                return [v[1],v[2],v[0]];
            }
            else {
                return cshift(cshift(v,1),n-1);
            }
        }

        ref = cshift([this._xLim, this._yLim, this._zLim],sv);
        this._xLim = ref[0];
        this._yLim = ref[1];
        this._zLim = ref[2];

        ref = cshift([this.xTick, this.yTick, this.zTick],sv);
        this.xTick = ref[0];
        this.yTick = ref[1];
        this.zTick = ref[2];


        save_project = this.project;

        this.behindind = cshift(this.behindind,sv);
        this.project = function(v,opt) {
            return save_project.call(this,cshift(v,-sv),opt);
        };

        this.drawAxisX(tickLabel,tickLen,options);

        // restore
        this.project = save_project;
        this.behindind = cshift(this.behindind,-sv);


        ref = cshift([this._xLim, this._yLim, this._zLim],-sv);
        this._xLim = ref[0];
        this._yLim = ref[1];
        this._zLim = ref[2];

        ref = cshift([this.xTick, this.yTick, this.zTick],-sv);
        this.xTick = ref[0];
        this.yTick = ref[1];
        this.zTick = ref[2];
    };


    //-------------



    mp.Axis.prototype.drawAxisX = function(tickLabel,tickLen,options) {
        var dist2 = Infinity, tmp, axind, p1, p2, p2y, p2z, style, i, j, k, v,
          dx, dy, dz, numy, numz,
          ticksRefDir, position, box, behindind = this.behindind;

        options = options || {};
        // reference direction based on which we choose were to put
        // the axis. A good location of an axis would be an axis whose middel point
        // has a low projection with the direction ticksRefDir
        // I.e. if ticksRefDir = [1,1] then the lower-left would be good.

        ticksRefDir = options.ticksRefDir || [1,1];
        box = (options.box !== undefined ? options.box : false);
        position = options.position;

        if (position === 'bottom') {
            ticksRefDir = [0,1];
        }
        else if (position === 'top') {
            ticksRefDir = [0,-1];
        }
        else if (position === 'right') {
            ticksRefDir = [-1,0];
        }
        else if (position === 'left') {
            ticksRefDir = [1,0];
        }

        // draw grid lines
        k = behindind[2];
        for (j = 0; j < this.yTick.length; j++) {
            this.drawLine(this._xLim,
                          [this.yTick[j],this.yTick[j]],
                          [this._zLim[k],this._zLim[k]],
                          {linespec: this.gridLineStyle});
        }

        // these lines might be overdraw by a solid line (if box is true)
        j = behindind[1];
        for (k = 0; k < this.zTick.length; k++) {
            this.drawLine(this._xLim,
                          [this._yLim[j],this._yLim[j]],
                          [this.zTick[k],this.zTick[k]],
                          {linespec: this.gridLineStyle});
        }


        for (j = 0; j < 2; j++) {
            for (k = 0; k < 2; k++) {
                // emulate x-or
                if ( (behindind[1] === j) !== (behindind[2] === k) ) {
                    // from the two possible locations choose the one
                    // which are closest to the lower right corner

                    // project start and end point of axis
                    p1 = this.project([this._xLim[0],this._yLim[j],this._zLim[k]],
                                      {viewport: numeric.identity(4)});

                    p2 = this.project([this._xLim[1],this._yLim[j],this._zLim[k]],
                                      {viewport: numeric.identity(4)});

                    // middle point
                    v = [(p1[0]+p2[0])/2,(p1[1]+p2[1])/2];

                    // distance along reference direction
                    tmp = v[0] * ticksRefDir[0] + v[1] * ticksRefDir[1];

                    if (tmp < dist2) {
                        dist2 = tmp;
                        axind = [j,k];

                        // determine if axis is mostly horizontal or vertical
                        // for the position of the tick labels
                        if (Math.abs(p2[0]-p1[0]) > Math.abs(p2[1]-p1[1])) {
                            style = {HorizontalAlignment: 'center',
                                     VerticalAlignment: (ticksRefDir[1] > 0 ? 'top' : 'bottom')};
                        }
                        else {
                            style = {HorizontalAlignment: (ticksRefDir[0] > 0 ? 'right' : 'left'),
                                     VerticalAlignment: 'middle'};
                        }
                    }
                }
            }
        }

        if (box) {
            for (j = 0; j < 2; j++) {
                for (k = 0; k < 2; k++) {
                    this.drawLine(this._xLim,[this._yLim[j],this._yLim[j]],[this._zLim[k],this._zLim[k]]);
                }
            }
        }
        else {
            // x-axis
            j = axind[0];
            k = axind[1];

            this.drawLine(this._xLim,[this._yLim[j],this._yLim[j]],[this._zLim[k],this._zLim[k]]);
        }

        j = axind[0];
        k = axind[1];

        for (i = 0; i < this.xTick.length; i++) {
            // in which orientation show we draw the tick-lines?
            // tick-lines should be in the same plane at the point
            // databox[behindind[0],behindind[1],behindind[2]]
            // unless this is not possible (zero gradient of projection)

            p1 = this.project([this.xTick[i],this._yLim[j],this._zLim[k]]);
            p2y = this.project([this.xTick[i],this._yLim[j]+1,this._zLim[k]]);
            numy = Math.pow(p2y[0]-p1[0],2) + Math.pow(p2y[1]-p1[1],2);

            p2z = this.project([this.xTick[i],this._yLim[j],this._zLim[k]+1]);
            numz = Math.pow(p2z[0]-p1[0],2) + Math.pow(p2z[1]-p1[1],2);

            if (numy > 0 && (j !== behindind[1] || (numz === 0))) {
                // in y-direction
                // determine tick length (unprojected)

                dy = tickLen/(2*Math.sqrt(numy));

                this.drawLine([this.xTick[i],this.xTick[i]],
                              [this._yLim[j]-dy,this._yLim[j]+dy],
                              [this._zLim[k],this._zLim[k]]);

                this.text(this.xTick[i],
                          this._yLim[j] + (j === 0 ? -1 : 1) * 2*dy,
                          this._zLim[k],
                          tickLabel[i],style);
            }
            else if (numz > 0) {
                // in z-direction


                dz = tickLen/(2*Math.sqrt(numz));

                this.drawLine([this.xTick[i],this.xTick[i]],
                              [this._yLim[j],this._yLim[j]],
                              [this._zLim[k]-dz,this._zLim[k]+dz]);

                this.text(this.xTick[i],
                          this._yLim[j],
                          this._zLim[k] + (k === 0 ? -1 : 1)* 2 * dz,
                          tickLabel[i],
                          style);
            }
            else {
                console.warn('Cannot determine orientation of ticks');
            }
        }
    };


    mp.Axis.prototype.legend = function(state) {
        state = (state !== undefined ? state : true);
        this._legend = state;
    };

    mp.Axis.prototype.drawLegend = function() {
        var style, label, maxWidth = -Infinity, maxHeight=-Infinity,
            maxMarkerSize=0, bbox, x, y, n=0, i, w, h,
            margin = 10, padding = 7, lineSpace = 1, iconWidth = 25, iconSep = 5,
        legendWidth, legendHeight;


        for (i = 0; i<this.children.length; i++) {
            style = this.children[i].style;
            label = style.label;

            if (label !== undefined && label !== '') {
                bbox = this.fig.canvas.textBBox(label);
                maxWidth = Math.max(maxWidth,bbox.width);
                maxHeight = Math.max(maxHeight,bbox.height);

                if (style.markerSize !== undefined) {
                    maxMarkerSize = Math.max(maxMarkerSize,style.markerSize);
                }

                n = n+1;
            }

        }

        // position top right
        legendWidth = maxWidth + 2*padding + iconWidth + iconSep + 2*maxMarkerSize;
        legendHeight = n*(maxHeight+lineSpace) + 2*padding;

        x = this.fig.canvas.width*(this.x+this.w) - margin - legendWidth;
        y = this.fig.canvas.height*(1-this.y-this.h) + margin;
        this.fig.canvas.rect(x,y,legendWidth,legendHeight,
                             {fill: 'white',stroke: 'black'});

        x = x + padding;
        y = y + padding + maxHeight/2;

        for (i = 0; i<this.children.length; i++) {
            style = this.children[i].style;
            label = style.label;

            if (label !== undefined && label !== '') {
                //this.fig.canvas.line([x,x + iconWidth],[y,y],style);
                this.drawProjectedLine([x + maxMarkerSize,x + maxMarkerSize + iconWidth],
                                       [y,y],
                                       [this.legendZIndex,this.legendZIndex],
                                       style);

                this.fig.canvas.text(x + 2*maxMarkerSize + iconWidth + iconSep,
                                     y,
                                     label,{VerticalAlignment: 'middle'});

                y = y+maxHeight+lineSpace;
            }
        }
    };

    mp.Axis.prototype.rect = function(x,y,v) {
        var color, ll, up;

        ll = this.project([x[0],y[1]]);
        up = this.project([x[1],y[0]]);

        if (typeof v === 'string') {
            color = v;
        }
        else {
            color = this.cmap.get(v);
        }

        this.fig.canvas.rect(ll[0],ll[1],
                             up[0] - ll[0],up[1] - ll[1],
                             {fill: color,stroke: color});
    };


    mp.Axis.prototype.text = function(x,y,z,string,style) {
        var pos;

        pos = this.project([x,y,z]);

        /*    this.renderedElements.push(
              {'zIndex': pos[2],
              'fun': this.fig.canvas.text,
              'args': [pos[0],pos[1],string,style]});
        */
        this.fig.canvas.text(pos[0],pos[1],string,style);


    };

    mp.Axis.prototype.polygon = function(x,y,z,v,color) {
        var pos, i = [], j = [], zindex = [], l, onclick, that = this;

        for (l = 0; l < x.length; l++) {
            pos = this.project([x[l],y[l],z[l]]);
            i.push(pos[0]);
            j.push(pos[1]);
            zindex.push(pos[2]);
        }
        color = color || this.cmap.get(v);

        onclick = (function (l) {
            return function (event) {
                var n = that.annotationNDigits, text, coord;

                if (that.is2dim()) {
                    coord = [x[0],y[0]];
                }
                else {
                    coord = [x[0],y[0],z[0]];
                }

                coord = coord.map(function(c) { return c.toFixed(n); });
                text = v.toFixed(n) + ' at [' + coord + ']';
                that.toggleAnnotation(event,event.target,x[0],y[0],z[0],text);
            };
        }(l));

        this.renderedElements.push(
            {'zIndex': Math.min.apply(null,zindex),
             'fun': this.fig.canvas.polygon,
             'args': [i,j,{fill: color,
                           stroke: color,
                           onclick: onclick
                          }]});
        /*
          this.fig.canvas.polygon(i,j,{fill: color,
          stroke: color,
          onclick: onclick
          });*/
    };

    mp.Axis.prototype.annotation = function(x,y,z,text,style) {
        this._annotations.push({x: x, y: y, z: z, text: text, style: style});
    };

    mp.Axis.prototype.drawAnnotation = function(x,y,z,text,style) {
        var bbox, pos, an = {}, padding = 4, i, j, that = this, w, h, layer, current;
        style = style || {};

        if (style.onclick === undefined) {
            style.onclick = function(event) {
                that.removeAnnotation(an);
            };
        }

        pos = this.project([x,y,z]);
        bbox = this.fig.canvas.textBBox(text);
        i = pos[0];
        j = pos[1];
        w = bbox.width + 2*padding;
        h = bbox.height + 2*padding;

        current = this.fig.canvas.currentLayer();
        layer = this.fig.canvas.newLayer();

        // set clip rectangle
        this.fig.canvas.clipRect(this.ul[0],this.ul[1],this.lr[0]-this.ul[0],this.lr[1]-this.ul[1]);

        an.layer = layer;

        an.rect = this.fig.canvas.rect(i,j,w,h,
                             {fill: style.fill || '#ffc',
                              onclick: style.onclick
                             });

        i += padding;
        j += padding;

        an.text = this.fig.canvas.text(i,j,text,
                             {VerticalAlignment: 'top',
                              onclick: style.onclick
                              });

        // exit clip rectangle
        this.fig.canvas.exitClipRect();

        // use the previous layer as the current one
        //this.fig.canvas.pop();
        this.fig.canvas.currentLayer(current);

        return an;
    };

    mp.Axis.prototype.removeAnnotation = function(an) {
        this.fig.canvas.removeLayer(an.layer);
    };

    mp.Axis.prototype.toggleAnnotation = function(event,elem,x,y,z,text) {
        var an, i, found = -1, that = this, coord, n = this.annotationNDigits;

        if (!text) {
            if (this.is2dim()) {
                coord = [x,y];
            }
            else {
                coord = [x,y,z];
            }

            coord = coord.map(function(c) { return that.annotationFormat(c); });


            text = '[' + coord + ']';
        }


        // search for index
        for (i = 0; i < this.annotatedElements.length; i++) {
            if (this.annotatedElements[i].elem === elem) {
                found = i;
                break;
            }
        }

        if (found !== -1) {
            // is already annotated, remove annotation
            an = this.annotatedElements[found];
            this.removeAnnotation(an);
            this.annotatedElements.splice(found,1);
        }
        else {
            // create annotation
            var onclick = function(event) {
                that.toggleAnnotation(event,elem,x,y,z,{onclick: onclick});
            };

            an = this.drawAnnotation(x,y,z,text,{onclick: onclick});
            an.elem = elem;

            this.annotatedElements.push(an);
        }
    };

    mp.Axis.prototype.drawLine = function(x,y,z,style) {
        var pos, i=[], j=[], zindex = [], l;
        style = style || {};

        for (l = 0; l < x.length; l++) {
            // check if any element is equal to NaN
            // if yes, draw the line segment so far

            if (isNaN(x[l]) || isNaN(y[l]) || isNaN(z[l])) {
                //this.drawProjectedLine(i,j,style,x,y,z);
                pos = [NaN,NaN,NaN];
            }
            else {
                pos = this.project([x[l],y[l],z[l]]);
            }

            i.push(pos[0]);
            j.push(pos[1]);
            zindex.push(pos[2]);
        }

        this.drawProjectedLine(i,j,zindex,style,x,y,z);
    };


    mp.Axis.prototype.drawProjectedLine = function(i,j,zindex,style,x,y,z) {
        var l, opt = {}, that = this, ms, is = [], js = [], zindexs = [];
        style = style || {};

        //this.fig.canvas.line(i,j,style);

        // plot line segments not interrupted by NaNs
        for (l = 0; l < i.length; l++) {
            if (isNaN(i[l]) || isNaN(j[l])) {
                if (is.length > 0) {
                    //this.fig.canvas.line(is,js,style);

                    this.renderedElements.push(
                        {'zIndex': Math.min.apply(null,zindexs),
                         'fun': this.fig.canvas.line,
                         'args': [mp.clone(is),mp.clone(js),mp.clone(style)]});


                    is = [];
                    js = [];
                    zindexs = [];
                }
            }
            else {
                is.push(i[l]);
                js.push(j[l]);
                zindexs.push(zindex[l]);
            }
        }

//        this.fig.canvas.line(is,js,style);
        this.renderedElements.push(
            {'zIndex': Math.min.apply(null,zindexs),
             'fun': this.fig.canvas.line,
             'args': [mp.clone(is),mp.clone(js),mp.clone(style)]});


        // plot makers

        for (l = 0; l < i.length; l++) {

            if (!isNaN(i[l]) && !isNaN(j[l])) {
                if (x) {
                    opt.data = [x[l],y[l]];
                    opt['pointer-events'] = 'visible';
                    opt.onclick = (function (l) {
                        return function (ev) {
                            //console.log(ev);
                            that.toggleAnnotation(ev,ev.target,x[l],y[l],z[l]);
                            //ev.stopPropagation();
                        };
                    }(l));
                }

                ms = style.markerSize || 7;

                if (style.marker === 'o') {
                    opt.fill = style.MarkerFaceColor;
                    opt.stroke = style.MarkerEdgeColor || style.color;
                    this.fig.canvas.circle(i[l],j[l],ms,opt);
                }
                else if (style.marker === 's') {
                    opt.fill = style.MarkerFaceColor;
                    opt.stroke = style.MarkerEdgeColor || style.color;
                    this.fig.canvas.rect(i[l]-ms/2,j[l]-ms/2,ms,ms,opt);
                }
            }
        }
    };




    mp.Axis.prototype.colorbar = function() {
        var cax, cmap, cLim, i, x, y, w,
        n = 64, tmp, colorbarWidth = 100, /* pixels */
        margin = 20, width = 30, labelSpace = 40;

        // relative units
        margin = margin/this.fig.canvas.width;
        width = width/this.fig.canvas.width;
        labelSpace = labelSpace/this.fig.canvas.width;

        // total width including margin and space for labels
        w = 2*margin + width + labelSpace;

        // check if there is enought space
        if (1 - this.x - this.w < w) {
            // reduce width of axis to make space
            this.w = 1 - this.x - w;
        }

        cax = this.fig.axes(1 - (margin + width + labelSpace),0.1,
                            width,0.8);

        cax.yAxisLocation = 'right';
        cax.xTickMode = 'manual';
        cax.xTick = [];

        cLim = this.cLim();

        tmp = mp.range(cLim[0],cLim[1],(cLim[1]-cLim[0])/(n-1));
        cmap = [tmp,tmp];

        x = [[],[]];
        y = [[],[]];
        for (i = 0; i < n; i++) {
            y[0][i] = cLim[0] + i * (cLim[1]-cLim[0])/(n-1);
            y[1][i] = y[0][i];

            x[0][i] = 0;
            x[1][i] = 1;
        }

        cax.pcolor(x,y,y);
        return cax;
    };



    // this class represent a figure on a screen
    // should not contain SVG specific stuff

    mp.Figure = function Figure(id,width,height,options) {
        var that = this, renderer;
        options = options || {};

        // either mp.SVGCanvas or mp.RasterCanvas
        renderer = (options.renderer !== undefined ? options.renderer : mp.SVGCanvas);

        this.container = document.getElementById(id);

        if (!mp.supportsSVG()) {
            this.container.appendChild(
                mp.mk('','div',{style: {width: width+'px', height: height+'px', border: '1px solid red', 'font-size': 'large'}},
                      [mp.mk('','div',{style: {margin: '2em'}},
                             [mp.mk('','h3',{style: {color: 'red'}},['Your web browser does not support Scalable Vector Graphics (SVG).']),
                              mp.mk('','p',{},['Old versions of Internet Explorer (version 8 and before) do unfortunately not understand the SVG standard.']),
                              'To see the graphics on this web-page you either need to upgrade your version of Internet Explorer (to version 9 or later) ',
                              'or install a more standard compilant browser such as ',
                              mp.mk('','a',{href: 'http://www.mozilla.org/'},['Mozilla Firefox']), ' or ',
                              mp.mk('','a',{href: 'http://www.google.com/chrome/'},['Google Chrome']), '.'])]));


            throw 'Error: SVG support is not detected';
        }

        this.outerDIV =
            mp.html('div',
                    {style: {
                        'position': 'relative',
                        'user-select': 'none',
                        '-webkit-user-select': 'none'
                    }}
                   );

        this.outerDIV.appendChild(
            this.zoomrect = mp.html('div',{
                'class': 'matplot-zoomrect',
                'style': {
                    'position': 'absolute',
                    'display': 'none',
                    'width': '0px',
                    'height': '0px',
                    'border': '1px solid black',
                    'left': '0px',
                    'top': '0px'}}));

        // choose back-end
        this.canvas = new renderer(this.outerDIV,width,height);

        this.outerDIV.appendChild(
            this.contextmenu = mp.html('div',{
                'class': 'matplot-contextmenu',
                'style': {
                    'position': 'absolute',
                    'display': 'none',
                    'left': '0px',
                    'top': '0px'}
            },
                                       [
                                           mp.html('ul',{},[
                                               mp.html('li',{},[
                                                   mp.html('a',{'href': '#',
                                                                'onclick': function(ev) { return that.save(this); },
                                                                'download': 'figure'},
                                                           ['Download'])]),
                                               mp.html('li',{},[
                                                   mp.html('a',{'href': '#',
                                                                'onclick': function(ev) { return that.zoom(-6,ev.pageX,ev.pageY); }},
                                                           ['Zoom in'])]),
                                               mp.html('li',{},[
                                                   mp.html('a',{'href': '#',
                                                                'onclick': function(ev) { return that.zoom(6,ev.pageX,ev.pageY); }},
                                                           ['Zoom out'])]),
                                               mp.html('li',{},[
                                                   mp.html('a',{'href': '#',
                                                                'onclick': function(ev) { return that.resetZoom(); }},
                                                           ['Reset zoom'])]),
                                               mp.html('li',{'class' : 'matplot-about'},[
                                                   mp.html('a',{'href': 'https://github.com/Alexander-Barth/matplot',
                                                                'target': '_blank'},
                                                           ['About matplot'])])
                                           ])
                                       ]));




        this.container.appendChild(this.outerDIV);

        this._axes = [];


        if (this.canvas.elem) {
            window.addWheelListener(this.canvas.elem,
                                    function(ev) {
                                        if (!that.zoom(ev.deltaY,ev.pageX,ev.pageY)) {
                                            ev.preventDefault();
                                        }
                                    }
                                   );
        }

        function getcoord(ev) {
            var i,j, ax, v;
            i = ev.pageX - that.container.offsetLeft;
            j = ev.pageY - that.container.offsetTop;
            return [i,j];
        }

        function getcoordp(ev) {
            var i,j, ax, v;
            i = ev.pageX - that.container.offsetLeft;
            j = ev.pageY - that.container.offsetTop;

            ax = that._axes[0];
            v = ax.unproject([i,j]);
            console.log('getcoordp v',v);
            return [v[0],v[1]];
        }

        this.position1 = null;
        this.position2 = null;
        this.dragMode = 'panning';
        this.dragMode = 'zooming';

        this.canvas.elem.addEventListener('mousedown',function(ev) {
        //this.outerDIV.addEventListener('mousedown',function(ev) {
            var ax, p1;

            console.log('mousedown ',ev);

            // dismiss context menu if shown
            if (that.contextmenu.style.display === 'block') {
                that.contextmenu.style.display = 'none';
            }

            // check if left button is pressed
            // IE8- behaviour is different, but IE9 should be W3C conform
            // http://msdn.microsoft.com/en-us/library/ie/ff974877%28v=vs.85%29.aspx
            if (ev.button === 0) {
                that.position1 = ev;
                that.po = getcoordp(that.position1); // origin
                ax = that._axes[0];
                that.orig_xlim = ax.xLim();
                console.log('that.position1',that.position1);

                p1 = getcoord(that.position1);
                that.zoomrect.style.left = p1[0] + 'px';
                that.zoomrect.style.top = p1[1] + 'px';
                that.zoomrect.style.width = '0px';
                that.zoomrect.style.height = '0px';
            }
        });

        //this.canvas.elem.addEventListener('mouseup',function(ev) {
        this.outerDIV.addEventListener('mouseup',function(ev) {
            var p1, p2, ax;

            // remove zoom rectangle
            if (that.zoomrect.style.display === 'block') {
                that.zoomrect.style.display = 'none';
            }


            if (that.position1 !== null && that.position2 !== null) {
                p1 = getcoordp(that.position1);
                p2 = getcoordp(that.position2);

                if (that.dragMode === 'zooming') {
                    ax = that._axes[0];
                    ax.xLim([Math.min(p1[0],p2[0]),Math.max(p1[0],p2[0])]);
                    ax.yLim([Math.min(p1[1],p2[1]),Math.max(p1[1],p2[1])]);
                    that.draw();
                }
            }

            that.position1 = null;
            that.position2 = null;
        },false); // tigger event in bubbling phase (so that it might be cancled

        //this.canvas.elem.addEventListener('mousemove',function(ev) {
        this.outerDIV.addEventListener('mousemove',function(ev) {
            var p1, p2, x, y, h, w, ax, lim, r, po, xs;

            //console.log('mousemove ',ev);


            if (that.position1) {
                that.position2 = ev;

                if (that.dragMode === 'zooming') {
                    // in pixels of Canvas element
                    p1 = getcoord(that.position1);
                    p2 = getcoord(that.position2);
                    x = Math.min(p1[0],p2[0]);
                    w = Math.abs(p2[0]-p1[0]);

                    y = Math.min(p1[1],p2[1]);
                    h = Math.abs(p2[1]-p1[1]);


                    that.zoomrect.style.display = 'block';
                    that.zoomrect.style.left = x + 'px';
                    that.zoomrect.style.top = y + 'px';
                    that.zoomrect.style.width = w + 'px';
                    that.zoomrect.style.height = h + 'px';

                }
                else {
                    po = getcoordp(that.position1); // origin
                    p1 = getcoordp(ev);

                    //console.log('panning ',p1,po);
                    ax = that._axes[0];
                    lim = ax.xLim();
                    xs = (p1[0]-that.po[0]);
                    r = [that.orig_xlim[0]-xs,that.orig_xlim[1]-xs];
                    ax.xLim(r);
                    that.draw();
                }
            }
        });

        this.outerDIV.addEventListener('contextmenu',function(ev) {
        //this.canvas.elem.addEventListener('contextmenu',function(ev) {
            var i,j;
            i = ev.pageX - that.container.offsetLeft;
            j = ev.pageY - that.container.offsetTop;

            that.contextmenu.style.display = 'block';
            that.contextmenu.style.left = i + 'px';
            that.contextmenu.style.top = j + 'px';

            //console.log('context ',ev);
            ev.preventDefault();
        });

    };

    mp.Figure.prototype.closeContextmenu = function() {
        this.contextmenu.style.display = 'none';
    };

    mp.Figure.prototype.axes = function(x,y,w,h) {
        var ax;

        x = (x !== undefined ? x : 0.1);
        y = (y !== undefined ? y : 0.1);
        w = (w !== undefined ? w : 0.8);
        h = (h !== undefined ? h : 0.8);

        ax = new mp.Axis(this,x,y,w,h);
        this._axes.push(ax);
        return ax;
    };

    mp.Figure.prototype.clear = function() {
        this.canvas.clear();
    };

	mp._dataURLtoBlob = function(dataURL) {
		// see http://code.google.com/p/chromium/issues/detail?id=67587
		var parts = dataURL.match(/data:([^;]*)(;base64)?,([0-9A-Za-z+/]+)/);

		//assume base64 encoding
		var binStr = atob(parts[3]);

		//convert to binary in ArrayBuffer
		var buf = new ArrayBuffer(binStr.length);
		var view = new Uint8Array(buf);
		for (var i = 0; i < view.length; i++) {
			view[i] = binStr.charCodeAt(i);
		}

		return new Blob([view], {'type': parts[1]});
	};

    mp.Figure.prototype.save = function(elem2) {
        var fig, that = this;
        fig = this.canvas.serialize(function(fig) {
			//window.open(URL.createObjectURL(fig.data), '_blank', '');
			that.closeContextmenu();

			if (navigator.msSaveBlob) {
				// for Internet Explorer
				//window.open(fig.dataURL);

				if (fig.dataURL) {
					fig.data = mp._dataURLtoBlob(fig.dataURL);
				}

				console.log('retval ',navigator.msSaveBlob(fig.data, fig.download));
				//return false;
			}
			else {
			    var elem = document.createElement("a");

				if (typeof elem.download !== "undefined") {
					// for Firefox or Chrome
					if (fig.data) {
					   elem.href = URL.createObjectURL(fig.data);
					}
					else {
					   elem.href = fig.dataURL;
					}
					elem.download = fig.download;
					console.log('fig.data ',fig.data);

					var event = document.createEvent('MouseEvents');
					event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
					elem.dispatchEvent(event);
				}
				else {
					alert('Your browser does not support downloading. Try the Firefox, Chrome or Internet Explorer 11');
				}
				//elem.click();
				//return true;
			}
		});

		return false;
    };

    mp.Figure.prototype.resetZoom = function() {
        var ax;

        ax = this._axes[0];
        ax.xLimMode('auto');
        ax.yLimMode('auto');
        this.draw();
        this.closeContextmenu();
    };

    mp.Figure.prototype.zoom = function(delta,pageX,pageY) {
        var i, j, ri, rj, ax;
        i = pageX - this.container.offsetLeft;
        j = pageY - this.container.offsetTop;

        ri = i / this.canvas.width;
        rj = 1 - j / this.canvas.height;

        ax = this._axes[0];
        if ((ax.x <= ri && ri <= ax.x + ax.w) &&
            (ax.y <= rj && rj <= ax.y + ax.h)) {

            ax.zoom(delta,pageX,pageY);
            return false;
        }
        return true;
    };

    mp.Figure.prototype.draw = function() {
        var i;
        this.clear();

        for (i = 0; i<this._axes.length; i++) {
            this._axes[i].draw();
        }
    };

    return mp;
}());
