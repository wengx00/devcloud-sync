/*
 * @Author: wengx00 wengx86@163.com
 * @Date: 2024-05-17 13:32:06
 * Copyright (c) 2024 by wengx00, All Rights Reserved.
 */
import chalk from "chalk";
import { existsSync, mkdirSync, readFileSync } from "fs";
import SFTP from "ssh2-sftp-client";
import WebSocket from "ws";

// 开发机的信息
const devCloudInfo = {
	host: "192.168.1.2",
	username: "root",
	port: 36000, // SSH 端口
	wsPort: 8001, // WebSocket 端口，一般不需要改变
	remoteRootPath: "Don't modify this property", // 不要改变它
	privateKey: readFileSync("/path/to/privateKeyFile").toString(),
};

let handShake = true;

const rootPath = process.argv[2];

if (!rootPath) {
	console.log(chalk.red("[ERROR]"), "No root path specified");
	process.exit(1);
}

const sftp = new SFTP();
sftp
	.connect({
		host: devCloudInfo.host,
		port: devCloudInfo.port,
		username: devCloudInfo.username,
		privateKey: devCloudInfo.privateKey,
	})
	.then(() => {
		console.log(chalk.grey("[SFTP]"), "Connected to server");
		handShake = true;
		const ws = new WebSocket(
			`ws://${devCloudInfo.host}:${devCloudInfo.wsPort}`
		);
		ws.on("message", (data) => {
			const path = data.toString("utf8");
			if (handShake) {
				handShake = false;
				devCloudInfo.remoteRootPath = path;
				console.log("[INFO]", "Remote root path is", chalk.blue(path));
				return;
			}
			console.log(
				chalk.grey("[WS]"),
				"Received changed file",
				chalk.yellow(path)
			);
			const splittedPath = path.split("/").filter((item) => item.length);
			let currentPath = rootPath;
			splittedPath.forEach((pathPart, index) => {
				currentPath += "/" + pathPart;
				if (index === splittedPath.length - 1) return;
				if (!existsSync(currentPath)) {
					mkdirSync(currentPath);
				}
			});
			// 传输文件
			sftp
				.fastGet(`${devCloudInfo.remoteRootPath}/${path}`, currentPath)
				.then(() => {
					console.log(
						chalk.grey("[SFTP]"),
						"Downloaded file",
						chalk.yellow(path)
					);
				})
				.catch((err) => {
					console.log(
						chalk.red("[SFTP]"),
						"Download file",
						chalk.yellow(path),
						"failed",
						err
					);
				});
		});
	})
	.catch((err) => {
		console.log(chalk.red("[SFTP]"), "Failed to connect to server", err);
		process.exit(1);
	});
