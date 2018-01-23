"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _d = require("d3");

var _d2 = _interopRequireDefault(_d);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _node = require("./node");

var _node2 = _interopRequireDefault(_node);

var _mapNodeLabel = require("./map-node-label");

var _mapNodeLabel2 = _interopRequireDefault(_mapNodeLabel);

var _mapLegend = require("./map-legend");

var _mapLegend2 = _interopRequireDefault(_mapLegend);

var _edgeSimple = require("./edge-simple");

var _edgeSimple2 = _interopRequireDefault(_edgeSimple);

var _edgeBidirectional = require("./edge-bidirectional");

var _edgeBidirectional2 = _interopRequireDefault(_edgeBidirectional);

var _createReactClass = require("create-react-class");

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

require("./map.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              *  Copyright (c) 2015, The Regents of the University of California,
                                                                                                                                                                                                                              *  through Lawrence Berkeley National Laboratory (subject to receipt
                                                                                                                                                                                                                              *  of any required approvals from the U.S. Dept. of Energy).
                                                                                                                                                                                                                              *  All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              *  This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                              *  LICENSE file in the root directory of this source tree.
                                                                                                                                                                                                                              */

function getElementOffset(element) {
    var de = document.documentElement;
    var box = element.getBoundingClientRect();
    var top = box.top + window.pageYOffset - de.clientTop;
    var left = box.left + window.pageXOffset - de.clientLeft;
    return { top: top, left: left };
}

exports.default = (0, _createReactClass2.default)({

    displayName: "BaseMap",

    propTypes: {
        topology: _propTypes2.default.object.isRequired,
        width: _propTypes2.default.number,
        height: _propTypes2.default.number,
        margin: _propTypes2.default.number,
        bounds: _propTypes2.default.shape({
            x1: _propTypes2.default.number,
            y1: _propTypes2.default.number,
            x2: _propTypes2.default.number,
            y2: _propTypes2.default.number
        }),
        edgeDrawingMethod: _propTypes2.default.oneOf(["simple", "bidirectionalArrow", "pathBidirectionalArrow"]),
        legendItems: _propTypes2.default.shape({
            x: _propTypes2.default.number,
            y: _propTypes2.default.number,
            edgeTypes: _propTypes2.default.object,
            nodeTypes: _propTypes2.default.object,
            colorSwatches: _propTypes2.default.object
        })
    },

    getDefaultProps: function getDefaultProps() {
        return {
            width: 800,
            height: 600,
            margin: 20,
            bounds: { x1: 0, y1: 0, x2: 1, y2: 1 },
            edgeDrawingMethod: "simple",
            legendItems: null,
            selection: { nodes: {}, edges: {} },
            paths: [],
            pathWidth: 5
        };
    },
    getInitialState: function getInitialState() {
        return {
            draging: null
        };
    },
    handleNodeMouseDown: function handleNodeMouseDown(id, e) {
        var _scale = this.scale(),
            xScale = _scale.xScale,
            yScale = _scale.yScale;

        var _getOffsetMousePositi = this.getOffsetMousePosition(e),
            x = _getOffsetMousePositi.x,
            y = _getOffsetMousePositi.y;

        var drag = {
            id: id,
            x0: xScale.invert(x),
            y0: yScale.invert(y)
        };
        this.setState({ dragging: drag });
    },
    handleSelectionChange: function handleSelectionChange(type, id) {
        if (this.props.onNodeSelected) {
            if (type === "node") {
                this.props.onNodeSelected(id);
            }
        } else if (this.props.onEdgeSelected) {
            if (type === "edge") {
                this.props.onEdgeSelected(id);
            }
        } else if (this.props.onSelectionChange) {
            this.props.onSelectionChange(type, id);
        }
    },
    handleMouseMove: function handleMouseMove(e) {
        e.preventDefault();
        if (this.state.dragging) {
            var id = this.state.dragging.id;

            var _scale2 = this.scale(),
                xScale = _scale2.xScale,
                yScale = _scale2.yScale;

            var _getOffsetMousePositi2 = this.getOffsetMousePosition(e),
                x = _getOffsetMousePositi2.x,
                y = _getOffsetMousePositi2.y;

            if (this.props.onNodeDrag) {
                this.props.onNodeDrag(id, xScale.invert(x), yScale.invert(y));
            }
        }
    },
    handleMouseUp: function handleMouseUp(e) {
        e.stopPropagation();
        this.setState({ dragging: null });
    },
    handleClick: function handleClick(e) {
        if (this.props.onNodeSelected || this.props.onEdgeSelected) {
            return;
        }
        if (this.props.onPositionSelected) {
            var _scale3 = this.scale(),
                xScale = _scale3.xScale,
                yScale = _scale3.yScale;

            var _getOffsetMousePositi3 = this.getOffsetMousePosition(e),
                x = _getOffsetMousePositi3.x,
                y = _getOffsetMousePositi3.y;

            this.props.onPositionSelected(xScale.invert(x), yScale.invert(y));
        }
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange(null);
        }
    },


    /**
     * Get the event mouse position relative to the event rect
     */
    getOffsetMousePosition: function getOffsetMousePosition(e) {
        var trackerRect = this.refs.map;
        var offset = getElementOffset(trackerRect);
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        return { x: Math.round(x), y: Math.round(y) };
    },
    scale: function scale() {
        return {
            xScale: _d2.default.scale.linear().domain([this.props.bounds.x1, this.props.bounds.x2]).range([this.props.margin, this.props.width - this.props.margin * 2]),
            yScale: _d2.default.scale.linear().domain([this.props.bounds.y1, this.props.bounds.y2]).range([this.props.margin, this.props.height - this.props.margin * 2])
        };
    },
    render: function render() {
        var _this = this;

        var _scale4 = this.scale(),
            xScale = _scale4.xScale,
            yScale = _scale4.yScale;

        var hasSelectedNode = this.props.selection.nodes.length;
        var hasSelectedEdge = this.props.selection.edges.length;

        //
        // Build a mapping of edge names to the edges themselves
        //

        var edgeMap = {};
        _underscore2.default.each(this.props.topology.edges, function (edge) {
            edgeMap[edge.source + "--" + edge.target] = edge;
            edgeMap[edge.target + "--" + edge.source] = edge;
        });

        //
        // Build a list of nodes (each a Node) from our topology
        //

        var secondarySelectedNodes = [];
        _underscore2.default.each(this.props.selection.edges, function (edgeName) {
            var edge = edgeMap[edgeName];
            if (edge) {
                secondarySelectedNodes.push(edge.source);
                secondarySelectedNodes.push(edge.target);
            }
        });

        var nodeCoordinates = {};
        var nodes = _underscore2.default.map(this.props.topology.nodes, function (node) {
            var name = node.name,
                id = node.id,
                label = node.label,
                props = _objectWithoutProperties(node, ["name", "id", "label"]);

            props.id = id || name;
            props.x = xScale(node.x);
            props.y = yScale(node.y);
            props.label = label || name;

            var nodeSelected = _underscore2.default.contains(_this.props.selection.nodes, props.id);
            var edgeSelected = _underscore2.default.contains(secondarySelectedNodes, node.name);
            props.selected = nodeSelected || edgeSelected;
            props.muted = hasSelectedNode && !props.selected || hasSelectedEdge && !props.selected;

            nodeCoordinates[node.name] = { x: props.x, y: props.y };

            return _react2.default.createElement(_node2.default, _extends({ key: props.id
            }, props, {
                onSelectionChange: function onSelectionChange(type, i) {
                    return _this.handleSelectionChange(type, i);
                },
                onMouseDown: _this.handleNodeMouseDown,
                onMouseMove: function onMouseMove(type, i, xx, yy) {
                    return _this.props.onNodeMouseMove(i, xx, yy);
                },
                onMouseUp: function onMouseUp(type, i, e) {
                    return _this.props.onNodeMouseUp(i, e);
                } }));
        });

        //
        // Build a axillary structure to help us build the paths
        //
        // For each node, we need a map of sources and destinations
        // for each path e.g. If DENV has two incoming paths, both
        // from SACR and one out going path to KANS the that would
        // be represented like this:
        //
        //      nodePathMap[DENV].targetMap[SACR] => [PATH1, PATH2]
        //                                 [KANS] => [PATH2]

        var nodePaths = {};
        _underscore2.default.each(this.props.paths, function (path) {
            var pathName = path.name;
            var pathSteps = path.steps;
            for (var i = 0; i < pathSteps.length - 1; i++) {
                var node = pathSteps[i];
                var next = pathSteps[i + 1];

                var a = void 0;
                var z = void 0;

                // We store our target based on geography, west to east etc A->Z
                if (_underscore2.default.has(nodeCoordinates, node) && _underscore2.default.has(nodeCoordinates, next)) {
                    if (nodeCoordinates[node].x < nodeCoordinates[next].x || nodeCoordinates[node].y < nodeCoordinates[next].y) {
                        a = node;z = next;
                    } else {
                        a = next;z = node;
                    }

                    if (!_underscore2.default.has(nodePaths, a)) {
                        nodePaths[a] = { targetMap: {} };
                    }

                    if (!_underscore2.default.has(nodePaths[a].targetMap, z)) {
                        nodePaths[a].targetMap[z] = [];
                    }

                    nodePaths[a].targetMap[z].push(pathName);
                } else {
                    if (!_underscore2.default.has(nodeCoordinates, node)) {
                        throw new Error("Missing node in path '" + pathName + "': " + node);
                    }
                    if (!_underscore2.default.has(nodeCoordinates, next)) {
                        throw new Error("Missing node in path '" + pathName + "': " + next);
                    }
                }
            }
        });

        //
        // For drawing path bidirectional only, we build up a map first to
        // tell us which edges are touched by a path
        //

        var edgePathMap = {};
        _underscore2.default.each(this.props.paths, function (path) {
            var pathSteps = path.steps;
            if (pathSteps.length > 1) {
                for (var i = 0; i < pathSteps.length - 1; i++) {
                    var source = pathSteps[i];
                    var destination = pathSteps[i + 1];
                    var sourceToDestinationName = source + "--" + destination;
                    var destinationToSourceName = destination + "--" + source;
                    edgePathMap[sourceToDestinationName] = path;
                    edgePathMap[destinationToSourceName] = path;
                }
            }
        });

        var edges = _underscore2.default.map(this.props.topology.edges, function (edge) {
            var selected = _underscore2.default.contains(_this.props.selection.edges, edge.name);

            if (!_underscore2.default.has(nodeCoordinates, edge.source) || !_underscore2.default.has(nodeCoordinates, edge.target)) {
                return;
            }

            // either 'simple' or 'bi-directional' edges.
            var edgeDrawingMethod = _this.props.edgeDrawingMethod;

            // either 'linear' or 'curved'
            var edgeShape = "linear";
            if (!_underscore2.default.isUndefined(edge.shape) && !_underscore2.default.isNull(edge.shape)) {
                edgeShape = edge.shape;
            }

            var curveDirection = "left";
            if (!_underscore2.default.isUndefined(edge.curveDirection) && !_underscore2.default.isNull(edge.curveDirection)) {
                curveDirection = edge.curveDirection;
            }

            var muted = hasSelectedEdge && !selected || hasSelectedNode;

            if (edgeDrawingMethod === "simple") {
                return _react2.default.createElement(_edgeSimple2.default, {
                    x1: nodeCoordinates[edge.source].x,
                    x2: nodeCoordinates[edge.target].x,
                    y1: nodeCoordinates[edge.source].y,
                    y2: nodeCoordinates[edge.target].y,
                    source: edge.source,
                    target: edge.target,
                    shape: edgeShape,
                    curveDirection: curveDirection,
                    color: edge.stroke,
                    width: edge.width,
                    classed: edge.classed,
                    key: edge.name,
                    name: edge.name,
                    selected: selected,
                    muted: muted,
                    onSelectionChange: _this.handleSelectionChange });
            } else if (edgeDrawingMethod === "bidirectionalArrow") {
                return _react2.default.createElement(_edgeBidirectional2.default, {
                    x1: nodeCoordinates[edge.source].x,
                    x2: nodeCoordinates[edge.target].x,
                    y1: nodeCoordinates[edge.source].y,
                    y2: nodeCoordinates[edge.target].y,
                    source: edge.source,
                    target: edge.target,
                    shape: edgeShape,
                    curveDirection: curveDirection,
                    offset: edge.offset,
                    sourceTargetColor: edge.sourceTargetColor,
                    targetSourceColor: edge.targetSourceColor,
                    width: edge.width,
                    classed: edge.classed,
                    key: edge.name,
                    name: edge.name,
                    selected: selected,
                    muted: muted,
                    onSelectionChange: _this.handleSelectionChange });
            } else if (edgeDrawingMethod === "pathBidirectionalArrow") {
                if (_underscore2.default.has(edgePathMap, edge.name)) {
                    return _react2.default.createElement(_edgeBidirectional2.default, {
                        x1: nodeCoordinates[edge.source].x,
                        x2: nodeCoordinates[edge.target].x,
                        y1: nodeCoordinates[edge.source].y,
                        y2: nodeCoordinates[edge.target].y,
                        source: edge.source,
                        target: edge.target,
                        shape: edgeShape,
                        curveDirection: curveDirection,
                        sourceTargetColor: edge.sourceTargetColor,
                        targetSourceColor: edge.targetSourceColor,
                        width: edge.width,
                        classed: edge.classed,
                        key: edge.name,
                        name: edge.name,
                        selected: selected,
                        muted: muted,
                        onSelectionChange: _this.handleSelectionChange });
                } else {
                    return _react2.default.createElement(_edgeSimple2.default, {
                        x1: nodeCoordinates[edge.source].x,
                        x2: nodeCoordinates[edge.target].x,
                        y1: nodeCoordinates[edge.source].y,
                        y2: nodeCoordinates[edge.target].y,
                        source: edge.source,
                        target: edge.target,
                        shape: edgeShape,
                        curveDirection: curveDirection,
                        color: edge.stroke,
                        width: 1,
                        classed: edge.classed,
                        key: edge.name,
                        name: edge.name,
                        selected: selected,
                        muted: muted,
                        onSelectionChange: _this.handleSelectionChange });
                }
            }
        });

        //
        // Build the paths
        //

        var paths = _underscore2.default.map(this.props.paths, function (path) {
            var pathName = path.name;
            var pathSteps = path.steps;
            var pathSegments = [];
            var pathColor = path.color || "steelblue";
            var pathWidth = path.width || 1;
            if (pathSteps.length > 1) {
                for (var i = 0; i < pathSteps.length - 1; i++) {
                    var a = void 0;
                    var z = void 0;
                    var dir = void 0;
                    var source = pathSteps[i];
                    var destination = pathSteps[i + 1];

                    // Get the position of path (if multiple paths run parallel)
                    if (nodeCoordinates[source].x < nodeCoordinates[destination].x || nodeCoordinates[source].y < nodeCoordinates[destination].y) {
                        a = source;z = destination;
                        dir = 1;
                    } else {
                        a = destination;z = source;
                        dir = -1;
                    }

                    var pathsToDest = nodePaths[a].targetMap[z];
                    var pathIndex = _underscore2.default.indexOf(pathsToDest, pathName);
                    var pos = (pathIndex - (pathsToDest.length - 1) / 2) * dir;

                    // Get the edge from edgeMap
                    var edgeName = source + "--" + destination;
                    var edge = edgeMap[edgeName];

                    // Get the shape of the edge (linear or curved) and if
                    // curved, get the curve direction
                    var edgeShape = "linear";
                    if (edge && !_underscore2.default.isUndefined(edge.shape) && !_underscore2.default.isNull(edge.shape)) {
                        edgeShape = edge.shape;
                    }

                    // either 'left' or 'right'
                    var curveDirection = "left";
                    if (edge && !_underscore2.default.isUndefined(edge.curveDirection) && !_underscore2.default.isNull(edge.curveDirection)) {
                        curveDirection = edge.curveDirection;
                    }

                    //
                    // Construct this path segment as a simple (i.e. line only)
                    // path piece. The width of the path is currently a prop of
                    // the map, but it would be nice to expand this to
                    // optionally be a prop of that line segement
                    //

                    if (_this.props.edgeDrawingMethod === "simple") {
                        pathSegments.push(_react2.default.createElement(_edgeSimple2.default, {
                            x1: nodeCoordinates[source].x,
                            y1: nodeCoordinates[source].y,
                            x2: nodeCoordinates[destination].x,
                            y2: nodeCoordinates[destination].y,
                            position: pos * 6,
                            source: source,
                            color: pathColor,
                            target: destination,
                            shape: edgeShape,
                            curveDirection: curveDirection,
                            width: pathWidth,
                            classed: "path-" + pathName,
                            key: pathName + "--" + edgeName,
                            name: pathName + "--" + edgeName }));
                    }
                }
            }
            return _react2.default.createElement(
                "g",
                { key: pathName },
                pathSegments
            );
        });

        //
        // Build the labels
        //

        var labels = _underscore2.default.map(this.props.topology.labels, function (label) {
            var x = xScale(label.x);
            var y = yScale(label.y);
            return _react2.default.createElement(_mapNodeLabel2.default, {
                x: x,
                y: y,
                label: label.label,
                labelPosition: label.labelPosition,
                key: label.label });
        });

        //
        // Build the legend
        //

        var legend = null;
        if (!_underscore2.default.isNull(this.props.legendItems)) {
            legend = _react2.default.createElement(_mapLegend2.default, {
                x: this.props.legendItems.x,
                y: this.props.legendItems.y,
                edgeTypes: this.props.legendItems.edgeTypes,
                nodeTypes: this.props.legendItems.nodeTypes,
                colorSwatches: this.props.legendItems.colorSwatches });
        }

        var style = void 0;
        if (this.state.dragging) {
            style = {
                cursor: "pointer"
            };
        } else if (this.props.onPositionSelected || this.props.onNodeSelected || this.props.onEdgeSelected) {
            style = {
                cursor: "crosshair"
            };
        } else {
            style = {
                cursor: "default"
            };
        }

        return _react2.default.createElement(
            "svg",
            {
                style: style,
                ref: "map",
                width: this.props.width,
                height: this.props.height,
                className: "noselect map-container",
                onClick: this.handleClick,
                onMouseMove: this.handleMouseMove,
                onMouseUp: this.handleMouseUp },
            _react2.default.createElement(
                "g",
                null,
                edges,
                paths,
                nodes,
                labels,
                legend
            )
        );
    }
});