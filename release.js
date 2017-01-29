'use strict';

const Bluebird = require('bluebird');
const fs       = require('fs');
const nodegit  = require('nodegit-flow');
const semver   = require('semver');
const yargs    = require('yargs');

const argv = yargs
	.fail((message, error) => {
		console.error(message);
		if (error) console.error(error.stack);
		process.exit();
	})
	.option('b', {
		alias: 'bump',
		choices: ['major', 'minor', 'patch'],
		default: 'patch',
		describe: 'Version bump type'
	})
	.help()
	.wrap(null)
	.argv;

const pkgPath = 'package.json';
const pkg     = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const newVer  = semver.inc(pkg.version, argv.bump);
const repo    = nodegit.Repository.open('./');

const startRelease = () => {
	return repo.then(repo => {
		return nodegit.Flow
			.startRelease(repo, newVer);
	});
};
const updateVersion = () => {
	pkg.version = newVer;
	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
	return Bluebird
		.resolve();
};
const commitUpdates = () => {
	return repo
		.then(repo => {
			const signature = nodegit.Signature.default(repo);
			const message   = `Update version string to ${newVer}`;
			return repo
				.createCommitOnHead([pkgPath], signature, signature, message);
		});
};
const finishRelease = () => {
	return repo.then(repo => {
		return nodegit.Flow
			.finishRelease(repo, newVer);
	});
};
const pushRelease = () => {
	return repo
		.then(repo => {
			return repo
				.getRemote('origin');
		})
		.then(remote => {
			return remote.push([
				"refs/heads/master:refs/heads/master",
				"refs/heads/develop:refs/heads/develop",
				`refs/tags/${newVer}:refs/tags/${newVer}`
			], {
				callbacks: {
					credentials: (url, username) => {
						return nodegit.Cred
							.sshKeyFromAgent(username);
					}
				}
			});
		});
};
const checkoutDevelop = () => {
	return repo.then(repo => {
		return nodegit.Flow
			.getDevelopBranch(repo)
			.then(develop => {
				return repo
					.checkoutBranch(develop);
			});
	});
};
startRelease()
	.then(updateVersion)
	.then(commitUpdates)
	.then(finishRelease)
	.then(checkoutDevelop)
	.then(pushRelease)
	.then(() => {
		console.log(`Version ${newVer} released!`);
	})
	.catch(error => {
		console.error(error);
		console.error(error.stack);
	});
