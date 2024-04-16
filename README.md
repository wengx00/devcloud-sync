# DevCloud 同步本机

## 介绍

在 DevCloud 上监听指定目录下的文件变化，并向本地主机发起同步通知，本地主机基于 SFTP 从开发机拉取更改的文件同步到本地指定目录

为什么这么麻烦呢？因为本地主机和 DevCloud 的关系有点像 Client / Server，请求的发起必然是单向的，比如我可以在本地主机主动使用 ssh 控制开发机，但是反过来就不行，所以如果我想让 DevCloud 的东西能实时同步到本机，就需要使用 WebSocket 来实时通知本地主机，再由本地主机发起拉取请求。

为什么有这种需求😵 还不是因为我的本地主机太捞了。。。带着我司的 CLI 的小程序，通常需要开启一个 vscode ~~快乐coding~~、一个 shell 来开脚手架 `yarn dev`，然后再加上体验极差的微信开发者工具来编译/预览/调试，就成功把 CPU 和内存全部跑满了。所以为了快乐的 coding 并且早点下班，我希望可以利用 DevCloud 来把 coding 和脚手架构建的任务分离出去，本地主机只留下了甩不掉的微信开发者工具。。。

## 连接配置

你需要更改 `client.ts` 的 `devCloudInfo` 中的开发机 host、SSH 端口、远程的 `/path/to/dist`（必须是绝对路径）、以及本地存有的连接私钥

连接私钥可以上 iOA 的云研发上看如何获取，其实就是在 `~/.ssh` 中，具体的文件名请看 iOA

## Run

1. 拉取依赖

   ```bash
   yarn
   ```

2. 构建

   ```bash
   yarn build
   ```

3. 运行

   ```bash
   # 在 DevCloud 上
   yarn start:server /path/to/dist
   # 在本地主机上
   yarn start:client /path/to/dist
   ```

然后就可以愉快的 coding 了~