import * as OBJ from 'obj-file-parser';

function loadFromPath(path: string) {
    const t =
        fetch(path)
        .then(results => results.text())
        .then((file) => {/*console.log(file);*/ return new OBJ(file.toString()).parse();})
        .catch(err => alert(`Couldn't load file due to error: ${err}`));
    return t;
}
let t: OBJ.ObjFile | void;
async function getObj() {
    let result: OBJ.ObjFile | void = await loadFromPath('resources/box.obj');
    t = result;
    return result
}

async function doTask(){
    let data = await getObj();
    console.log(data)
}
doTask();