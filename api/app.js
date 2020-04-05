const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const jwt = require('jsonwebtoken');

//Load in the mongoose models
const { List, Task, User } = require('./db/models');


//MIDDLEWARE


//Load middleware
app.use(bodyParser.json());

//CORs headers middleware
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
    next();
});

let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if(err) {
            res.status(401).send(err);
        } else {
            req.user_id = decoded._id;
            next();
        }
    });
}

let verifySession = (req,res, next) => {
    let refreshToken  = req.header('x-refresh-token');
    let _id = req.header('_id');

    User.findByIdAndToken( _id, refreshToken).then((user) => {
        if(!user) {
         return Promise.reject({
            'error' : 'user not found. Make sure that the refresh token and user id are correct'
         });
        }
       
        
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    isSessionValid = true;
                }
            }
        });
         if (isSessionValid) {
             next();
         } else {
             return Promise.reject({
                 'error' : 'Refresh token has expired or the session is invalid'
             })
         }

    }).catch((e) => {
        res.status(401).send(e);
    })
};
/* Route Handlers */


/* list routes */


app.get('/lists', authenticate, (req, res) => {
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
});

app.post('/lists', authenticate, (req, res) => {
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        res.send(listDoc);
    })
});

app.patch('/lists/:id', authenticate, (req, res) => {
 List.findOneAndUpdate({ _id: req.params.id,_userId:req.user_id }, {
    $set: req.body
    }).then(() => {
         res.send({ 'message': 'updated successfully'});
    });
});

app.delete('/lists/:id', authenticate, (req, res) => {
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        deleteTasksFromList(removedListDoc._id);
        
    })
});

app.get('/lists/:listId/tasks',authenticate, (req, res) => {
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});

/*app.get('lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(200);
    })
})*/

app.post('/lists/:listId/tasks', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            return true;
        }
        return false;
    }).then((canCreateTask) => {
        if(canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        }else {
            res.sendStatus(404);
        }
    })
   
});

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            return true;
        }
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                $set: req.body
                }
             ).then(() => {
                res.send({message: 'Updated Successfully'})
            }) 
        } else {
            res.sendStatus(404);
        }
    })
      
});

app.delete('/lists/:listId/tasks/:taskId',authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if(list) {
            return true;
        }
        return false;
    }).then((canDeleteTasks) => {

        if (canDeleteTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        } else {
            res.sendStatus(404);
            
        }
        
    });

    
});

app.post('/users', (req, res) => {
     let body = req.body;
     let newUser = new User(body);

     newUser.save().then(() => {
         return newUser.createSession();
     }).then((refreshToken) => {
         return newUser.generateAccessAuthToken().then((accessToken) => {
             return {accessToken, refreshToken}
         });
     }).then((authTokens) => {
         res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
     }).catch((e) => {
         res.status(400).send(e);
     });
})

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {

            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
            res.status(400).send(e);
            
    });
})

app.get('/users/me/access-token', verifySession, (req,res) => {
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(invalid);
        console.log(e);
    });
         
})

let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("tasks From" + _listId + "were deleted!");
    })
}



app.listen(3000, () => {
    console.log("Server is listening on port 3000");
}); 