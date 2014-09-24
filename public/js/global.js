var app = angular.module('tcApp', ['yaru22.angular-timeago', 'angularFileUpload']);

app.factory('Feed', function($rootScope) {
  var PAGE_SIZE = 5;

  var Feed = function Feed(query) {
    this.query = query || {};
    this.posts = [];
    this.lastTime = 0;
    this.moreToLoad = false;
  };

  Feed.prototype.loadPosts = function() {
    var feed = this;

    var query = angular.copy(this.query);
    query.$limit = PAGE_SIZE + 1;
    query.postedTime = {$lt: this.lastTime};
    query.$sort = {postedTime: -1};

    dpd.posts.get(query, function(result) {
      if (result.length > PAGE_SIZE) {
        result.pop();
        feed.moreToLoad = true;
      } else {
        feed.moreToLoad = false;
      }
      if (result.length) feed.lastTime = result[result.length - 1].postedTime;

      Array.prototype.push.apply(feed.posts, result);

      $rootScope.$apply();
    });
  };

  Feed.prototype.refresh = function() {
    this.lastTime = new Date().getTime();
    this.posts.length = 0;
    this.loadPosts();
    this.moreToLoad = false;
  };

  return Feed;
});

app.directive('dpdMessageFor', function() {
  return function(scope, element, attrs) {
    var post = scope.$eval(attrs.dpdMessageFor);
    var message = post.message;
    var mentions = post.mentions;
    if (mentions) {
      mentions.forEach(function(m) {
        message = message.replace('@' + m, '<a href="/user.html?user=' + m + '">@' + m + '</a>');
      });
    }

    element.html(message);
  };
});

app.controller('LoginCtrl', function($scope, $rootScope) {
  $rootScope.userLoaded = false;

  function getMe() {
    dpd.users.me(function(user) {
      $rootScope.currentUser = user;
      $rootScope.userLoaded = true;
      $scope.$apply();
    });
  }
  getMe();


  $scope.showLogin = function(val) {
    $scope.loginVisible = val;
    if (val) {
      $scope.username = '';
      $scope.password = '';
    }
  };

  $scope.login = function() {
    dpd.users.login({
      username: $scope.username,
      password: $scope.password
    }, function(session, error) {
      if (error) {
        alert(error.message);
      } else {
        $scope.showLogin(false);
        getMe();

        $scope.$apply();
      }
    });
  };

  $scope.logout = function() {
    dpd.users.logout(function() {
      $rootScope.currentUser = null;
      $scope.$apply();
    });
  };

});




var MyCtrl = [ '$scope', '$http', '$timeout', '$upload', function ($scope, $http, $timeout, $upload) {
    $scope.uploadRightAway = true;

    hasUploader = function (index) {
        return $scope.upload[index] != null;
    };
    $scope.abort = function (index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };
    $scope.onFileSelect = function ($files) {
        $scope.selectedFiles = [];
        $scope.progress = [];
        if ($scope.upload && $scope.upload.length > 0) {
            for (var i = 0; i < $scope.upload.length; i++) {
                if ($scope.upload[i] != null) {
                    $scope.upload[i].abort();
                }
            }
        }
        $scope.upload = [];
        $scope.uploadResult = [];
        $scope.selectedFiles = $files;
        $scope.dataUrls = [];
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];
            if (window.FileReader && $file.type.indexOf('image') > -1) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL($files[i]);
                function setPreview(fileReader, index) {
                    fileReader.onload = function (e) {
                        $timeout(function () {
                            $scope.dataUrls[index] = e.target.result;
                        });
                    }
                }

                setPreview(fileReader, i);
            }
            $scope.progress[i] = -1;
            if ($scope.uploadRightAway) {
                $scope.start(i);
            }
        }
    }

    var subdir = 'images';
    var creator = "36c1875808f71958";
    var creatorName = "lovell";
    var message ='hello world';

    var url = '/uploads?subdir=' + subdir + '&creator=' + creator + '&creatorName=' + creatorName + '&message=' + message+ '&uniqueFilename=true';
    $scope.start = function (index) {
        $scope.progress[index] = 0;
        console.log('starting...');
        console.log($scope.myModel);
        console.log($scope.selectedFiles[index]);
        $scope.upload[index] = $upload.upload({
            url: url,
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data'},
            data: {
                title: $scope.title,
                author: $scope.author,
                description: $scope.description
            },
            file: $scope.selectedFiles[index],
            fileFormDataName: 'myFile'



        }).then(function (response) {
            console.log('response', response.data);
            $scope.item=response.data;
            $scope.uploadResult.push(response.data.result);
        }, null, function (evt) {
            $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
        });
    }
} ];
