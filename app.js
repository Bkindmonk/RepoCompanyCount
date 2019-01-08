'use strict';

var contributors_list = 'https://api.github.com/repos/cla-assistant/cla-assistant/contributors';

//making it an object, allows us to change the datastructure for the company counts, 
//without changing the main function, creating less confusion over multiple iterations,
//and creating more readable code
function company_dictionary() { };



//main logic
request(contributors_list, function (error, response, body) {
    //if there was no error in the communication or request, proceed
    if (!error && response.statusCode == 200) {
        //parse the response into a JSON object
        var contributors = JSON.parse(body);

        //get the company for each entry and add them to the dictionary

        //for each entry in the dictionary print the count

        
    }
});