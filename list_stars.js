#!/usr/bin/env node

const https = require("https");
const fs = require("fs");

class GitHubStarsFetcher {
  constructor() {
    this.apiKey = process.env.APIKEY;
    if (!this.apiKey) {
      throw new Error("Error: APIKEY environment variable is not set");
    }

    this.options = {
      headers: {
        "User-Agent": "Node.js",
        Authorization: `token ${this.apiKey}`,
        Accept: "application/vnd.github.v3+json",
      },
    };

    this.outputFile = "stars.txt";
    this.count = 1;
  }

  fetchStars(page = 1) {
    return new Promise((resolve, reject) => {
      const url = `https://api.github.com/user/starred?page=${page}`;

      https
        .get(url, this.options, (res) => {
          let data = "";

          res.on("data", (chunk) => (data += chunk));

          res.on("end", () => {
            if (res.statusCode !== 200) {
              console.error(`API request failed: ${res.statusCode}`);
              console.error(data);
              reject(new Error(`API request failed: ${res.statusCode}`));
              return;
            }

            resolve(JSON.parse(data));
          });
        })
        .on("error", reject);
    });
  }

  async saveRepos() {
    let page = 1;
    const writeStream = fs.createWriteStream(this.outputFile);

    try {
      while (true) {
        console.log(`Fetching page ${page}...`);
        const repos = await this.fetchStars(page);

        if (!repos || repos.length === 0) {
          console.log("No more repositories");
          break;
        }

        for (const repo of repos) {
          const info = {
            full_name: repo.full_name,
            svn_url: repo.svn_url,
            homepage: repo.homepage || "N/A",
            stars: repo.stargazers_count,
            language: repo.language || "N/A",
            topics: repo.topics?.join(", ") || "N/A",
          };

          writeStream.write(`Repository [${this.count}]: ${info.full_name}\n`);
          writeStream.write(`SVN URL: ${info.svn_url}\n`);
          writeStream.write(`Homepage: ${info.homepage}\n`);
          writeStream.write(`Stars: ${info.stars}\n`);
          writeStream.write(`Language: ${info.language}\n`);
          writeStream.write(`Topics: ${info.topics}\n`);
          writeStream.write("----------------------------------------\n");

          this.count++;
        }

        page++;
      }

      writeStream.end();
      console.log(`Done! Processed ${this.count - 1} repositories`);
      console.log(`Results saved to ${this.outputFile}`);
    } catch (error) {
      console.error("Error occurred:", error);
      writeStream.end();
    }
  }
}

async function main() {
  try {
    const fetcher = new GitHubStarsFetcher();
    await fetcher.saveRepos();
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main();
