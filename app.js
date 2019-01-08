'use strict';
var request = require('request');
var contributors_list = 'https://api.github.com/repos/cla-assistant/cla-assistant/contributors';


//connection object to house the headers, as the GitHub server requires it
var connection = {
    url: contributors_list,
    headers: {
        'User-Agent': 'request'
    }
};


//making it an object, allows us to change the datastructure for the company counts, 
//without changing the main function, creating less confusion over multiple iterations,
//and creating more readable code
function company_dictionary() { };

company_dictionary.countCompany = function (company_name) {
    //if the company doesn't exist already in the dictionary, create it
    if (!(company_name in company_dictionary)) {
        company_dictionary[company_name] = 0;
    }
    // increment the count
    company_dictionary[company_name] += 1;
}

company_dictionary.getCompanyCount = function (company_name) {
    return company_dictionary[company_name];
}

function getCompany(contributor_url) {
    //request the company for each contributor
}

//main logic
request(connection, function (error, response, body) {
 
    //if there was no error in the communication or request, proceed
    if (!error && response.statusCode == 200) {
        //parse the response into a JSON object
        var contributors = JSON.parse(body);

        //get the company for each entry and add them to the dictionary
        for (var contributor_data in contributors) {
            var company = getCompany(contributor_data['url']);

            //count the company
            comapny_dictionary.countCompany(company);
        }

        //for each entry in the dictionary print the count
        for (var comapny_name in comapny_dictionary) {
            console.log(comapny_name + " " + comapny_dictionary.getCompanyCount(comapny_name));
        }
        
    }
});