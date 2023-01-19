//submit
function searchMovies() {
    //get values from document
    //entered from textbox
    let title = document.getElementById("Title").value;
    let actors = document.getElementById("Actors").value;
    let genre = document.getElementById("Genre").value;

    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4, status =200)
        if (this.readyState == 4 && this.status == 200) {
            //clear body
            document.body.innerHTML = "";
            //re-render body
            document.body.innerHTML = req.response;
        }

        if (this.readyState == 4 && this.status == 500) {
            alert("Error reading database");
        }
    }
    //build url
    let urlString = "/movies?page=1&Title=" + title + "&Actors=" + actors + "&Genre=" + genre;
    //open and send get request
    req.open("GET", urlString, true);
    req.send();
}

