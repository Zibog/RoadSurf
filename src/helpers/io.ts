//import * as FS from 'fs';
import * as OBJ from 'obj-file-parser';

function loadModelFromObj(path: string) {
    //return new OBJ(FS.readFileSync(path, 'utf8')).parse();
}

export { loadModelFromObj };

const fr = new FileReader();
const file = new File([], 'resources/box.obj');
fr.readAsText(file);
export {}

fetch('resources/box.obj')
    .then(response => response.text())
    .then(data => {
        // Do something with your data
        console.log(data);
    });