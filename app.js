'use strict';
var request = require('request');
var async = require('async');
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
    var contributor_connection = {
        url: contributor_url,
        headers: {
            'User-Agent': 'request'
        }
    }
    //request the company for each contributor
    request(contributor_connection, function(error, response, body){
        //if there was no error in the communication or request, proceed
        if(!error && response.statusCode ==200){
            //parse the response into a JSON object
            var profile = JSON.parse(body);
            //get the company name
            var company = profile['company'];
            //if the comapny is null, return unknown
            if(company == null){
                return 'unknown'
            }else{
                return company;
            }
        }else{
            console.error('error for '+contributor_url)
            //in case of communication error, return "error". An unlikely comany name.
            //Given an error count in the output. Error log can be 
            return 'error';
        }
    });
}

//main logic
request(connection, function (error, response, body) {

    //if there was no error in the communication or request, proceed
    if (!error && response.statusCode == 200) {
        //parse the response into a JSON object
        var contributors = JSON.parse(body);


        var contributor_task_list = [];

        //construct the async tasks for all request to be processed in parallel
        contributors.forEach(function(contributor_index){
            var contributor_url = contributors[contributor_index]['url']
            var contributor_connection = {
                url: contributor_url,
                headers: {
                    'User-Agent': 'request'
                }
            }
            contributor_task_list.push(function(callback){
                request(contributor_connection, function(error, response, body){
                    //if there was no error in the communication or request, proceed
                    if(!error && response.statusCode ==200){
                        //parse the response into a JSON object
                        var profile = JSON.parse(body);
                        //get the company name
                        var company = profile['company'];
                        //if the comapny is null, return unknown
                        if(company == null){
                            return 'unknown'
                        }else{
                            return company;
                        }
                    }else{
                        console.error('error for '+contributor_url)
                        //in case of communication error, return "error". An unlikely comany name.
                        //Given an error count in the output. Error log can be 
                        return 'error';
                    }
                });
                callback();
            });
        });

        async.parallel(contributor_task_list, function(err, company_list){
            for (var comapny_name in company_list) {
                company_dictionary.countCompany(comapny_name);
            }
        });
/*
        //get the company for each entry and add them to the dictionary
        for (var contributor_data in contributors) {
            var company = getCompany(contributors[contributor_data]['url']);
            console.log(contributors[contributor_data]['url']);
            //count the company
            company_dictionary.countCompany(company);
        }
*/
        //for each entry in the dictionary print the count
        for (var comapny_name in company_dictionary) {
            console.log(comapny_name + " " + company_dictionary.getCompanyCount(comapny_name));
        }

    }else{
        //if there was an error with the connection, print the error and result code
        console.log(response.statusCode);
        console.log(response.body);
    }
});