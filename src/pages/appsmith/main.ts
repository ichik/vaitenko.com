// Get the root element
var r = document.documentElement;

// Create a function for setting a variable value
function doTheThing() {
    // Set the value of variable --blue to another value (in this case "lightblue")
    r.style.setProperty('--blue', 'hotpink');
}

doTheThing();
