/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const fs = require("fs");
const cp = require('child_process');
const async = require('async');
const wget = require('wget-improved');
const {once, EventEmitter} = require('events')

const ConfigFilename = 'sizeCheck.yml'

function getFileNames(check){

    //store all files in a structure that can be looped through

    var files
    var fileURLs=[]
    var fileNames=[]
    var blobSizes=[]

    console.log(typeof check.data)
    for(files of check.data)
    {
        if(files.status == 'added')
        {
            fileURLs.push(files.raw_url)
            fileNames.push(files.filename)
            blobSizes.push(files.size)
        }
    }
    return [fileURLs,fileNames]
}

function needDeleteFile(dest){
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
    await once(download,'end')
}

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}

async function getSizes(fileURLs,fileNames,fileDict){
    var url
    var totalSize = 0
    var zip = (a,b) => a.map((x,i) => [x,b[i]]);
    for (let [url, name] of zip(fileURLs, fileNames))
    {
        let download = await downloadFiles(url,'./dummy')
        let fileSize= getFilesizeInBytes('dummy')
        //create a map between the filename, file size, and the passing status
        fileDict[name] = fileSize/1024.0
        totalSize+=fileSize
    }
    //removes last dummy
    needDeleteFile('./dummy')
    return totalSize
}

module.exports = app => {

  app.on(['pull_request.reopened','pull_request.opened','pull_request.edited','pull_request.synchronize'], async context => {
    const timeStart = new Date()

    //configuration file with default threshold file size in kB
    const config = await context.config(ConfigFilename, {thresholdSize: 100})

    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const pr = context.payload.pull_request
    const pull_number = pr.number

    check = await context.github.pulls.listFiles({
        owner,repo,pull_number,
    });

    [fileURLs,fileNames,blobSizes]=getFileNames(check);
    console.log(blobSizes)

    var fileDict = {};
    var pass=1;
    var failArray= [];

    //get sizes; create dictionary to pass into function
    /*
    totalSize=await getSizes(fileURLs,fileNames,fileDict);

    for(var key in fileDict)
    {
        if(fileDict[key] > config.thresholdSize)
        {
            pass=0;
            failArray.push(key+':    '+fileDict[key]+'kB');
        }
    }
    */

    //Need a function that outputs failArray/pass using blobSizes output
    var zip = (a,b) => a.map((x,i) => [x,b[i]]);
    for( let [name,sizeBlob] of zip(fileNames,blobSizes))
    {
        if(sizeBlob > config.thresholdSize)
        {
            pass=0;
            failArray.push(name+':    '+sizeBlob+'kB');
        }
    }

    //make check status
    if(pass)
    {
        const passString = String('No files are larger than ' + config.thresholdSize +'kB');
        passCheck = context.github.checks.create(context.repo({
            name: 'size check',
            head_branch: pr.head.ref,
            head_sha: pr.head.sha,
            started_at: timeStart,
            conclusion: 'success',
            completed_at: new Date(),
            output: {
                title: 'All good!',
                summary: passString 
            }
        }))
    }
    else
    {
        //markdown formatting of string
        var failString = 'Some files are larger than ' + config.thresholdSize +'kB:<br /><br />';
        failString+="<pre><code>"
        for (failings of failArray)
        {
            //failString+=failings+'<br />'
            failString+=failings+'\n'
        }
        failString+="</code></pre>"
        failCheck = context.github.checks.create(context.repo({
            name: 'size check',
            head_branch: pr.head.ref,
            head_sha: pr.head.sha,
            started_at: timeStart,
            conclusion: 'failure',
            completed_at: new Date(),
            output: {
                title: 'Large files detected!',
                summary: failString
            }
        }))
    }

  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
