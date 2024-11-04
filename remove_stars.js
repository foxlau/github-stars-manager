#!/usr/bin/env node

const https = require("https");
const fs = require("fs").promises;

class GitHubStarsRemover {
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
      method: "DELETE",
    };
  }

  unstar(owner, repo) {
    return new Promise((resolve, reject) => {
      const url = `https://api.github.com/user/starred/${owner}/${repo}`;

      const req = https.request(url, this.options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));

        res.on("end", () => {
          if (res.statusCode === 204) {
            resolve(true);
          } else {
            const error = new Error(data);
            error.statusCode = res.statusCode;
            reject(error);
          }
        });
      });

      req.on("error", reject);
      req.end();
    });
  }

  async removeStars(startIndex = 1, endIndex = Infinity) {
    try {
      const content = await fs.readFile("stars.txt", "utf8");
      const repos = content
        .split("Repository [")
        .slice(1)
        .map((block) => {
          const lines = block.split("\n");
          const repoLine = lines[0];
          const repoName = repoLine.split("]: ")[1];
          const index = parseInt(repoLine.split("]: ")[0]);
          return { index, repoName };
        });

      console.log(`Found ${repos.length} starred repositories`);

      const toProcess = repos.filter(
        (r) => r.index >= startIndex && r.index <= endIndex
      );
      console.log(
        `Processing ${
          toProcess.length
        } repositories (from #${startIndex} to #${Math.min(
          endIndex,
          repos.length
        )})`
      );

      let successCount = 0;
      let failCount = 0;

      for (const repo of toProcess) {
        const [owner, repoName] = repo.repoName.split("/");
        try {
          await this.unstar(owner, repoName);
          console.log(`✓ [${repo.index}] Unstarred: ${repo.repoName}`);
          successCount++;
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          if (error.statusCode === 403) {
            console.error(
              `✗ [${repo.index}] Permission error: ${repo.repoName}`
            );
            console.error(
              "Token permission insufficient, please check token scope"
            );
            console.error(`Success: ${successCount}, Failed: ${failCount + 1}`);
            process.exit(1);
          } else {
            console.error(
              `✗ [${repo.index}] Failed to unstar: ${repo.repoName}`,
              error.message
            );
            failCount++;
            continue;
          }
        }
      }

      console.log("Completed!");
      console.log(`Success: ${successCount}, Failed: ${failCount}`);
    } catch (error) {
      console.error("Error occurred:", error.message);
      process.exit(1);
    }
  }
}

async function main() {
  try {
    const remover = new GitHubStarsRemover();
    const args = process.argv.slice(2);
    const startIndex = parseInt(args[0]) || 1;
    const endIndex = parseInt(args[1]) || Infinity;

    await remover.removeStars(startIndex, endIndex);
  } catch (error) {
    console.error("Error occurred:", error.message);
    process.exit(1);
  }
}

main();
