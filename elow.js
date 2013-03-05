function Elow(tasks){
    if (!(this instanceof Elow)) {
        return new Elow(tasks);
    }

    this.tasks = tasks;
    this.keys = [];
    this.handlers = [];
    this.result = {};

    Elow.done = this._done.bind(this);

    this._init();
}

Elow.prototype = {
    do: function(type) {
        this.endCallback = arguments[(arguments.length - 1 || 1)] || function(){};
        this.workerLimit = (typeof arguments[1] === 'number') ? arguments[1] : 5;
       
        if (typeof this['_' + type] === 'function') {
            this['_' + type].call(this);
        } 
        else {
            console.log('Control Flow Type Err!!');
        }
    },

    _init: function() {
        if (Object.keys) {
            this.keys = Object.keys(this.tasks);
        }
        else {
            for (var k in this.tasks) {
                if (this.tasks.hasOwnProperty(k)) {
                    this.keys.push(k);
                }
            }
        }

        return this;
    },

    _on: function(taskName, handler) {
        if (!this.handlers[taskName]) {
            this.handlers[taskName] = [];
        }
        this.handlers[taskName].push(handler);
        
        return this;
    },

    _off: function(taskName) {
        if (this.handlers[taskName]) {
            this.handlers[taskName] = [];
        }

        return this;
    },

    _done: function(taskName) {
        for (var i = 0; i < this.handlers[taskName].length; i++) {
            this.handlers[taskName][i].call(this, arguments[1]);
        }

        return this;
    },

    _async: function(task, data) {
        var delay = Math.floor(Math.random() * 5) * 100;
        
        setTimeout(function(){
            task(data);
        }, delay);

        return this;
    },

    _finish: function() {
        this.endCallback(this.result);
        
        return this;
    },

    _check: function(factor, callback){
        if (factor) {
            callback.call(this);
        }
        else {
            this._finish();
        }

        return this;
    },

    _series: function() {
        function process(taskName){
            this._check(taskName, function(){
                this._on(taskName, function(res){
                    this.result[taskName] = res;
                    this._off(taskName);
                    process.call(this, this.keys.shift());
                }.bind(this));

                this._async(this.tasks[taskName]);
            });
        }

        process.call(this, this.keys.shift());

        return this;
    },

    _waterfall: function() {
        function process(taskName, data) {
            this._check(taskName, function(){
                this._on(taskName, function(res){
                    this.result[taskName] = res;
                    this._off(taskName);
                    process.call(this, this.keys.shift(), res);
                }.bind(this));

                this._async(this.tasks[taskName], data);
            });
        }
        
        process.call(this, this.keys.shift());

        return this;
    },

    _parallel: function() {
        this._check(this.keys.length, function(){
            var count = 0;
            
            this.keys.forEach(function(taskName){
                this._on(taskName, function(res){
                    this.result[taskName] = res;
                    this._off(taskName);
                    
                    count += 1;
                    if (count >= this.keys.length) {
                        this._finish();
                    }
                }.bind(this));

                this._async(this.tasks[taskName]);
            }, this);
        });

        return this;
    },

    _queue: function() {
        this._check(this.keys.length, function(){
            var count = 0,
                temp = this.keys.slice(0),
                workers = temp.splice(0, this.workerLimit);
           
            function process(workers) {
                workers.forEach(function(taskName){
                    this._on(taskName, function(res){
                        this.result[taskName] = res;
                        this._off(taskName);
                        
                        count += 1;
                        if (count >= this.keys.length) {
                            this._finish();
                        }

                        if (temp.length != 0) {
                            process.call(this, [temp.shift()]);
                        }
                    }.bind(this));    
        
                    this._async(this.tasks[taskName]);
                }, this);
            }
            
            process.call(this, workers);
        });
        
        return this;
    }
};