module.exports = (function() {

    var util = require('util');
    var EventEmitter = require('events').EventEmitter;
    var extend = require('extend');
    
    function Pipeline() {
        this._filters = [];
    }
    
    util.inherits(Pipeline, EventEmitter);
    
    extend(Pipeline.prototype, {
        destroy: function() {
            delete this._filters;
            
            this.removeEventListener();
        },
        filter: function(filter, context) {
            if('function' !== typeof filter) {
                throw new TypeError('filter must be a function');
            }
            
            this._filters.push({
                fn: filter,
                ctx: ('undefined' !== context ? context : null)
            });
            
            return this;
        },
        execute: function(data) {
            var filters = this._filters.slice();
            
            while(filters.length) {
                var filter = filters.shift();
                
                try {
                    data = filter.fn.call(filter.ctx, data);
                } catch(err) {
                    this.emit('error', err);
                    
                    return null;
                }
            }
            
            this.emit('end', data);
            
            return data;
        }
    });
    
    // aliases
    Pipeline.prototype.pipe = Pipeline.prototype.filter;
    Pipeline.prototype.run = Pipeline.prototype.execute;
    
    
    return Pipeline;

})();
