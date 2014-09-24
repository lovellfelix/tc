app.controller('FeedCtrl', function($scope, Feed) {

  var PAGE_SIZE = 5;

  var feed = new Feed();
  $scope.feed = feed;
    var dir = "images";
    var filename = "67ca0e3dde1105204972bbbecc942fe6.jpg";
    var creatorName = "lovell";
    var creator = "36c1875808f71958";
    var originalFilename = "filename.jpg";
    var filesize = "28370";
    var mimeType = "jpeg";
    var postTime = "1410870427013";


  $scope.submit = function(newPost) {
    dpd.posts.post({
      subdir: dir,
      message: newPost,
      creator: creator,
      creatorName: creatorName,
      filename: filename,
      originalFilename: originalFilename,
      filesize: filesize,
      postTime: postTime,
      mimeType: mimeType

    }, function(result, error) {
      if (error) {
        if (error.message) {
          alert(error.message);
        } else if (error.errors && error.errors.message) {
          alert("Message " + error.errors.message);
        } else {
          alert("An error occurred");
        }
      } else {
        feed.posts.unshift(result);
        $scope.newPost = '';
        $scope.$apply();
      }
    }); 
  };

  feed.refresh();

});



