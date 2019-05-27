var express =   require('express');
    router =    express.Router({mergeParams: true});
    Album =     require("../models/album");
    Comment =   require("../models/comment");
    User =      require("../models/user");

//Comments NEW route
router.get('/new', isLoggedIn, (req, res)=>{
    Album.findById(req.params.id, (err, album)=>{
      //this is the step I didn't know we needed. the new template should have access to which album the comment is for
      if (err){
        console.log(err);
        res.redirect('/comments');
      } else {
        res.render('comments/new', {album: album});
      }
    });
    //from button on show page, show ejs template for new campground
    //if isLoggedIn returns not authenticated, user will be redirected to login page
    //if user is authenticated, login route takes them to album gallery page for all logins currently
});
  
//Comments CREATE route
router.post('/', isLoggedIn, (req, res)=>{
    //grab input from form req object in name
    let newComment= req.body.comment;
    Album.findById(req.params.id, (err, album)=>{
    //find the album FIRST, req.params refers to the route parameters! :)
      if (err){
        console.log(err);
      } else{
        newComment.text = req.sanitize(newComment.text);
          //create a new comment and save to db
          //why dont we have to use .populate to show all comments?
        Comment.create(newComment, (err, comment)=>{
          //create comment, push it onto album comments array in db, save 
          if (err){
            console.log("comment not created", err);
          } else { 
            //add username and id to comment, then save comment
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            album.comments.push(comment);
            //push the successfully created comment, not the original form data
            //now saving the entire album with its new data wich will include the new comment
            album.save((err, data)=>{
              if (err){
                console.log(err);
              } else {
                console.log("new comment created");
              }
            });
          }
        });
        res.redirect('/music/' + album._id);
        //added ._id since the .findById method returns the entire album object
        //why is colt's redirect still nested?
      }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login'); 
}

module.exports = router;