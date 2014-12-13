"use strict";
/*
    app.js, main Angular application script
    define your module and controllers here
*/

var ratingsUrl = 'https://api.parse.com/1/classes/comments';
var checkRating = false;

angular.module('RatingApp', ['ui.bootstrap'])
    .config(function($httpProvider) {
        //Parse required two extra headers sent with every HTTP request: X-Parse-Application-Id, X-Parse-REST-API-Key
        //the first needs to be set to your application's ID value
        //the second needs to be set to your application's REST API key
        //both of these are generated by Parse when you create your application via their web site
        //the following lines will add these as default headers so that they are sent with every
        //HTTP request we make in this application
        $httpProvider.defaults.headers.common['X-Parse-Application-Id'] = 'Eaxfl95zoQfv8deM8rkfIlHOOiOcZ4sABVfzUDpA';
        $httpProvider.defaults.headers.common['X-Parse-REST-API-Key'] = 'hRRs7VK5ZsHR4lHAQZdG43D2d0fpLo7Oqe08JK17';
    })

    .controller('reviewController', function($scope, $http) {
        $scope.max = 5; 
        $scope.hoveringOver = function(value) {
          $scope.overStar = value;
        };
    
     
        $scope.refreshComment = function() {
            $scope.loading = true;
            $http.get(ratingsUrl + '?where={"done" : false}')
                .success(function(responseData) {
                    $scope.comments = responseData.results;
                    console.log($scope.comments);
                })

                .error(function(err) {
                    console.log(err);
                    //notify the user in some way
                })

                .finally(function() {
                    $scope.loading = false;
                });
        }; // refreshComment
    
        // call to get initial tasks on page load
        $scope.refreshComment();
    

        $scope.newComment = {done : false};
    
        $scope.createComment = function() {
            if (checkRating) {
                $scope.inserting = true;
                $http.post(ratingsUrl, $scope.newComment) 
                    .success(function(responseData) {
                        $scope.newComment.objectId = responseData.objectId;
                        $scope.comments.push($scope.newComment);
                        $scope.newComment = {done: false};
                        $scope.newComment.score = 0;
                    })
                    .finally(function() {
                        $scope.inserting = false;
                        checkRating = false;
                });
            }   // else comment will not post
        }; // createComment

    
        $scope.deleteComment = function(comment) {
            comment.done = true;
            $http.delete(ratingsUrl + '/' + comment.objectId);
            var timeout;
            var delayMs = 1000;
            timeout = setTimeout(function() {
                $scope.refreshComment();
            }, delayMs);
        }; //deleteComment

        $scope.incrementVotes = function(comment, amount) {
                var postData = {
                    score: {
                        __op: "Increment",
                        amount: amount
                    }
                };
                
                $scope.updating = false;
                $http.put(ratingsUrl + '/' + comment.objectId, postData)
                    .success(function(responseData) {
                        comment.score = responseData.score;
                    })
                    .error(function(err) {
                        console.log(err);
                    })
                    .finally(function() {
                        $scope.updating = false;
                    });
                
            }; //incrementVotes

           
        $scope.hasRating = function() {
            checkRating = true;
        }
}); // end controller

