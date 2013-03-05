Elow
====

An implementation of event based control flow

do方法接受两个参数, 第一个指定流程类型（series, paralle, waterfall, queue）, 第二个指定所有任务完成后的回调（同时传递结果集，该集合为JSON格式，key为任务名称）

示例:

    var tasks = {
        task1: function(){
            Elow.done('task1', 'this is 1!!'); //任务结束, 触发done事件, 第一个参数指定该任务名称, 第二个参数为执行结果 
        },
        task2: function() {
            Elow.done('task2', 'this is 2!!');
        },
        task3: function(){
            Elow.done('task3', 'this is 3!!');
        },
        task4: function(){
            Elow.done('task4', 'this is 4!!');
        },
        task5: function() {
            Elow.done('task5', 'this is 5!!');
        },
        task6: function(){
            Elow.done('task6', 'this is 6!!');
        }
    };

    //多个任务依次执行 
    Elow(tasks).do('series', function(){
        console.log('this is end callback');
    });

    //多个任务并行执行 
    Elow(tasks).do('paralle', function(){
        console.log('this is end callback');
    });

    //设置worker队列数量(省略第二个参数时，默认为5)，有新的worker可用时，后续排队的任务执行
    Elow(tasks).do('queue', 3, function(){
        console.log('this is end callback');
    });

    var tasks = [
        task1: function(){
            Elow.done('task1', 'one result!!'); 
        },
        task2: function(data) {
            Elow.done('task2', data + 'two result!!');
        },
        task3: function(data){
            Elow.done('task3', data + 'three result!!');
        }
    ];

    //瀑布流，上一个任务的结果会传给下一个任务
    Elow(tasks).do('waterfall', function(){
        console.log('this is end callback');
    });
    