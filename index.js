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
    console.log(url)
    let download = wget.download(url, dest);
    console.log("HERE?")
    await once(download,'end')
    console.log("finsihed?")
}

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

async function getSizes(fileURLs){
    var url
    var totalSize = 0
    for(url of fileURLs)
    {
        let download = await downloadFiles(url,'./dummy')
        totalSize+= getFilesizeInBytes('dummy')
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
    const pr = context.payload.pull_request
    const pull_number = pr.number

    check = await context.github.pulls.listFiles({
        owner,repo,pull_number,
    });
    console.log(check)

    fileURLs=getFileNames(check);
    console.log(fileURLs)

    console.log("finished files");
    totalSize=await getSizes(fileURLs);
    console.log(totalSize);
    console.log("finished download");

    const timeStart = new Date()
    context.github.checks.create(context.repo({
        name: 'sizeCheck',
        head_branch: pr.head.ref,
        head_sha: pr.head.sha,
        status: 'completed',
        started_at: timeStart,
        conclusion: 'success',
        completed_at: new Date(),
        output: {
        title: 'sizeCheck',
        summary: 'Testing!'
        }
    }))

/*
    if(context.payload.sender.login != 'sizecheck[bot]'){
        const issueComment = context.issue({ body: 'Apparent size is '+ totalSize/1024.0 + 'kB'})
        return context.github.issues.createComment(issueComment)
    }
*/
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
