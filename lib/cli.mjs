/* scroll backup system                                     ____  __ ____  __  
   by 0E9B061F <0E9B061F@protonmail.com>                   |    \|  |    \|  | 
This Source Code Form  is subject to  the terms of        ====\  \=====\  \====
the  Mozilla Public License,  v. 2.0. If a copy of         |__|\____|__|\____| 
the MPL  was not distributed  with this  file, You             2020 - 2024
can obtain one at https://mozilla.org/MPL/2.0/.                
*/

const aliases = {
  h: "host",
  s: "subhost",
  rc: "rcfile",
  key: "keyfile",
  log: "logfile",
}

export class CommandLine {
  constructor(...args) {
    let acceptopt = true
    this.args = args
    this.cmd = null
    const re = /^([^:]+):(.*?)$/
    this.out = []
    this.rc = {}
    args.forEach(arg => {
      if (acceptopt) {
        const match = arg.match(re)
        if (match) {
          let key = match[1]
          const val = match[2]
          if (aliases[key]) key = aliases[key]
          this.rc[key] = val
        } else if (!this.cmd) {
          this.cmd = arg
        } else {
          this.out.push(arg)
          acceptopt = false
        }
      } else {
        this.out.push(arg)
      }
    })
  }
}

export class CommandSet {
  constructor(conf) {
    this.conf = conf
    this.index = {}
    this.all = []
  }
  make(...args) {
    const cmd = new Command(...args)
    cmd.names.forEach(name => {
      if (this.index[name]) {
        throw new Error(`command already exists: ${name}`)
      } else {
        this.index[name] = cmd
      }
    })
    this.all.push(cmd)
  }
  resolve(name) {
    if (this.index[name]) return this.index[name]
    else {
      console.log(`ERROR: No such command: ${name}`)
      console.log()
      this.help()
      process.exit(1)
    }
  }
  async run(name, ...args) {
    const cmd = this.resolve(name)
    return await cmd.block(this.conf, ...args)
  }
  async exec() {
    this.conf.logger.msg(this.conf.line.args.join(" "))
    await this.run(this.conf.line.cmd, ...this.conf.line.out)

  }
  help(cmd) {
    if (this.conf.util.iswild(cmd)) {
      console.log(`scroll [OPTIONS] COMMAND [OPTIONS] [ARG...]`)
      console.log()
      console.log("COMMANDS:")
      this.all.forEach(cmd => cmd.print_help())
    } else {
      cmd = this.resolve(cmd)
      cmd.print_help()
    }
  }
}

export class Command {
  constructor(name, help, block) {
    this.names = name.split(":")
    this.name = this.names[0]
    this.aliases = this.names.slice(1)
    this.block = block
    this.help = help
  }
  print_help() {
    console.log(`${this.names.join(" / ")} ${this.help.sig}`)
    console.log(`  ${this.help.info}`)
  }
}
