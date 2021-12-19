import * as FS from 'fs';
import * as OBJ from 'obj-file-parser';

function loadModelFromObj(path: string) {
    return new OBJ(FS.readFileSync(path, 'utf8')).parse();
}

export { loadModelFromObj };