/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const fs = require("fs");
const cp = require('child_process');
const async = require('async');
//const http = require('http');
//onst https = require('https');
const wget = require('wget-improved');
const {once, EventEmitter} = require('events')

function getFileNames(check){

    //store all files in a structure that can be looped through

    var files
    var fileURLs=[]
    var fileNames=[]

    console.log(typeof check.data)
    for(files of check.data)
    {
        if(files.status == 'added')
        {
            fileURLs.push(files.raw_url)
            fileNames.push(files.filename)
        }
    }
    return fileURLs
}

/*
function downloadFiles(url){ 
    const promise = new Promise(function(resolve,reject){
        cp.exec('wget -nH -x '+url+' -O dummy',
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            })
        })
    return promise
}
*/

//https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
/* Doesn't provide full file download
function downloadFiles(url, dest) {
  var file = fs.createWriteStream(dest);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
    });
  });
}
*/

/*
function needDeleteFile(dest){
    fs.stat(dest,function(err,fileStat)    {
        if(err){    
            if (err.code == 'ENOENT') {
                console.log('Does not exist.');
            }       
        }
        else {
            if (fileStat.isFile()) {
                console.log('File found.');
                fs.unlink(dest,function(err2){
                    if(err2) throw err2;    
                    console.log('Deletion successful')
                });
            }         
        }
    });
}
*/

function needDeleteFile(dest){
/*
    fs.stat(dest,function(err,fileStat)    {
        try{
            if (fileStat.isFile()) {
                console.log('File found.');
                fs.unlink(dest,function(err2){
                    if(err2) throw err2;    
                    console.log('Deletion successful')
                });
            }         
        }
        catch(err){
            if (err.code == 'ENOENT') {
                console.log('Does not exist.');
            }       
        }
        finally{
            console.log('Proceeding')
            return
        }
    });
*/

/*
    try {
        if (fs.existssync(dest)) {
            //file exists
            fs.unlink(dest,function(err2){
                if(err2) throw err2;    
                console.log('deletion successful')
            });
         }
    } catch(err) {
        continue
    }
*/
    if (fs.existsSync(dest)) {
        //file exists
        fs.unlink(dest,function(err2){
            if(err2) throw err2;    
            console.log('deletion successful')
        });
    }

}

//from https://www.devdungeon.com/content/working-files-javascript-nodejs
async function downloadFiles(url,dest){
    needDeleteFile(dest);
    let download = wget.download(url, dest);
    console.log(download)
    await once(download,'end')
}

function getFilesizeInBytes(filename) {
    console.log("Here")
    var stats = fs.statSync(filename)
    console.log("THere")
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

function getSizes(fileURLs){
    var url
    var totalSize = 0
    for(url of fileURLs)
    {
/*
        downloadFiles(url).then(
            totalSize+= getFilesizeInBytes('dummy'),
            console.log("total size is? "),
            console.log(totalSize),
        )
*/
        console.log("Fish")
        let download = downloadFiles(url,'./dummy')
        download.then(console.log("Papapya"))
        totalSize+= getFilesizeInBytes('dummy')
        console.log(totalSize)
    }
    return totalSize
}

module.exports = app => {

  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on(['pull_request.reopened','pull_request.opened','pull_request.edited'], async context => {
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const pull_number = context.payload.pull_request.number

    check = await context.github.pulls.listFiles({
        owner,repo,pull_number,
    });
    console.log(check)

    fileURLs=getFileNames(check);
    console.log(fileURLs)

    console.log("finished files");
    totalSize=getSizes(fileURLs);
    console.log(totalSize);
    console.log("finished download");

    //console.log('rm dummy')
    //cp.exec('rm dummy')
    //needDeleteFile('./dummy')

/*
    totalSize =await async.waterfall([
        async function (callback){
            check = await context.github.pulls.listFiles({
            owner,repo,pull_number,
            });
            callback(null,check)
        },
        function secondStep(step1Result,callback){
            console.log("finished check");
            fileURLs=getFileNames(step1Result);
            callback(null,fileURLs);
        },
        function(step2Result,callback){
            console.log("finished files");
            totalSize=getSizes(step2Result);
            console.log(totalSize);
            console.log("finished download");
            callback(null,totalSize);
        }
    ], function (err, result) {
        // result now equals 'callback'

        //remove dummy file
        console.log('rm dummy')
        cp.exec('rm dummy')
        console.log(result)

        return result 
    });
    console.log(totalSize)
    if(context.payload.sender.login != 'sizecheck[bot]'){
        const issueComment = context.issue({ body: 'Apparent size is '+ totalSize/1024.0 + 'kB'})
        return context.github.issues.createComment(issueComment)
    }
*/
  })

  //app.on(['pull_request.reopened','issue_comment.created'], async context => {
  //app.on('issue_comment.created', async context => {
/*
  app.on('issue_comment.edited', async context => {

    if(context.payload.sender.login != 'sizecheck[bot]'){
        const issueComment = context.issue({ body: 'You shall not merge!'})
        return context.github.issues.createComment(issueComment)
    }


    var val = context.payload.repository.size

    const owner2 = 'erdc'
    const repo2 = 'proteus'
    const pull_number2 = '1194'

    check = await context.github.pulls.listFiles({
        owner: owner2,
        repo: repo2,
        pull_number: pull_number2,
    });

    //store all files in a structure that can be looped through


    var files
    var fileList=[]
    var fileNames=[]

    for(files of check.data)
    {
        if(files.status == 'added')
        {
            fileList.push(files.raw_url)
            fileNames.push(files.filename)
        }
    }
    var url
    var totalSize = 0
    for(url of fileList)
    {
        const promise = new Promise(function(resolve,reject){
            cp.exec('wget -nH -x '+url+' -O dummy',
            function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        })
        })
        totalSize+= promise.then(getFilesizeInBytes('dummy'))
    }

    //remove dummy file
    cp.exec('rm dummy')
    
    //write answer in kB
    totalSize /= 1024

    if(context.payload.sender.login != 'sizecheck[bot]'){
        const issueComment = context.issue({ body: 'Apparent size is '+ totalSize + 'kB'})
        return context.github.issues.createComment(issueComment)
    }
  })
*/


  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
