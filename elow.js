function Elow(tasks){
    if (!(this instanceof Elow)) {
        return new Elow(tasks);
    }

    this.tasks = tasks;
    this.tasksCount = tasks.length;
    this.index = 1; 
    this.handlers = [];
    this.result = [];

    Elow.done = this._done.bind(this);
}

Elow.prototype = {
    do: function(type, callback){
        this.endCallback = callback || function(){};
        switch(type) {
            case 'series':
                this._series(this.tasks.shift());
                break;
            case 'parallel':
                this._parallel(this.tasks);
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

    _async: function(task){
        var delay = Math.floor(Math.random() * 5) * 100;
        setTimeout(function(){
            task();
        }, delay);

        return this;
    },

    _finish: function(){
        this.endCallback(this.result);
        
        return this;
    },

    _series: function(task){
        if (task) {
            this._on('Task::' + this.index, function(res){
                this.result.push(res);
                this._off('Task::' + this.index);
                this._series(this.tasks.shift());
            }.bind(this));

            this._async(task);
            this.index += 1;
        }
        else {
            this._finish();
        }

        return this;
    },

    _parallel: function(tasks){
        if (tasks.length !== 0) {
            var self = this;
            var count = 0;
            
            self.tasks.forEach(function(task, index){
                (function(index){
                    self._on('Task::' + self.index, function(res){
                        self.result.splice(index,0,res);
                        self._off('Task::' + self.index);
                        count += 1;
                        if (count >= tasks.length) {
                            self._finish();
                        }
                    });

                    self._async(task);
                    self.index += 1;
                }(index))
            });
        }
        else {
            this._finish();
        }

        return this;
    }
};