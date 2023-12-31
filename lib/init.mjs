import os from "node:os"
import path from "node:path"
import fs from "fs-extra"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const plat = os.platform()

const copy =(a, b)=> {
  if (fs.existsSync(b)) {
    fs.copy(a, `${b}.new`)
  } else {
    fs.copy(a, b)
  }
}

if (plat == "win32") {
  const root = process.env.ALLUSERSPROFILE
  const base = path.join(root, "scroll")
  const skel = path.join(__dirname, "..", "skel")
  const conf = "scroll.yaml"
  const keyf = "key"
  fs.mkdirp(base)
  copy(path.join(skel, conf), path.join(base, conf))
  copy(path.join(skel, keyf), path.join(base, keyf))
}
