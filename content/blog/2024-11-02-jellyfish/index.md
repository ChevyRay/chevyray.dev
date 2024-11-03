+++
title = "Jellyfish: A Scripting Language Concept"
slug = "jellyfish"
description = "Imaginging my ideal embeddable scripting language for games."
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
*enforces* that no cyclic references exist, imagine that! We'll call it... *Shmust*... or maybe *Shmellyfish*.

#### <i class="ri-checkbox-line"></i> Interpreted Bytecode

#### <i class="ri-checkbox-line"></i> Type Reflection

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