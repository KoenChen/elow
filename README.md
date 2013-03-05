Elow
====

An implementation of event based control flow

do方法接受两个参数, 第一个指定流程类型（series, paralle, waterfall, queue）, 第二个指定所有任务完成后的回调（每个任务结果会依序保存在数组中）

示例:

    var tasks = [
        function(){
            console.log('this is one!!');
            Elow.done(1, 'one result!!'); //任务结束, 触发done事件, 第一个参数指定该任务在数组队列中的序列, 第二个参数为执行结果 
        },
        function() {
            console.log('this is two!!');
            Elow.done(2, 'two result!!');
        },
        function(){
            console.log('this is three!!');
            Elow.done(3, 'three result!!');
        },
        function() {
            console.log('this is four!!');
            Elow.done(4, 'four result!!');
        },
        function(){
            console.log('this is five!!');
            Elow.done(5, 'five result!!');
        }
    ];

    //多个任务依次执行 
    Elow(tasks).do('series', function(){
        console.log('this is end callback');
    });

    //多个任务并行执行 
    Elow(tasks).do('paralle', function(){
        console.log('this is end callback');
    });

    //设置worker队列数量，有新的worker可用时，后续排队的任务执行
    Elow(tasks).do('queue', 3, function(){
        console.log('this is end callback');
    });

    var tasks = [
        function(){
            Elow.done(1, 'one result!!'); //任务结束, 触发done事件, 第一个参数指定该任务在数组队列中的序列, 第二个参数为执行结果 
        },
        function(data) {
            Elow.done(2, data + 'two result!!');
        },
        function(data){
            Elow.done(3, data + 'three result!!');
        }
    ];

    //瀑布流，上一个任务的结果会传给下一个任务
    Elow(tasks).do('waterfall', function(){
        console.log('this is end callback');
    });
    