# GitHub Stars Manager

A simple Node.js command-line script collection to manage your GitHub Stars. These scripts allow you to list all starred repositories and perform batch unstarring operations.

## Features

- `list_stars.js`: Fetch all your GitHub Stars and save to a text file
- `remove_stars.js`: Batch unstar repositories within a specified range

## Usage

1. Set environment variable `APIKEY` with your GitHub Personal Access Token

```
export APIKEY=your_github_token
```

2. List all stars

```
node list_stars.js
```

This will generate a `stars.txt` file in the current directory with details of all starred repositories.

3. Remove stars

```
node remove_stars.js [startIndex] [endIndex]
```

- `startIndex`: Optional, starting index (defaults to 1)
- `endIndex`: Optional, ending index (defaults to last)

## Error Handling

- The scripts will check for the presence of the APIKEY environment variable
- Permission errors (403) will cause immediate exit
- Other errors will be logged but won't stop the process
- Detailed error messages are provided for troubleshooting

## Token Permissions

Your GitHub Personal Access Token needs the following permissions:

- `public_repo` - For public repositories
- `repo` - If you need to manage private repositories

## Rate Limiting

The scripts include a 500ms delay between operations to avoid hitting GitHub's API rate limits.

## License

MIT
