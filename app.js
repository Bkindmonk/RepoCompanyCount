'use strict';
var request = require('request');
var async = require('async');
var contributors_list = 'https://api.github.com/repos/cla-assistant/cla-assistant/contributors';
var callback_count = 0;

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
function countCompany(company_name) {
    //if the company doesn't exist already in the dictionary, create it
    if (!(company_name in company_dictionary)) {
        company_dictionary[company_name] = 0;
    }
    // increment the count
    company_dictionary[company_name] += 1;
}

function getCompanyCount (company_name) {
    return company_dictionary[company_name];
}

/*
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
                countCompany('unknown');
                callback_count +=1;
            }else{
                countCompany(company);
                callback_count +=1;
            }
        }else{
            console.error('error for '+contributor_url)
            callback_count +=1;
            //in case of communication error, print it to the console for debugging
        }
        
    });

    
}
*/
//main logic
request(connection, function (error, response, body) {

    //if there was no error in the communication or request, proceed
    if (!error && response.statusCode == 200) {
        //parse the response into a JSON object
        var contributors = JSON.parse(body);
        
        //a list to store the async calls that need to be executed in parallel
        var contributor_task_list = [];
        
        //get the company for each entry and add them to the dictionary
        for (var contributor_data in contributors) {
            var contributor_url = contributors[contributor_data]['url']
            
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
                        console.log(company);
                        //if the comapny is null, count unknown
                        if(company == null){
                            countCompany('unknown');
                        }else{
                            countCompany(company);
                        }
                    }else{
                        console.error('error for '+contributor_url)
                        //in case of communication error, print it to the console for debugging
                    }
                    //lets async know it is done
                    callback();
                });
                
                
            });
            
        }

        async.parallel(contributor_task_list, function(error,results){
            //after all the async calls have finished
            //for each entry in the dictionary print the count
            for (var company_name in company_dictionary) {
                console.log(company_name + " " + getCompanyCount(company_name));
            }
        });

        

    }else{
        //if there was an error with the connection, print the error and result code
        console.log(response.statusCode);
        console.log(response.body);
    }
});