var Dictionary = function() {
    var dictionary = {};

    this.set = function(key, value) {
        dictionary[key] = value;
    }

    this.get = function(key) {
        return dictionary[key];
    }

    this.remove = function(key) {
        dictionary[key] = undefined;
    }

    this.clear = function() {
        dictionary = {};
    }
}