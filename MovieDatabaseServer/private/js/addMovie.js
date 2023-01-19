//submit
function addMovie() {
    //get values from document
    //entered from textbox
    let title = document.getElementById("Title").value;
    let releaseYear = document.getElementById("ReleaseYear").value;
    let runtime = document.getElementById("Runtime").value;
    let plot = document.getElementById("Plot").value;
    let genre = document.getElementById("Genre").value;
    let Director = document.getElementById("Director").value;
    let Writer = document.getElementById("Writer").value;
    let Actors = document.getElementById("Actors").value;
    //validate
    //all fields must be filled in
    if (title=="" || plot=="" || genre=="" ||releaseYear == "" || runtime =="" || Director=="" || Writer=="" || Actors=="") {
        alert("All Fields Must Be Filled!");
        return;
    }
    //build request body
    let requestBody = {
        title,
        releaseYear,
        runtime,
        plot,
        genre,
        Director,
        Writer,
        Actors
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4, status =200)
        //and no errors
        if (this.readyState == 4 && this.status == 201) {
            //alert user and when user clicks 'OK', reload page
            alert('New Movie Added!');
        }
        //internal error from server, probably error in reading database
        if (this.readyState == 4 && this.status == 500) {
            //alert user and when user clicks 'OK', reload page
            alert('Error reading database');
        }
        //movie with same title already exists
        if (this.readyState == 4 && this.status == 400) {
            //alert user and when user clicks 'OK', reload page
            alert('Error: Movie with the same title already exists');
        }
        //person specified does not exist
        if (this.readyState == 4 && this.status == 404) {
            //alert user and when user clicks 'OK', reload page
            alert('Error: Person specified does not exist. Try again');
        }
    }
    //open and send get request
    req.open("POST", '/movies', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(requestBody));
    console.log("sent");
}

