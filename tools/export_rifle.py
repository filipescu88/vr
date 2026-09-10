"""Export the visual MOHAC asset; run with Blender --background --python.
Usage: blender --background --python tools/export_rifle.py -- source.blend output.glb
The source file is read only and never saved.
"""
import bpy
import sys
import math
from pathlib import Path
from mathutils import Matrix, Vector
source, output = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.open_mainfile(filepath=str(Path(source).resolve()))
bpy.ops.object.select_all(action='DESELECT')
objects = [o for o in bpy.context.scene.objects if o.type in {'MESH', 'FONT', 'CURVE'} and any(c.name.startswith(('01', '02', '03', '04')) for c in o.users_collection)]
for o in objects:
    o.select_set(True)
bpy.context.view_layer.objects.active = objects[0]
bpy.ops.object.convert(target='MESH')
# Grip at origin, barrel along Blender +Y (glTF -Z), top along glTF +Y.
transform = Matrix.Rotation(math.pi / 2, 4, 'Z') @ Matrix.Translation(Vector((.16, 0, .07)))
for o in bpy.context.selected_objects:
    o.matrix_world = transform @ o.matrix_world
# Preserve base PBR appearance; procedural Blender noise is not portable to glTF.
for mat in bpy.data.materials:
    if not mat.use_nodes:
        continue
    bs = mat.node_tree.nodes.get('Principled BSDF')
    if bs:
        for name in ('Normal', 'Roughness'):
            for link in list(bs.inputs[name].links):
                mat.node_tree.links.remove(link)
bpy.ops.object.join()
obj = bpy.context.object
obj.name = 'MOHAC_Visual_Model'
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
obj.data.calc_loop_triangles()
print('EXPORT_TRIANGLES', len(obj.data.loop_triangles))
print('EXPORT_BOUNDS', [list(v) for v in obj.bound_box])
Path(output).parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(Path(output).resolve()), export_format='GLB', use_selection=True, export_apply=True, export_animations=False, export_cameras=False, export_lights=False)
print('EXPORT_BYTES', Path(output).stat().st_size)
