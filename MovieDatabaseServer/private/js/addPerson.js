//submit
function addPerson() {
    //get values from document
    let name = document.getElementById("name").value;
    let typeList = document.getElementsByName('personType');
    //get value of radio button selected
    let personType;
    for (let i=0; i< typeList.length; i++) {
        if (typeList[i].checked) {
            personType = typeList[i].value;
        }
    }
    //validate
    //all fields must be filled in
    if (name=="" || personType==null) {
        alert("All Fields Must Be Filled!");
        return;
    }
    //build request body
    let requestBody = {
        name,
        personType
    }
    //open new request
    let req = new XMLHttpRequest();
    //async code
    req.onreadystatechange = function() {
        //once response is received (readyStaty =4, status =200)
        //and no errors
        if (this.readyState == 4 && this.status == 201) {
            alert("New Person Added!");
        }
        //internal error from server, probably error in reading database
        if (this.readyState == 4 && this.status == 500) {
            alert("Error reading database, try again.");
        }
        //person with same name already exists
        if (this.readyState == 4 && this.status == 400) {
            alert("Error: Person with the same name already exists");
        }
    }
    //open and send get request
    req.open("POST", '/people', true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(requestBody))
}