+++
title = "Polywog: Seeking Alpha Testers for a 2D Rust Game Framework"
slug = "polywog-alpha"
description = "Polywog is a 2D game framework that aims to be a MonoGame/Love2D/Raylib equivalent for Rust."
draft = true

[taxonomies]
tags = ["rust"]

[extra]
has_toc = true
+++

> <i class="ri-error-warning-line"></i>
> This library is currently in an **UNSTABLE ALPHA STATE** and should not be used for real
> projects at this time! 

![The polywog mascot](banner.png)

## Introduction

### A 2D Rust Game Framework

Polywog is an approachable, cross-platform pure code framework for creating 2D games in Rust. It's
basically a Rust-powered equivalent to [MonoGame](https://monogame.net/),
[LÖVE](https://www.love2d.org/), and [raylib](https://www.raylib.com/).

Today I have open sourced the project with the intent of finding **alpha testers** and
**more contributors** and the ultimate goal of polishing, stabilizing, and eventually releasing the
project as a serious and reliable game development tool in the Rust ecosystem.

- [<i class="ri-github-fill"></i> **SOURCE CODE**](https://github.com/feyworks/polywog)</span>
- [<i class="ri-discord-fill"></i> **DISCORD SERVER**](https://discord.gg/AYjNw9WHJa)

If you're interested in contacting me directly about the project, my contact information is at the
bottom of the page.

## Features

Polywog provides:

- 🌍 cross platform support for Windows (DX12), Linux (Vulkan) and macOS (Metal)
- 🖥️ a window, game loop, and rendering context out of the box and ready to go
- 🎮 mouse, keyboard, and gamepad input as well as virtual input mapping
- 🖼️ shaders, surfaces, textures, and other graphics resources
- 🖌️ a straightforward but powerful canvas-style drawing API
- 🧮 math types for working with vectors, matrices, rotations, etc.
- 📐 geometry types for various shapes, overlap testing, extraction, raycasting, etc.
- 🎨 image encoding/decoding, operate on pixels and different color formats
- 🧳 texture packing and other techniques for rendering optimization
- 🌀 random numbers, 2D arrays and algorithms, GUIDs, and more
- 🦀 full access to Rust's speed, power, ecosystem, and pleasure of use
- 🌙 full Lua bindings if desired, with LuaLS type annotations

Polywog is a pure-code framework that programmers can use to code their games or even to build their
own game engines. It is not a *game engine* itself, like [Godot](https://godotengine.org/) or
[Unity](https://unity.com/), so it has no editor nor concept of worlds and game objects.



## Quick Example

Here's a sample of a simple game that handles keyboard input, draws an image, a shape, and some
text. All very common things you'd expect a game to be able to do.

> Rust Code
```rust
use polywog::prelude::*;

fn main() -> Result<(), GameError> {
    env_logger::init();

    // create a game, set some options, and then run it
    polywog::new_game()
        .with_title("My Game")
        .with_size(1280, 720)
        .run::<MyGame>(())
}

// the game state is stored in a struct however you want
pub struct MyGame {
    counter: u32,
    image: Texture,
    noto_sans: Font,
}

impl Game for MyGame {
    type Config = ();

    // initialize your game state here, such as creating graphics resources, etc.
    fn new(ctx: &Context, cfg: Self::Config) -> Result<Self, GameError>
    where
        Self: Sized,
    {
        // create a texture out of a PNG embedded directly into the executable
        let image = ctx
            .graphics
            .load_png_from_file("assets/image.png", true)?;

        // load a font atlas out of an embedded TTF pixel font
        // we can easily report a custom error if the font fails to pack
        let (noto_sans, _) = ctx
            .graphics
            .load_ttf_file("assets/NotoSans-Regular.ttf", 48.0, false)?
            .ok_or_else(|| GameError::custom("failed to pack font atlas"))?;

        // create the game state
        Ok(Self {
            counter: 0,
            image,
            noto_sans,
        })
    }

    // perform your game logic here
    fn update(&mut self, ctx: &Context) -> Result<(), GameError> {
        if ctx.keyboard.pressed(Key::Space) {
            self.counter += 1;
        }
        Ok(())
    }

    // perform your drawing code here
    fn render(&mut self, ctx: &Context, draw: &mut Draw) -> Result<(), GameError> {
        // draw the image in the center of the window
        let top_left = (ctx.window.size() - self.image.size()) / 2;
        draw.texture_at(&self.image, top_left.to_f32());

        // draw a circle at the mouse position
        draw.circle(circle(ctx.mouse.pos(), 50.0), Rgba8::ORANGE_RED, None);

        // draw our spacebar counter
        let txt = format!("SPACE pressed {} times", self.counter);
        draw.text(&txt, vec2(8.0, 48.0), &self.noto_sans, Rgba8::WHITE, None);

        Ok(())
    }
}
```

<video width="100%" controls>
  <source src="example_code.mp4" type="video/mp4">
</video>

## Feature Breakdown

### Window & Game Loop

Polywog sets you up with a single window, rendering context, and a game loop to do your business in.
Your game has three callbacks:

- **`new()`** for initialization
- **`update()`** for game logic
- **`render()`** for drawing

These callbacks are passed a `Context` that gives you access to six core systems:

- **`Window`** for window and monitor access
- **`Time`** for the game timer, FPS, and delta time
- **`Mouse`** for mouse position, scrolling, and button handling
- **`Keyboard`** for keyboard and text input handling
- **`Gamepads`** for controller detection and input handling
- **`Graphics`** for creating textures, surfaces, shaders, and more

### Input Handling

Keyboard and mouse input are straightforward.

> Rust Code
```rust
// if spacebar is held down this frame
if ctx.keyboard.down(Key::Space) {
    
}

// if enter was pressed this frame
if ctx.keyboard.pressed(Key::Enter) {
    
}

// if escape was released this frame
if ctx.keyboard.released(Key::Escape) {
    
}

// if the left mouse button was pressed this frame
if ctx.mouse.pressed(MouseButton::Left) {
    // position of the mouse cursor
    let click_pos = ctx.mouse.pos();
}
```

Gamepad input is a bit more involved since you may want to listen to or respond to multiple at
once that may be connected or disconnected at any point.

> Rust Code
```rust
// find the gamepad last interacted with
if let Some(pad) = ctx.gamepads.last_active() {
    // get the x/y axes of the left stick [-1, 1]
    let x_axis = pad.axis(GamepadAxis::LeftX);
    let y_axis = pad.axis(GamepadAxis::LeftY);

    // get the value of the left trigger [0, 1]
    let left_trigger = pad.value(GamepadButton::LeftTrigger);

    // the right bumper was pressed this frame
    if pad.pressed(GamepadButton::RightBumper) {}
}
```

There is also a draft for a *virtual input system* that can be used to handle keyboard/gamepad
input simultaneously, handle control mapping, and eventually even enable remote controls.

### Graphics Resources

Polywog allows you to load drawable textures (images) in many ways: manually, from embedded image
files, from memory streams, or most commonly from files on disk.

Here, we create a `Texture` directly from a PNG image file.

> Rust Code
```rust

let texture = ctx.graphics.load_png_from_file("assets/my_image.png")?;
 
```

> <i class="ri-lightbulb-line"></i>
> The texture format will match the PNG format. So if your image was a 16-bit greyscale alpha PNG,
> then the texture format will be `TextureFormat::Rg8`. If you wanted to convert all images to
> 32-bit RGBA textures, doing so is trivial.

We can create `Surface` objects as render targets, allowing us to either bake rendering or create
screen buffers for doing full-screen shader effects.

> Rust Code
```rust

let surface = ctx.graphics.create_rgba8_surface((256, 256));
 
```

The default `Shader` can do all kinds of basic rendering, but if you want to write custom shaders,
you can write them in [WGSL](https://www.w3.org/TR/WGSL/).

That shader looks like this:

> WGSL Code
```rust
@vertex
fn vert_main(vert: Vertex) -> Fragment {
    return vert_default(vert);
}

@fragment
fn frag_main(frag: Fragment) -> @location(0) vec4f {
    return frag_default(frag);
}
```

But you can write your own shader with funky effects, like this:

> WGSL Code
```rust
// all params must be in @group(0), texture params look like this:
@group(0) @binding(0)
var perlin_texture: texture_2d<f32>;

// each param gets a new @binding, incrementing by one:
@group(0) @binding(1)
var perlin_sampler: sampler;

// uniform variables can be: f32, vec2f, vec3f, mat2f, mat3f, and mat4f
@group(0) @binding(2)
var<uniform> scroll: vec2f;

@vertex
fn vert_main(vert: Vertex) -> Fragment {
    return vert_default(vert);
}

@fragment
fn frag_main(frag: Fragment) -> @location(0) vec4f {
    // sample the main texture
    var pixel = textureSample(main_texture, main_sampler, frag.tex);

    // sampler the perlin noise and tweak it a bit
    var perlin = textureSample(perlin_texture, perlin_sampler, frag.tex + scroll).r;
    perlin = pow(1 - perlin, 2);

    // get the texture's inverted pixel color
    var invert = vec4(1 - pixel.rgb, pixel.a);

    // blend between regular/inverted by a factor determined by the perlin noise
    var output = pixel * (1 - perlin) + invert * perlin;

    // perform default frag shader on the result
    return apply_mode(output, frag.col, frag.mode);
}
```

Shader parameters are set via the [drawing API](#drawing-api).

### Vectors & Matrices

Games obviously involve a lot of math and linear algebra, and so Polywog ships with a bunch of code
for doing all that good stuff. We have each of the numeric types:

- **`Vec2<T>`** for 2D vectors
- **`Vec3<T>`** for 3D vectors
- **`Vec4<T>`** for 4D vectors
- **`Mat2<T>`** for 2x2 (rotation) matrices
- **`Mat3<T>`** for 3x3 (rotation/translation/scale) matrices
- **`Mat4<T>`** for 4x4 (perspective/ortho/rotation/translation/scale) matrices
- **`Affine2<T>`** for 2D transformations
- **`Affine3<T>`** for 3D transformations

The `T` in each of these can be any of the primitive number types such as `f32`, `i32`, `u32` and
so on. Because those three are the most common, they have type aliases. So `Vec2F`, `Vec2I`, and
`Vec2U` and so on for the other types.

You can create vectors, perform math on them, transform them by matrices, and so on:

```rust
// add two vectors together, resulting in (10, 0)
let vector = vec2(8.0, 5.0) + vec2(2.0, -5.0);

// create a rotation matrix
let matrix = Mat2F::rotation(degs(90.0));

// rotate the vector by 90º resulting in ~(0, 10)
let result = matrix.transform_vec2(vec2(10.0, 0.0));
```

All numeric types in Polywog also implement the `Numeric` trait, which provides a bunch of
convenience methods for casting between them. For example, we could cast a `Vec2<i32>` into a
`Vec2<f32>` by calling `to_f32()` on it.

These types are loaded with utility functions useful to game math as well such as methods for
inerpolation, smoothing, clamping, sorting, remapping, Bézier curves, and so on.

```rust
let start = vec2(10.0, 10.0);
let end = vec2(20.0, 20.0);
let result = start.lerp(end, 0.5); // (15, 15)
```

### Directions & Rotations

There are three main types for specifying angles/rotations:

- **`Radians<T>`** for angles in radians
- **`Degrees<T>`** for angles in degrees
- **`Rotations<T>`** for angles in whole rotations

This allows you to specify angles in whatever format the situation desires. If af unction takes an
angle argument, you could pass in `rads(f32::TAU * 2.0)`, `degs(720.0)`, or `rots(2.0)` all with
the same result. Sometimes you want to just say "hey spin 2 times" and not have to convert it.

In addition to these, there are two other enum types provided for directions:

- **`Cardinal`** for 4-way directions (North, East, South, and West)
- **`Octal`** for 8-way directions (North, North East, East, South East...)

These can be useful for storing object directions and so forth, roguelike and tile-based games, and
also useful for all kinds of grid algorithms and cellular automata.

### Geometry & Collision

In addition to the vector types, Polywog comes with a full-featured 2D geometry library loaded with
useful functionality for game development.

It has basic geometric shapes:

- **`Rect<T>`** for axis-aligned rectangles
- **`Circle<T>`** for circles
- **`Triangle<T>`** for triangles
- **`Quad<T>`** for quadrilaterals
- **`Polygon<T>`** for convex polygons

These all have methods for overlap testing with all other shapes as well as extraction vectors
using the [separating-axis-theorem](https://en.wikipedia.org/wiki/Hyperplane_separation_theorem),
methods to iterate over their points and edges, and raycasting.

### RNGs & GUIDs

Random number generation and unique ID generation is so common that Polywog just makes it available
to you right out of the box.

You can create an RNG and request values from it in various ways:

> Rust Code
```rust
let mut rng = Rand::new();

println!("{}", rng.boolean());                  // true
println!("{}", rng.range::<i32>(1..=10));       // 4
println!("{}", rng.random::<f32>());            // 0.5720793
println!("{:?}", rng.choose(&['A', 'B', 'C'])); // 'C'

// the above will give different results every time
```

You can also seed the RNG to produce deterministic results:

> Rust Code
```rust
let mut rng = Rand::with_seed(123);

println!("{}", rng.boolean());                  // false
println!("{}", rng.range::<i32>(1..=10));       // 3
println!("{}", rng.random::<f32>());            // 0.64814156
println!("{:?}", rng.choose(&['A', 'B', 'C'])); // 'A'

// the above will always give the same values
```

### Images & Color

If you want to do any image processing or texture generation, an `Image` type is provided that can
work with images in various different pixel formats. You can load image files, save them, copy
images to other images, do per-pixel operations, and also load them into textures for rendering.

In addition to this, there are also a collection of types for working with colors:

- **`Rgba<T>`** for 4-channel colors
- **`Rgb<T>`** for 3-channel colors
- **`GreyAlpha<T>`** for 2-channel colors
- **`Grey<T>`** for 1-channel colors
- **`Hsv<T>`** for hue-saturation-value representation
- **`Hsl<T>`** for hue-saturation-lightness representation
- **`Oklab<T>`** for [Oklab](https://bottosson.github.io/posts/oklab/) representation

These all come with methods to easily convert between each other, convert between channel types,
interpolate between them, and so on.

### Texture Packing

Any game that wants to do a substantial amount of rendering will benefit from the ability to pack
multiple images into atlases and render them all together in batched draw calls. Polywog comes with
a `TexturePacker` for this purpose, which produces `SubTextures` that can be drawn as if they were
whole images.

You can instruct Polywog to pack images for you or load pre-baked files, whichever your asset
pipeline requires. It's even trivial to do things like write build scripts to pre-bake atlases for
you automatically.

### Drawing API

The most important feature of all, certainly, is the API for drawing our graphics. This is all done
via the `Draw` API provided to your game's `render()` callback. It contains a ton of different
methods for rendering lines, shapes, images, and text.

Draw calls are automatically grouped and batched together, meaning you can just draw whatever you
want and things will be batched together logically. This means that if you want to reduce draw calls
you can focus on texture packing or layered rendering rather than fussing with low-level pipeline
layouts and all that stuff.

You're provided with a view matrix for camera transformations, as well as a global matrix stack
which allows you to batch render with a transform. You can switch shaders, change the rendering
surface, and modify shader parameters all with inline code and everything will happen in the order
you specify as if it were immediate.