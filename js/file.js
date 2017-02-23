"use strict";

function File(id, name, content){
    this._id = id;
    this._name = name;
    this._content = content;
}

File.prototype.rename = function (newName) {
    this._name = newName;
};

File.prototype.setContent = function (content) {
    this._content = content;
};

File.prototype.getContent = function () {
    return this._content;
};

File.prototype.getId = function () {
    return this._id;
};

File.prototype.getType = function () {
    return 'file';
};
