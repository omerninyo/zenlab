import bpy
import math
import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def make_pbr_mat(name, base_color=(0.8, 0.8, 0.8, 1.0), metallic=0.5, roughness=0.25, emission_color=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name=name)
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness
        if emission_color is not None:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission_color
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = emission_color
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def add_bevel_and_uv(obj, width=0.04, segments=3):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    mod = obj.modifiers.new(name="Bevel", type='BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.shade_smooth()
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66.0), island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)


def build_zen_robot():
    clear_scene()

    mat_titanium = make_pbr_mat("ZenTitanium", (0.86, 0.90, 0.96, 1.0), metallic=0.75, roughness=0.22)
    mat_dark_metal = make_pbr_mat("ZenDarkAlloy", (0.10, 0.14, 0.22, 1.0), metallic=0.85, roughness=0.30)
    mat_visor = make_pbr_mat("ZenVisor", (0.04, 0.08, 0.16, 1.0), metallic=0.2, roughness=0.08, emission_color=(0.15, 0.75, 0.98, 1.0), emission_strength=2.2)
    mat_gold = make_pbr_mat("ZenGold", (0.98, 0.75, 0.14, 1.0), metallic=0.90, roughness=0.18, emission_color=(0.98, 0.65, 0.10, 1.0), emission_strength=1.2)
    mat_cyan_glow = make_pbr_mat("ZenCyanGlow", (0.13, 0.83, 0.93, 1.0), metallic=0.3, roughness=0.15, emission_color=(0.13, 0.83, 0.93, 1.0), emission_strength=3.0)
    mat_indigo_glow = make_pbr_mat("ZenIndigoGlow", (0.50, 0.55, 0.97, 1.0), metallic=0.6, roughness=0.2, emission_color=(0.45, 0.50, 0.98, 1.0), emission_strength=2.5)
    mat_emerald_glow = make_pbr_mat("ZenEmeraldGlow", (0.20, 0.83, 0.60, 1.0), metallic=0.4, roughness=0.15, emission_color=(0.20, 0.83, 0.60, 1.0), emission_strength=3.0)

    # 1. Torso Chassis
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.95))
    torso = bpy.context.active_object
    torso.name = "Zen_Torso"
    torso.scale = (0.55, 0.42, 0.52)
    bpy.ops.object.transform_apply(scale=True)
    add_bevel_and_uv(torso, width=0.08, segments=4)
    torso.data.materials.append(mat_titanium)

    # Chest Core Reactor
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=0.10, location=(0, -0.40, 0.98), rotation=(math.radians(90), 0, 0))
    core = bpy.context.active_object
    core.name = "Zen_ChestCore"
    add_bevel_and_uv(core, width=0.02, segments=2)
    core.data.materials.append(mat_cyan_glow)

    # 2. Head Pod
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 1.68))
    head = bpy.context.active_object
    head.name = "Zen_Head"
    head.scale = (0.64, 0.50, 0.44)
    bpy.ops.object.transform_apply(scale=True)
    add_bevel_and_uv(head, width=0.10, segments=4)
    head.data.materials.append(mat_titanium)

    # Visor Faceplate
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.46, 1.68))
    visor = bpy.context.active_object
    visor.name = "Zen_Visor"
    visor.scale = (0.50, 0.08, 0.28)
    bpy.ops.object.transform_apply(scale=True)
    add_bevel_and_uv(visor, width=0.03, segments=3)
    visor.data.materials.append(mat_visor)

    # Antenna Stalk & Tip
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.035, depth=0.28, location=(0, 0, 2.22))
    stalk = bpy.context.active_object
    stalk.name = "Zen_AntennaStalk"
    stalk.data.materials.append(mat_dark_metal)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.09, location=(0, 0, 2.40))
    tip = bpy.context.active_object
    tip.name = "Zen_AntennaOrb"
    bpy.ops.object.shade_smooth()
    tip.data.materials.append(mat_gold)

    # Hover Thruster Base Cone
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.36, radius2=0.18, depth=0.35, location=(0, 0, 0.32))
    thruster = bpy.context.active_object
    thruster.name = "Zen_Thruster"
    add_bevel_and_uv(thruster, width=0.02, segments=2)
    thruster.data.materials.append(mat_dark_metal)

    # Floating Hands (Left & Right)
    for side, x_pos in [("L", -0.72), ("R", 0.72)]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.14, location=(x_pos, -0.05, 0.95))
        hand = bpy.context.active_object
        hand.name = f"Zen_Hand_{side}"
        hand.scale = (0.85, 1.1, 1.25)
        bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.shade_smooth()
        hand.data.materials.append(mat_titanium)

    # UPGRADE 1: Upgrade_visor_cyber (Cyber X-Ray Goggles)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.52, 1.72))
    u_visor = bpy.context.active_object
    u_visor.name = "Upgrade_visor_cyber"
    u_visor.scale = (0.58, 0.10, 0.14)
    bpy.ops.object.transform_apply(scale=True)
    add_bevel_and_uv(u_visor, width=0.025, segments=3)
    u_visor.data.materials.append(mat_cyan_glow)

    # UPGRADE 2: Upgrade_ears_plasma (Magnetic Jet Wings)
    wings = []
    for side, x_pos, rot_z in [("L", -0.68, 0.25), ("R", 0.68, -0.25)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_pos, 0.12, 1.10), rotation=(0, math.radians(rot_z * 60), 0))
        w = bpy.context.active_object
        w.scale = (0.36, 0.08, 0.46)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        add_bevel_and_uv(w, width=0.02, segments=2)
        w.data.materials.append(mat_indigo_glow)
        wings.append(w)
    bpy.ops.object.select_all(action='DESELECT')
    for w in wings:
        w.select_set(True)
    bpy.context.view_layer.objects.active = wings[0]
    bpy.ops.object.join()
    wings[0].name = "Upgrade_ears_plasma"

    # UPGRADE 3: Upgrade_crown_radar (Star Navigator Crown)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.34, minor_radius=0.055, location=(0, 0, 2.16))
    crown = bpy.context.active_object
    crown.name = "Upgrade_crown_radar"
    bpy.ops.object.shade_smooth()
    crown.data.materials.append(mat_gold)

    # UPGRADE 4: Upgrade_halo_neural (Master Neural Halo)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.58, minor_radius=0.04, location=(0, 0, 2.52), rotation=(math.radians(12), 0, 0))
    halo = bpy.context.active_object
    halo.name = "Upgrade_halo_neural"
    bpy.ops.object.shade_smooth()
    halo.data.materials.append(mat_emerald_glow)

    out_path = os.path.join(OUTPUT_DIR, "zen_robot.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format='GLB', export_apply=True)
    print("Exported:", out_path)


def build_lab_props():
    clear_scene()

    mat_apple = make_pbr_mat("FruitAppleRed", (0.92, 0.12, 0.18, 1.0), metallic=0.10, roughness=0.16)
    mat_leaf = make_pbr_mat("FruitLeafGreen", (0.15, 0.78, 0.32, 1.0), metallic=0.05, roughness=0.30)
    mat_melon = make_pbr_mat("FruitMelonGreen", (0.08, 0.62, 0.28, 1.0), metallic=0.08, roughness=0.22)
    mat_pedestal = make_pbr_mat("HoloPedestalAlloy", (0.12, 0.16, 0.26, 1.0), metallic=0.82, roughness=0.24)
    mat_gold_switch = make_pbr_mat("SwitchGold", (0.95, 0.72, 0.15, 1.0), metallic=0.88, roughness=0.18, emission_color=(0.95, 0.65, 0.10, 1.0), emission_strength=0.8)
    mat_arch_glow = make_pbr_mat("ArchCyan", (0.15, 0.78, 0.96, 1.0), metallic=0.5, roughness=0.2, emission_color=(0.15, 0.78, 0.96, 1.0), emission_strength=2.0)

    # 1. Glossy 3D Apple (Prop_Apple)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=0.45, location=(0, 0, 0.45))
    apple = bpy.context.active_object
    apple.name = "Prop_Apple"
    apple.scale = (1.0, 1.0, 0.88)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    apple.data.materials.append(mat_apple)

    bpy.ops.mesh.primitive_cube_add(size=0.18, location=(0.12, 0, 0.92), rotation=(0, math.radians(30), 0))
    leaf = bpy.context.active_object
    leaf.scale = (1.4, 0.6, 0.3)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    add_bevel_and_uv(leaf, width=0.02, segments=2)
    leaf.data.materials.append(mat_leaf)

    bpy.ops.object.select_all(action='DESELECT')
    apple.select_set(True)
    leaf.select_set(True)
    bpy.context.view_layer.objects.active = apple
    bpy.ops.object.join()
    apple.name = "Prop_Apple"

    # 2. Glossy 3D Watermelon (Prop_Watermelon)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=0.52, location=(0, 0, 0.52))
    melon = bpy.context.active_object
    melon.name = "Prop_Watermelon"
    melon.scale = (1.22, 0.95, 0.95)
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()
    melon.data.materials.append(mat_melon)

    # 3. Beveled Holographic Table Base (Prop_HoloBase)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=1.8, depth=0.35, location=(0, 0, 0.18))
    base = bpy.context.active_object
    base.name = "Prop_HoloBase"
    add_bevel_and_uv(base, width=0.05, segments=3)
    base.data.materials.append(mat_pedestal)

    # 4. Mechanical Switch (Prop_MechanicalSwitch)
    bpy.ops.mesh.primitive_cube_add(size=0.8, location=(0, 0, 0.25))
    sw = bpy.context.active_object
    sw.name = "Prop_MechanicalSwitch"
    sw.scale = (1.0, 1.0, 0.45)
    bpy.ops.object.transform_apply(scale=True)
    add_bevel_and_uv(sw, width=0.06, segments=3)
    sw.data.materials.append(mat_gold_switch)

    # 5. Logic Gate / Portal Arch (Prop_LogicGateArch)
    bpy.ops.mesh.primitive_torus_add(major_radius=1.4, minor_radius=0.14, location=(0, 0, 1.4), rotation=(math.radians(90), 0, 0))
    arch = bpy.context.active_object
    arch.name = "Prop_LogicGateArch"
    bpy.ops.object.shade_smooth()
    arch.data.materials.append(mat_arch_glow)

    out_path = os.path.join(OUTPUT_DIR, "lab_props.glb")
    bpy.ops.export_scene.gltf(filepath=out_path, export_format='GLB', export_apply=True)
    print("Exported:", out_path)


if __name__ == "__main__":
    build_zen_robot()
    build_lab_props()
