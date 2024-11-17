+++
title = "Jellyfish: A Scripting Language Concept"
slug = "jellyfish"
description = "Imagining my ideal embeddable scripting language for games."
draft = true

[taxonomies]
tags = ["game-dev"]

[extra]
has_toc = true
+++

Now that I am developing my own engines, the need for a good embeddable scripting language has become crystal
clear. Unfortunately, most of the existing languages are general purpose and not good candidates for the
purposes of game development. In this post, I share what my ideal scripting language might look like.

<!-- more -->

## Hello Jellyfish

Hello, world!

## Use Case

Rather than being a general-purpose language, this ideal language is specifically made to be used for
embedding into a game engine & editor as a way to quickly create and prototype game mechanics, systems,
and events. Usually, this embedding environment is in an engine and editor made in a fast, lower-level
language like C++ or Rust. Because we want to keep the editor running, and maybe even the game running,
while we edit scripts and tune our game objects, an embedded scripting language is ideal because we can
do so without re-compiling the low level code, and instead selectively re-compiling changed scripts much
more quickly.

## Design Requirements

My ideal language has a series of hard requirements, followed by some soft nice-to-haves. If all the hard
requirements are met, that is good enough for me. Sometimes features are not worth the additional complexity
and compile time they may introduce, so it's fair to compromise.

The hard requirements are non-negotiable.

#### <i class="ri-checkbox-line"></i> Easy to Embed

The language must be simple to embed. I should not have to download 80 million libraries, have to download
17 package managers to get it, or have to install mysterious things. It should be as easy to add to my
project as calling `cargo add XXXXX` is to add a dependency to a crate. The documentation alone should have
all the information needed to embed and use the language, with no arcane knowledge required.

#### <i class="ri-checkbox-line"></i> Statically Typed

This is a big one. It must have a static type system, meaning not dynamically typed. It should be a compile
error to assign a string and an integer to the same variable, or pass the wrong type into a function. I should
not be able to compile code that tries to call functions that don't exist, or reference types that have not
been declared.

And I want a fairly strict type system. Some scripting languages have gradual typing, which would not pass
this requirement. If I try to write code that adds a number and a dog together? No, that should not compile.
Does the language allow that to compile and break at runtime? Good lord why? We could easily have known!

#### <i class="ri-checkbox-line"></i> Expression Oriented

Switching to expression oriented languages was a game changer for me, and is a requirement that I suspect would
not be on other game developers' radar. Expression oriented languages that support pattern matching also unlock
all kinds of opportunities for what I think is very elegant, easy to reason about code. Which leads me to my
next one...

#### <i class="ri-checkbox-line"></i> Pattern Matching

Pattern matching is one of those things that there's life before I learned about it, and then life after. It's
such a great coding mechanism, a tool I find myself incorporating so often in code written with languages that
support it. Taking it away from me is like taking away `if` statements or `+ - *` operators... like I am
perfectly capable of coding without them, but my code is just worse and I am much less happy writing it.

They can be used badly, but no more than nesting or functions or loops, other things we accept as essential
mechanisms for writing software that Does Stuff We Want. Pattern matching has found a home among them.

#### <i class="ri-checkbox-line"></i> No Garbage Collector

Sometimes I do not understand the existence of garbage collectors. Why, instead of having memory freed when I
expect it will, freed at times I basically cannot expect. I am writing games, things that are supposed to be
very smooth and responsive, so why am I using a language that basically randomly decides to freeze up at times
that cannot be predicted?

By "no garbage collector", *that* is the kind of garbage collector I mean. I realized that pretty much the
reason we need generational garbage collectors is to support the existence of cyclic references...

So that means if we just... write code that doesn't have cyclic references, we don't need a huge GC smogging
up the running code? That's all we have to lose? Let's lose it then. So when you get a language that
*enforces* that no cyclic references exist, imagine that!

#### <i class="ri-checkbox-line"></i> Convenient Vector Math

This is related to the above requirement, but is very important so it gets its own: how convenient/elegant is
it to use vector math types in the language? When writing games, things like `Vec2` and `Mat4x4` are used an
immense amount, from cameras to moving characters to spinning wheels and groups of particles and everything
in-between. These types should be cheap to use (create, destroy, & pass around), should support using them
with operators (I should be able to multiply a `Vec2` with a `float` using the `*` operator).

Most (but not all) languages with garbage collectors do not provide very ideal support for this kind of thing,
which makes the two requirements fairly coupled.

#### <i class="ri-checkbox-line"></i> Interpreted Bytecode

Some scripting languages build a syntax tree of the code and then execute on that (or something similar to it).
But they *tend* to be out-performed by languages that use a stack or registers and then run bytecode interpreters
that operate on that. While a JIT is not a requirement, unless a language knows some secrets to make AST-crawling
faster than the equivalent bytecode operations, the speed gain from this is highly desireable and will be a
requirement for the language.

#### <i class="ri-checkbox-line"></i> Code Inspection

This one is a bit subtle, but being able to inspect and analyze the parsed/compiled scripts via the embedding API
is pretty important. For me, the ideal language gets embedded into an engine, and the editor should have as many
tools at its disposal to statically analyze them. Either so it can prepare editable properties that the script
expects, so it can build function tables to populate selectable drop-downs for them, or so that it can merely
report an error if a script is badly formed or does not conform to some expected structure.

#### <i class="ri-checkbox-line"></i> No Global State

These scripts should be sandboxed and not be able to access or change anything outside of themselves unless
provided such functionality by external functions provided by the host application. Global state is a nightmare
and has no place in my dream language, *especially* if it's something that can happen by accident.

## Existing Languages

### Lua

Lua, one of the most widely known scripting languages that is also used in a lot of games, does not meet almost
any of these requirements.

> <i class="ri-checkbox-multiple-fill"></i> **Requirements**
>
> - <i class="ri-checkbox-line"></i> Easy to Embed
> - <i class="ri-checkbox-blank-line"></i> Statically Typed
> - <i class="ri-checkbox-blank-line"></i> No Garbage Collector
> - <i class="ri-checkbox-blank-line"></i> Expression Oriented
> - <i class="ri-checkbox-blank-line"></i> Pattern Matching
> - <i class="ri-checkbox-blank-line"></i> Convenient Vector Math
> - <i class="ri-checkbox-line"></i> Interpreted Bytecode
> - <i class="ri-question-line"></i> Code Inspection
> - <i class="ri-checkbox-blank-line"></i> No Global State

It doesn't have great code inspection, but all things that are defined in scripts can be searched in the `_G`
global table, so you can at least scan to see which functions or variables exist and stuff like that. Not only
does default Lua have a global state, but if you forget to add a `local` to a variable, or god forbid you type
a variable name wrong, Lua will just write to a global variable under that name instead of erroring. Incredible.

Also, it's 1-indexed for some godforsaken reason, and doesn't support assignment operators like `+=` and `*=`
which is very inconvenient. The support for method syntax using `:` instead of `.` is quite nice though.

### Wren

While a lesser-known language, [Wren](https://wren.io/) actually makes for a great alternative to Lua, as the
language has a bit more structure and is less loose and provides us with some convenient structural mechanisms.
It's a great language, and has very good performance, but unfortunately still fails almost every single requirement.

> <i class="ri-checkbox-multiple-fill"></i> **Requirements**
>
> - <i class="ri-checkbox-line"></i> Easy to Embed
> - <i class="ri-checkbox-blank-line"></i> Statically Typed
> - <i class="ri-checkbox-blank-line"></i> No Garbage Collector
> - <i class="ri-checkbox-blank-line"></i> Expression Oriented
> - <i class="ri-checkbox-blank-line"></i> Pattern Matching
> - <i class="ri-checkbox-blank-line"></i> Convenient Vector Math
> - <i class="ri-checkbox-line"></i> Interpreted Bytecode
> - <i class="ri-checkbox-line"></i> Code Inspection
> - <i class="ri-checkbox-blank-line"></i> No Global State

Wren's API is delightfully simple and terse, and is very fast and convenient to set up. Its code inspection is quite
decent, but lacks a few search methods that would add a lot of convenience. It has an attribute system that you can
use to tag functions and classes with meta-information your tools can use, which is a great feature, although it's
a bit uncomfortable to actually use. The fact that fields on types are declared on classes, and methods can compile
in a way that indexes them by slot instead of name is a nice performance feature. It has global state, but it's not
as sloppy as Lua's.

### C#

Sometimes C# barely feels like a scripting language, as its sheer size and scope is far beyond most other scripting
languages that might be in the same conversation. Its enormous feature set actually means that it covers way more
features than other candidates on this list, but unfortunately falls short in some pretty essential ways.

> <i class="ri-checkbox-multiple-fill"></i> **Requirements**
>
> - <i class="ri-checkbox-blank-line"></i> Easy to Embed
> - <i class="ri-checkbox-line"></i> Statically Typed
> - <i class="ri-checkbox-blank-line"></i> No Garbage Collector
> - <i class="ri-checkbox-blank-line"></i> Expression Oriented
> - <i class="ri-question-line"></i> Pattern Matching
> - <i class="ri-checkbox-line"></i> Convenient Vector Math
> - <i class="ri-checkbox-line"></i> Interpreted Bytecode
> - <i class="ri-checkbox-line"></i> Code Inspection
> - <i class="ri-checkbox-blank-line"></i> No Global State

Embedding this language is a nightmare, and compared to languages like Lua and Wren which can be as simple as dropping
a few C files in your project and calling functions, C# is nothing close to that. Engines that have successfully been
able to embed it, such as [Unity](https://unity.com/) and [Godot](https://godotengine.org/), have been able to benefit
from some of the actually very pleasant features the language provides.

Having `struct` types that are stack-allocated and also support operator overloading means that C# is one of the very
few scripting languages that supports very fast, convenient vector math. Writing game code in C# is quite pleasant
because of this, and it means that even though it *does* have a garbage collector, if you're careful it's possible to
dodge running it more easily than in other languages.

In my opinion, it's actually just better to build the engine and editor in C# itself, and use the language's ability
to hotload assemblies to your advantage. I know several developers doing just this.

The latest versions of the language support pattern matching... but it definitely feels like "pattern matching at home".

### 