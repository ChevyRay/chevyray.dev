+++
title = "Jellyfish: A Scripting Language Concept"
slug = "jellyfish"
description = "Imaginging my ideal embeddable scripting language for games."
draft = false

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

## Use Case

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

#### Statically Typed

This is a big one. It must have a static type system, meaning not dynamically typed. It should be a compile
error to assign a string and an integer to the same variable, or pass the wrong type into a function. I should
not be able to compile code that tries to call functions that don't exist, or reference types that have not
been declared. And I want a fairly strict type system. Some scripting languages have gradual typing, which
would not pass this requirement.

#### Expression Oriented

Switching to expression oriented languages was a game changer for me, and is a requirement that I suspect would
not be on other game developers' radar. Expression oriented languages that support pattern matching also unlock
all kinds of opportunities for what I think is very elegant, easy to reason about code.

Take this code, for example:

> C Code
```c
int result;
if (conditionA && conditionB)
    result = a_and_b();
else if (conditionA && !conditionB)
    result = only_a();
else if (!conditionA && conditionB)
    result = only_b();
else
    result = neither();
```

It could also be written like this, which I like even less:

> C Code
```c
int result;
if (conditionA)
{
    if (conditionB)
        result = a_and_b();
    else
        result = only_a();
}
else if (conditionB)
    result = only_b();
else
    result = neither();
```

Even this version, which I personally think isn't the *worse* but would probably get you into trouble
because ternary conditionals are not univerally beloved in C-based languages:

> C Code
```c
int result = conditionA
    ? (conditionB ? a_and_b() : only_a())
    : (conditionB ? only_b() : neither())
```



> Rust Code
```rust
let result = match (condition_a, condition_b) {
    (true, true) => a_and_b(),
    (true, false) => only_a(),
    (false, true) => only_b(),
    (false, false) => neither(),
};
```

#### No Garbage Collector

#### Interpreted Bytecode

#### Type Reflection

## Looking at Other Languages

### Lua

> <i class="ri-checkbox-multiple-fill"></i> **Requirements**
>
> - <i class="ri-checkbox-line"></i> easy to embed and create bindings
> - <i class="ri-checkbox-line"></i> statically typed
> - <i class="ri-checkbox-line"></i> expression oriented
> - <i class="ri-checkbox-blank-line"></i> Images &amp; Icons

### Wren

### C#

### 