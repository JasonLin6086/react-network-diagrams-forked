"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require("create-react-class");

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

exports.default = (0, _createReactClass2.default)({
    displayName: "map-node-label",
    render: function render() {
        var textAnchor = void 0;
        switch (this.props.labelPosition) {
            case "left":
                textAnchor = "end";
                break;
            case "top":
            case "bottom":
                textAnchor = "middle";
                break;
            default:
                textAnchor = "start";
        }

        return _react2.default.createElement(
            "text",
            {
                x: this.props.x,
                y: this.props.y,
                label: this.props.label,
                textAnchor: textAnchor,
                className: "map-label" },
            this.props.label
        );
    }
}); /**
     *  Copyright (c) 2015, The Regents of the University of California,
     *  through Lawrence Berkeley National Laboratory (subject to receipt
     *  of any required approvals from the U.S. Dept. of Energy).
     *  All rights reserved.
     *
     *  This source code is licensed under the BSD-style license found in the
     *  LICENSE file in the root directory of this source tree.
     */