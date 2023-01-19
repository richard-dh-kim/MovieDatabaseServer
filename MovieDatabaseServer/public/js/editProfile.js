//change user type
//contributor -> regular, regular -> contributor
function changeUserType() {
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4, status =200)
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("User type changed!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //user does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("User does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
    }
    //open and send get request
    req.open("PUT", "/users/changeUserType", true);
    req.send();
}

//delete movie from wathed list
function deleteFromWatchedList(movieButton) {
    //get movie id
    let movieId = movieButton.value;
    //build request body
    let requestBody = {
        movieId
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4)
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("Movie deleted from watched list!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //no return
        //this should not happen since movieid was given by server but just incase user does something funny
        if (this.readyState == 4 && this.status == 400) {
            if (!alert("Bad request: Movie does not exist in your watched list.")) {
                window.location.reload();
            }
        }
        //user/movie does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("User/movie does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                //redirect user to login page
                window.location.href = "http://localhost:3000/login.html";
            }
        }
    }
    //open and send get request
    req.open("DELETE", "/users/deleteFromWatchedList", true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}

//add movie to wathed list
function addToWatchedList() {
    //get current url
    let url = window.location.href;
    //parse the movie id from url
    let indexOfLastSlash = url.lastIndexOf('/');
    let movieId = url.substring(indexOfLastSlash+1);
    //build request body
    let requestBody = {
        movieId
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4)
        //no return
        if (this.readyState == 4 && this.status == 400) {
            if (!alert("Bad request: Movie is already added to your watched list.")) {
                window.location.reload();
            }
        }
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("Movie added to watched list!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //user/movie does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("User/movie does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                window.location.reload();
            }
        }
    }
    //open and send get request
    req.open("PUT", "/users/addToWatchedList", true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}

//add person to peopleFollowing
function followPerson() {
    //get current url
    let url = window.location.href;
    //parse the person id from url
    let indexOfLastSlash = url.lastIndexOf('/');
    let personId = url.substring(indexOfLastSlash+1);
    //build request body
    let requestBody = {
        personId
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4)
        //no return
        if (this.readyState == 4 && this.status == 400) {
            if (!alert("Bad request: You are already following this person.")) {
                window.location.reload();
            }
        }
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("Person followed!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //person/user does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("Person/User does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                window.location.reload();
            }
        }
    }
    //open and send get request
    req.open("PUT", "/users/followPerson", true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}

//delete person from peopleFollowing
function unfollowPerson(personButton) {
    //get person id
    let personId = personButton.value;
    //build request body
    let requestBody = {
        personId
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4)
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("Person unfollowed!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //no return
        //this should not happen since movieid was given by server but just incase user does something funny
        if (this.readyState == 4 && this.status == 400) {
            if (!alert("Bad request: You are not following this person.")) {
                window.location.reload();
            }
        }
        //person/user does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("Person/User does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                //redirect user to login page
                window.location.href = "http://localhost:3000/login.html";
            }
        }
    }
    //open and send get request
    req.open("DELETE", "/users/unfollowPerson", true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}

//add user to usersFollowing
function followUser() {
    //get current url
    let url = window.location.href;
    //parse the user id from url
    let indexOfLastSlash = url.lastIndexOf('/');
    let userId = url.substring(indexOfLastSlash+1);
    //build request body
    let requestBody = {
        userId
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4)
        //no return
        if (this.readyState == 4 && this.status == 400) {
            if (!alert("Bad request: You are already following this user.")) {
                window.location.reload();
            }
        }
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("User followed!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //user does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("User does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                window.location.reload();
            }
        }
    }
    //open and send get request
    req.open("PUT", "/users/followUser", true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}

//delete user from usersFollowing
function unfollowUser(userButton) {
    //get user id
    let userId = userButton.value;
    //build request body
    let requestBody = {
        userId
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4)
        //success
        if (this.readyState == 4 && this.status == 200) {
            if (!alert("User unfollowed!")) {
                window.location.reload();
            }
        }
        //database error
        if (this.readyState == 4 && this.status == 500) {
            if (!alert("Error reading database")) {
                window.location.reload();
            }
        }
        //no return
        //this should not happen since movieid was given by server but just incase user does something funny
        if (this.readyState == 4 && this.status == 400) {
            if (!alert("Bad request: You are not following this user.")) {
                window.location.reload();
            }
        }
        //user does not exist
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 404) {
            if (!alert("User does not exist")) {
                //redirect user to index
                window.location.href = "http://localhost:3000";
            }
        }
        //user is not logged in
        //this should not happen since _id was saved in session but just incase user does something funny
        if (this.readyState == 4 && this.status == 403) {
            if (!alert("Forbidden, you are not logged in.")) {
                //redirect user to login page
                window.location.href = "http://localhost:3000/login.html";
            }
        }
    }
    //open and send get request
    req.open("DELETE", "/users/unfollowUser", true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}