# sizeCheck

> A GitHub App built with [Probot](https://github.com/probot/probot) that A Probot app

Committing an unnecessarily large file in a git repository and pushing to the remote or merging with master is a costly mistake, which would require significant effort to fix.

This can be an especially common problem in projects without a mature development culture or in projects with inexperienced developers.
Reviewers are also fallable and can allow such files to slip through the cracks.

This app allows you to set a size threshold for the files added into the repository through a pull request.
The app initializes a check that compares the added files' on-disk size against the threshold. 
In the event that there are files larger than the threshold, the check will fail and the large files will be reported.

## Configuring

To configure the app, add a `.github/sizeCheck.yml` file to your repository.
Next populate the file with your desired threshold size in kB:
```
thresholdSize: choose-your-threshold-in-kB
``` 

## How it works and use case

This app looks for the added files in the pull request and uses `wget` to download the file. 
The size of the file is then checked, recorded, and ultimately compared against the threshold.

This was done in favor of checking the blob sizes primarily because this would give a more accurate measurement at the cost of efficiency using the GitHub API.
GitHub stores files as blobs, which are generally larger than the original file size.
The `getBlob` function from the GitHub API also has a 100Mb limit, so files larger than that may not be querable (forgive me if I'm completely wrong on this).

Originally, this app was supposed to measure the file size relative to the total repo size, for which the GitHub API is known to be unreliable.

So the main advantage of using this app at the moment is that it can be deployed continuously as a service and would therefore be faster than a GitHub action, provided that the file sizes are not too large.

It wouldn't be difficult to expand this app to provide the size estimates based on the GitHub API as well, but this is beyond the scope of personal necessity.
In fact, there's an existing GitHub action that does this (see https://github.com/marketplace/actions/lfs-warning), although it may still be under development.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how sizeCheck could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).


## License

[ISC](LICENSE) © 2020 zhang-alvin <alv.zhang@gmail.com>
