function Elow(tasks){
    if (!(this instanceof Elow)) {
        return new Elow(tasks);
    }

    this.tasks = tasks;
    this.tasksCount = tasks.length;
    
    this.number = 1; 
    this.handlers = [];
    this.result = [];

    Elow.done = this._done.bind(this);
}

Elow.prototype = {
    do: function(type){
        this.endCallback = arguments[(arguments.length - 1 || 1)] || function(){};
        
        switch(type) {
            case 'series':
                this._series(this.tasks.shift());
                break;
            case 'parallel':
                this._parallel();
                break;
            case 'waterfall':
                this._waterfall(this.tasks.shift());
                break;
            case 'queue':
                this.workerLimit = arguments[1] || 5;
                this._queue();
                break;
        }
    },

    _on: function(event, handler){
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
        
        return this;
    },

    _off: function(event){
        if (this.handlers[event]) {
            this.handlers[event] = [];
        }

        return this;
    },

    _done: function(event){
        var t = 'Task::'+ event;
        for (var i = 0; i < this.handlers[t].length; i++) {
            this.handlers[t][i].call(this, arguments[1]);
        }

        return this;
    },

    _async: function(task, data){
        var delay = Math.floor(Math.random() * 5) * 100;
        setTimeout(function(){
            task(data);
        }, delay);

        return this;
    },

    _finish: function(){
        this.endCallback(this.result);
        
        return this;
    },

    _series: function(task){
        if (task) {
            this._on('Task::' + this.number, function(res){
                this.result.push(res);
                this._off('Task::' + this.number);
                this._series(this.tasks.shift());
            }.bind(this));

            this._async(task);
            this.number += 1;
        }
        else {
            this._finish();
        }

        return this;
    },

    _parallel: function(){
        if (this.tasks.length !== 0) {
            var self = this;
            var count = 0;
            this.tasks.forEach(function(task, index){
                (function(i){
                    self._on('Task::' + self.number, function(res){
                        self.result[i-1] = res;
                        self._off('Task::' + self.number);
                        
                        count += 1;
                        if (count >= self.tasks.length) {
                            self._finish();
                        }
                    });

                    self._async(task);
                    self.number += 1;
                }(self.number))
            });
        }
        else {
            this._finish();
        }

        return this;
    },

    _waterfall: function(task, data) {
        if (task) {
            this._on('Task::' + this.number, function(res){
                this.result.push(res);
                this._off('Task::' + this.number);
                this._waterfall(this.tasks.shift(), res);
            }.bind(this));

            this._async(task, data);
            this.number += 1;
        }
        else {
            this._finish();
        }

        return this;
    },

    _queue: function(){
        if (this.tasks.length !== 0) {
            var temp = this.tasks.slice(0);
            var workers = temp.splice(0, this.workerLimit);
            var self = this;
            var count = 0;
            var loop = 0;

            
            function _process(tasks) {
                tasks.forEach(function(task, index){
                    (function(i){
                        self._on('Task::' + self.number, function(res){
                            self.result[i-1] = res;
                            self._off('Task::' + self.number);
                            count += 1;
                            if (count >= self.tasks.length) {
                                self._finish();
                            }
                        });    
                    }(self.number))

                    self._async(task);
                    self.number += 1;
                });
                loop += tasks.length;

                if (temp.length != 0) {
                    _process([temp.shift()]);
                }
            }
            
            _process(workers);
        }
        else {
            this._finish();
        }
        
        return this;
    }
};