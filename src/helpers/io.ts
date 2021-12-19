import * as OBJ from 'obj-file-parser';

function loadModelFromObj(path: string) {
    return new OBJ('f 1 2 3 4').parse();
}

export { loadModelFromObj };

const fr = new FileReader();