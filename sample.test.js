#!/usr/bin/env node
// 处理用户输入的命令
const program = require('commander');
// 下载模板
const download = require('download-git-repo');
// 问题交互
const inquirer = require('inquirer');
// node 文件模块
const fs = require('fs');
// 填充信息至文件
const handlebars = require('handlebars');
// 动画效果
const ora = require('ora');
// 字体加颜色
const chalk = require('chalk');
// 显示提示图标
const symbols = require('log-symbols');
// 命令行操作
var shell = require("shelljs");

program.version('1.0.1', '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt([
        {
          name: 'description',
          message: 'Input the object description'
        },
        {
          name: 'author',
          message: 'Input the object author'
        }
      ]).then((answers) => {
        const spinner = ora('Downloading...');
        spinner.start();
        download('zxpsuper/suporka-parcel-vue', name, (err) => {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
          } else {
            spinner.succeed();
            const fileName = `${name}/package.json`;
            const meta = {
              name,
              description: answers.description,
              author: answers.author
            }
            if (fs.existsSync(fileName)) {
              const content = fs.readFileSync(fileName).toString();
              const result = handlebars.compile(content)(meta);
              fs.writeFileSync(fileName, result);
            }
            console.log(symbols.success, chalk.green('The vue object has downloaded successfully!'));
            inquirer.prompt([
              {
                type: 'confirm',
                name: 'ifInstall',
                message: 'Are you want to install dependence now?',
                default: true
              }
            ]).then((answers) => {
              if (answers.ifInstall) {
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'installWay',
                    message: 'Choose the tool to install',
                    choices: [
                      'npm', 'cnpm'
                    ]
                  }
                ]).then(ans => {
                  if (ans.installWay === 'npm') {
                    let spinner = ora('Installing...');
                    spinner.start();
                    // 命令行操作安装依赖
                    shell.exec("cd " + name + " && npm i", function (err, stdout, stderr) {
                      if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                      }
                      else {
                        spinner.succeed();
                        console.log(symbols.success, chalk.green('The object has installed dependence successfully!'));
                      }
                    });
                  } else {
                    let spinner = ora('Installing...');
                    spinner.start();
                    shell.exec("cd " + name + " && cnpm i", function (err, stdout, stderr) {
                      if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                      }
                      else {
                        spinner.succeed();
                        console.log(symbols.success, chalk.green('The object has installed dependence successfully!'));
                      }
                    })
                  }
                })
              } else {
                console.log(symbols.success, chalk.green('You should install the dependence by yourself!'));
              }
            })
          }
        })
      })
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('The object has exist'));
    }
  });
program.parse(process.argv);
