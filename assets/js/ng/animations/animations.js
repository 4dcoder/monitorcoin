var app = angular.module( 'cryptcartAnimations', [] );

app.animation('.login-register-show-hide', function() {
    return {
        beforeAddClass : function(element, className, done) {
            if(className == 'ng-hide') {
                element.css('opacity', 1);
                element.hide(500, done);
            }
            else {
                done();
            }
        },
        removeClass : function(element, className, done) {
            if(className == 'ng-hide') {
                element.css('opacity', 1);
                element.show(500, done);
            }
            else {
                done();
            }
        }
    };
});

