import { copyFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";

await Promise.all([
    copyFile(join(cwd(), './special/packets.js'), join(cwd(), './dist/packets/packets.js')),
    copyFile(join(cwd(), './special/packets.d.ts'), join(cwd(), './dist/packets/packets.d.ts')),
    copyFile(join(cwd(), './special/extra.js'), join(cwd(), './dist/packets/extra.js')),
    copyFile(join(cwd(), './special/extra.d.ts'), join(cwd(), './dist/packets/extra.d.ts'))
])