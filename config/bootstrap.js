/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var exec = require('child_process').exec;

module.exports.bootstrap = function (cb) {


    /*
    var schedule = require('node-schedule');

    var j = schedule.scheduleJob('5,10,15,20,25,30,35,40,45,50,55,60 * * * *', function(){
        console.log( 'sails run CoinExchangeImport' );
        exec('sails run CoinExchangeImport',
            function (error, stdout, stderr) {
                //console.log(stdout);
                //console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    console.log( 'sails run CoinExchangeImport complete' );
                }
            }
        );
    });


    var minutes = 5, the_interval = minutes * 60 * 1000;
    setInterval(function() {
        console.log( 'sails run CoinExchangeImport' );
        exec('sails run CoinExchangeImport',
            function (error, stdout, stderr) {
                //console.log(stdout);
                //console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    console.log( 'sails run CoinExchangeImport complete' );
                }
            }
        );
    }, the_interval);


    function importCoinExchange() {
        var minutes = 5, the_interval = minutes * 60 * 1000;
        setInterval(function() {
            console.log( 'sails run CoinExchangeImport' );
            exec('sails run CoinExchangeImport',
                function (error, stdout, stderr) {
                    //console.log(stdout);
                    //console.log(stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    } else {
                        console.log( 'sails run CoinExchangeImport complete' );
                        importCoinExchange();
                    }
                }
            );
        }, the_interval );
    }

    importCoinExchange();


    var j = schedule.scheduleJob('5 * * * *', function(){
        console.log( 'sails run CoinExchangeImport' );
        exec('sails run CoinExchangeImport',
            function (error, stdout, stderr) {
                //console.log(stdout);
                //console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    console.log( 'sails run CoinExchangeImport complete' );
                }
            }
        );
    });

    /*
    var minutes = 5, the_interval = minutes * 60 * 1000;
    setInterval(function() {
        console.log( 'sails run CoinExchangeImport' );
        exec('sails run CoinExchangeImport',
            function (error, stdout, stderr) {
                //console.log(stdout);
                //console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    console.log( 'sails run CoinExchangeImport complete' );
                }
            }
        );
    }, the_interval);

    var schedule = require('node-schedule');

    var rule = new schedule.RecurrenceRule();
    //rule.dayOfWeek = [0, new schedule.Range(0, 7)];
    //rule.hour = 0;
    rule.minute = 5;

    schedule.scheduleJob(rule, function(){
        console.log( 'sails run CoinExchangeImport' );
        exec('sails run CoinExchangeImport',
            function (error, stdout, stderr) {
                //console.log(stdout);
                //console.log(stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    console.log( 'sails run CoinExchangeImport complete' );
                }
            }
        );
    });

    /*
    var schedule = require('node-schedule');

    var rule = new schedule.RecurrenceRule();
    //rule.dayOfWeek = [0, new schedule.Range(0, 7)];
    //rule.hour = 0;
    rule.second = 2;

    var j = schedule.scheduleJob(rule, function(){
        console.log('start');

        var options = {
            url: 'http://localhost:1337/job/importcoins',
            port: 1337,
            method: 'POST'
        };

        var request = require('request');
        request.post(options, function (err, response, body) {
            if ( err ) {
                console.log(err);
                return;
            }
            var data = JSON.parse( body).data;
            console.log( 'import coins from cryptsy: ' + ( data.success ? 'Done' : 'Fail' ) );
        } );
    });
    */
  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};