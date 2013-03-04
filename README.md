Elow
====

An implementation of event based control flow

示例:
    var tasks = [
        function(){
            console.log('this is one!!');
            Elow.done(1, 'one result!!');
        },
        function() {
            console.log('this is two!!');
            Elow.done(2, 'two result!!');
        },
        function(){
            console.log('this is three!!');
            Elow.done(3, 'three result!!');
        }
    ];

    Elow(tasks).do('parallel', function(){
        console.log('this is end callback');
    });

    