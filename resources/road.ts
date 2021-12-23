import * as ObjFileParser from "obj-file-parser";

const roadObjString: string = `
# Blender v3.0.0 OBJ File: 'bus2.blend'
# www.blender.org
mtllib road.mtl
o Plane.001_Plane.002
v -15.000000 0.000000 100.000000
v 15.000000 0.000000 100.000000
v -15.000000 0.000000 -100.000000
v 15.000000 0.000000 -100.000000
vt 0.009804 0.990196
vt 0.990196 0.990196
vt 0.990196 0.009804
vt 0.009804 0.009804
vn 0.0000 1.0000 0.0000
usemtl Material.003
s off
f 2/1/1 1/2/1 3/3/1
f 2/1/1 3/3/1 4/4/1
`;

export const roadObj: ObjFileParser.ObjFile = new ObjFileParser(roadObjString).parse();