"use strict";

function History(){
    this._locationStorage = [];
    this._pointer = 0;
    this._maxSize = 50;
}

History.prototype.goBack = function () {
    this._pointer--;
    return this._locationStorage[this._pointer];
};

History.prototype.goForward = function () {
    this._pointer++;
    return this._locationStorage[this._pointer];
};

History.prototype.addToHistory = function (id) {
    if (this._locationStorage[this._pointer] !== id){
        if (this._pointer < (this._locationStorage.length-1)){
            this._locationStorage.splice(this._pointer+1);
        }

        if (this._locationStorage.length >  this._maxSize) {
            this._locationStorage.shift();
            this._pointer =  this._maxSize-1;
        }
        this._locationStorage.push(id);
        this._pointer++;
    }
};

History.prototype.setLength = function(length){
    this._locationStorage.length = length;
};

History.prototype.getLength = function () {
    return this._locationStorage.length;
};

History.prototype.getPointer = function(){
    return this._pointer;
};

History.prototype.getHistory = function (index) {
    return this._locationStorage[index];
};

History.prototype.removeItemAtIndex = function (index) {
    this._locationStorage.splice(index, 1);
};

History.prototype.getMaxSize = function () {
    return this._maxSize;
};