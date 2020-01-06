#!/usr/bin/env node
const program = require('commander');
var vfs = require('vinyl-fs');
var through = require('through2');
var chalk = require('chalk');
var fs = require('fs-extra');
var path = require('path');
console.log('errrrr')
// 定义版本号以及命令选项
program
  .version('1.0.0')
  .option('-i --init [name]', 'init a project', 'myFirstProject')

program.parse(process.argv);

if (program.init) {
  // 获取将要构建的项目根目录
  var projectPath = path.resolve(program.init);
  // 获取将要构建的的项目名称
  var projectName = path.basename(projectPath);
  var dirName = chalk.green(projectPath)
  console.log('Start to init a project in ' + dirName);

  // 根据将要构建的项目名称创建文件夹
  fs.ensureDirSync(projectName);

  // 获取本地模块下的demo1目录
  var cwd = path.join(__dirname, '../template/demo1');

  // 从demo1目录中读取除node_modules目录下的所有文件并筛选处理
  vfs.src(['**/*', '!node_modules/**/*'], { cwd: cwd, dot: true }).
  pipe(through.obj(function (file, enc, callback) {
    if (!file.stat.isFile()) {
      return callback();
    }
    console.log('file:', file[0])
    this.push(file);
    return callback();
  }))
    // 将从demo1目录下读取的文件流写入到之前创建的文件夹中
    .pipe(vfs.dest(projectPath))
    .on('end', function () {
      console.log('Installing packages...')

      // 将node工作目录更改成构建的项目根目录下
      process.chdir(projectPath);

      // 执行安装命令
      require('../lib/install');
    })
    .resume();
}
