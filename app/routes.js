module.exports = function(app, passport, db, multer) {

  var ObjectId = require('mongodb').ObjectId;

// normal routes ===============================================================
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/personal/:personalID', isLoggedIn, function(req, res) {//get request that takes in location, 2 functions as arguments
    const param = req.params.personalID
    console.log(param);
      db.collection('messages').find({_id: ObjectId(param)}).toArray((err, result) => {//go to collection, find specific one, place in array

        if (err) return console.log(err)// if the response is an err
        console.log(result);
        res.render('personal.ejs', {//if response is good render the profile page
          user : req.user, //results from the collection
          messages: result
        })
      })
  });
  app.post('/zoom', isLoggedIn, function(req, res) {//get request that takes in location, 2 functions as arguments

    // let searchTag = {}
    // let searchTp = {}
    // if (req.query.searchTag){
    //   searchTag = {tags: {'$regex':req.query.searchTag}}
    // }
    // else if(req.query.searchTp){
    //   searchTp = {typ:
    //   {'$regex':req.query.searchTp}}
    // }

    db.collection('messages').find({tags: {$regex: `${req.body.searchTag}`}}).toArray((err, result) => {//go to collection, find specific one, place in array
      console.log(result)
      if (err) return console.log(err)// if the response is an err
      res.render('feed.ejs', {//if response is good render the profile page
        user : req.user, //results from the collection
        messages: result
      })
    })
  });


  // app.post('/zoom', isLoggedIn, function(req, res) {//get request that takes in location, 2 functions as arguments

    // let searchTag = {}
    // let searchTp = {}
    // if (req.query.searchTag){
    //   searchTag = {tags: {'$regex':req.query.searchTag}}
    // }
    // else if(req.query.searchTp){
    //   searchTp = {typ:
    //   {'$regex':req.query.searchTp}}
    // }

  //   db.collection('messages').find({tags: {$regex: `${req.body.searchTag}`}}).toArray((err, result) => {//go to collection, find specific one, place in array
  //     console.log(result)
  //     if (err) return console.log(err)// if the response is an err
  //     res.render('feed.ejs', {//if response is good render the profile page
  //       user : req.user, //results from the collection
  //       messages: result
  //     })
  //   })
  // });

  app.get('/feed', isLoggedIn, function(req, res) {//get request that takes in location, 2 functions as arguments
    db.collection('messages').find().toArray((err, result) => {//go to collection, find specific one, place in array
      console.log(result)
      if (err) return console.log(err)// if the response is an err
      res.render('feed.ejs', {//if response is good render the profile page
        user : req.user, //results from the collection
        messages: result
      })
    })
  });//get request that brings us to our profile after login

  // 
  // app.post('/bookmarks', (req, res) => {
  //   console.log("creatingBookmark", req.body)
  //   db.collection('bookmarks')
  //   .save( {
  //         userID: req.user._id,
  //         message_id:req.body.message_id,
  //         busdes: req.body.busdes
  //
  //     },(err, result) => {
  //       if (err) return console.log(err)
  //       console.log('saved to database')
  //       res.redirect('/feed')
  //     }
  //   )
  // })


  app.get('/post/:postID', isLoggedIn, function(req, res) {//get request that takes in location, 2 functions as arguments
        const param = req.params.postID
        console.log(param);
          db.collection('messages').find({_id: ObjectId(param)}).toArray((err, result) => {//go to collection, find specific one, place in array

            if (err) return console.log(err)// if the response is an err
            console.log(result);
            res.render('post.ejs', {//if response is good render the profile page
              user : req.user, //results from the collection
              messages: result
            })
          })
      });


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      console.log(req.user._id)
        db.collection('messages').find({userID: String(req.user._id)}).toArray((err, messages) => {
          if (err) return console.log(err)

//create db for bookmarks
          db.collection('userInfo').findOne({userID: String(req.user._id)}).then(userInfo => {
            console.log(userInfo)
            console.log(req.user)
            if(userInfo == null){
              userInfo = {compName: ''}
            }
            res.render('profile.ejs', {
              user: req.user,
              userInfo: userInfo,
              messages: messages,
              // bookmarks: bookmarks
            })//render
          })
        })
    });


    //PERSONAL SECTION
    app.get('/personal', isLoggedIn, function(req, res) {
        db.collection('messages').find({userID: String(req.user._id)}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('personal.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    app.get('/setup', isLoggedIn, function(req, res) {
        db.collection('userInfo').find({userID: String(req.user._id)}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('setup.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    app.post('/setup', isLoggedIn, function(req, res) {
      db.collection('userInfo').findOneAndUpdate({userID: String(req.user._id)}, {
          $set: {
            compName: req.body.compName,
            employeeNum: req.body.employeeNum,
            role: req.body.role,
            firstname: req.body.firstname,
            lastname: req.body.lastname
          }//set
        },//curly db collection
        {
          upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          db.collection('messages').find({userID: String(req.user._id)}).toArray((err, result) => {
            if (err) return console.log(err)

            res.render('profile.ejs', {
              user: req.user,
              userInfo: req.body,
              messages: result
            })//render
          })//close DB collection
        }//139
      )//findone})
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

  //
  //
  //   var storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   cb(null,'public/img')
  //   console.log("1",file);
  // },
  // filename: (req, file, cb) => {
  //   cb(null, file.fieldname + '-' + Date.now() + ".png")
  //       console.log("2", file);
  // }
  // })
  // var upload = multer({storage: storage})
  //   app.post('/messages', upload.array('file-to-upload', 3), (req, res) => {
  //     // console.log(req.body["file-to-upload"]);
  //     // 'img/' +
  //     console.log(req.files);
  //     db.collection('messages').save({name: req.body.name, typ: req.body.typ, bs: req.body.bs, posterID: req.user._id, thumbUp: 0, thumbDown:0, images: req.files.map(f => 'img/' + f.filename)}, (err, result) => {
  //       if (err) return console.log(err)
  //       console.log('saved to database')
  //       res.redirect('/feed')
  //     })
  //   })


  var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/')
    console.log("1",file);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
        console.log("2", file);
  }
})
var upload = multer({storage: storage})
    app.post('/messages', upload.array('file-to-upload', 3), (req, res) => {
      // console.log(req.body["file-to-upload"]);
      // 'img/' +
      console.log("Files are", req.files);
      db.collection('messages').save({typ: req.body.typ, bs: req.body.bs, tags: req.body.tags, userID: req.body.userID, house: req.files.map(f => 'img/' + f.filename)}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved new message to database')
        res.redirect('/personal')
      })
    })
// message board routes ===============================================================

    // app.post('/messages', (req, res) => {
    //   db.collection('messages').save({name: req.body.name, typ: req.body.typ, bs: req.body.bs, thumbUp: 0, thumbDown:0}, (err, result) => {
    //     if (err) return console.log(err)
    //     console.log('saved to database')
    //     res.redirect('/personal')
    //   })
    // })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, typ: req.body.typ, bs: req.body.bs, tags: req.body.tags}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/thumbDown', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })



    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, typ: req.body.typ, bs: req.body.bs, tags: req.body.tags}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/index', function(req, res) {
            res.render('index.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/index', passport.authenticate('local-login', {
            successRedirect : '/lead', // redirect to the secure profile section
            failureRedirect : '/index', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup-user', function(req, res) {
            res.render('signup-user.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup-user', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup-user', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        app.get('/signup-business', function(req, res) {
            res.render('signup-business.ejs', { message: req.flash('signupMessage') });
        });

        app.post('/signup-business', passport.authenticate('local-signup', {
            successRedirect : '/setup', // redirect to the secure profile section
            failureRedirect : '/signup-business', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));


        // app.get('/profile', function(req, res) {
        //     res.render('profile.ejs', { message: req.flash('profileMessage') });
        // });
        //
        //
        // app.post('/profile', passport.authenticate('local-profile', {
        //     successRedirect : '/personal', // redirect to the secure profile section
        //     failureRedirect : '/profile', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));


        // app.get('/private', function(req, res) {
        //     res.render('profile.ejs', { message: req.flash('signupMessage') });
        // });
        //
        //
        // app.post('/profile', passport.authenticate('local-profile', {
        //     successRedirect : '/profile', // redirect to the secure profile section
        //     failureRedirect : '/signup-user', // redirect back to the signup page if there is an error
        //     failureFlash : true // allow flash messages
        // }));


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.compname    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
