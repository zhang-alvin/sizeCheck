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
