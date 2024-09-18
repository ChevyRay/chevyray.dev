+++
title = "Why Are Paths Like That"
slug = "why-are-paths-like-that"
description = "Why are Rust paths so weird, and can we make them easier?"
draft = true

[taxonomies]
tags = ["rust"]

[extra]
has_toc = false
+++

Filesystem paths in Rust can be awkward at first, especially if you come from a language where
they are just strings. So let's have a look at `camino`, a crate that allows us to use UTF-8
paths like we want to, but not without understanding why it needs to exist in the first place.

<!-- more -->

## The Problem

In nearly every other programming language, filesystem paths (which I will just call *paths* from here on)
are represented as strings. For example, C# has a `Path` class, but it actually just contains static
methods that operate on strings. The `File` class, which lets us interact with the filesystem, also takes
strings as input to represent paths:

> C# Code
```cs
string dir = "/Users/ChevyRay/Pictures";
string img = Path.Join(dir, "image1.png");
if (File.Exists(img))
{
    string ext = Path.GetExtension(img);
    if (ext == "png")
    {
        Console.WriteLine("{0} is a PNG file!", img);
    }
}
```

For the sake of this example, let's pretend that the string `"image1.png"` is a parameter or user-input.
Anything could've been passed in, so we want to make sure that both the file exists and that it appears
to be a PNG file.

So let's say you want to write the same code in Rust.

First, you look up "paths" in the documentation and see there is a `Path` type that should be used instead
of strings for paths. Okay sure, Rust is a very strongly-typed language and you know that, so maybe there's
some reason for it. You look and see that it has a `new()` function to construct one. The function signature
is a bit... odd?

> Rust Code
```rust
pub fn new<S: AsRef<OsStr> + ?Sized>(s: &S) -> &Path { ... }
```

Weird. What is an `OsStr`? But you look at the example, and they example shows that you can pass a string into
this to construct a path. 

> Rust Code
```rust
let dir: &Path = Path::new("/Users/ChevyRay/Pictures");
```

Cool, good so far. Weird that this creates a *reference* to a path, not a path itself. You'll look into that later.

This isn't as nice as the C# version, but hardly a problem. We have the path to our folder, so now we want to
append that path with our image filename. We look and see that there is a
[`join()`](https://doc.rust-lang.org/stable/std/path/struct.Path.html#method.join) method, nice!

> Rust Code
```rust
pub fn join<P: AsRef<Path>>(&self, path: P) -> PathBuf { ... }
```

What the hell? This returns a `PathBuf` instead of a `Path`? You're only onto the second line of code and
already we're working with *four* different types. You know Rust is a strongly typed language but this feels
like a lot. Whatever, what do the docs say?

> &ldquo;An owned, mutable path (akin to String).&rdquo;

Ah okay, so you have a "lightbulb!" moment: `Path` is like `&str` and `PathBuf` is like `String`! This is
actually nice, because we can reference "parts" of paths without creating new allocations. Even C# does this
much, for example the `Join()` function allows us to use string spans:

> C# Code
```cs
public static string Join(ReadOnlySpan<char> path1, ReadOnlySpan<char> path2);
```

The `join()` method asks for an `AsRef<Path>` this time instead of an `AsRef<OsStr>`, which is weird, but the
docs inform you that you can still just use a string here so you do.

> Rust Code
```rust
let dir: &Path = Path::new("/Users/ChevyRay/Pictures");
let img: PathBuf = dir.join("image1.png");
```

Next, you want to see if the file exists. You look it up and there's a handy `exists()` method that will
do exactly what we need.

> Rust Code
```rust
let dir: &Path = Path::new("/Users/ChevyRay/Pictures");
let img: PathBuf = dir.join("image1.png");
if img.exists() {

}
```

That part was even nicer than the C# code, not bad so far. The rest should be a walk in the park! You
see there is an `extension()` method to get the path's extension, so you call it and...

> Rust Code
```rust
let dir: &Path = Path::new("/Users/ChevyRay/Pictures");
let img: PathBuf = dir.join("image1.png");
if img.exists() {
    let ext: Option<&OsStr> = img.extension();
}
```

Our mysterious friend `OsStr` is back. In C# we just get a string, but Rust gives us our extension as a
reference to an `OsStr`. It's time to hit the docs...

> &ldquo;This type represents a borrowed reference to a string in the operating system’s preferred
> representation.&rdquo;

*Rubs forehead* &mdash; fine. The `Option` makes sense because the file may not have an extension. And You
know Rust has a lot of string types, so I guess there is a special string type for the operating system?
Whatever. You still need to check if it's equal to `"png"`, and end up with something like this:

> Rust Code
```rust
let ext: Option<&OsStr> = img.extension();
if ext == Some(OsStr::new("png")) {
    
}
```

Aww this makes an allocation though. You look to see if there's some way we can compare extensions without
allocating. Hmm, maybe you could use this `OsStr::to_str()` method:

> Rust Code
```rust
pub fn to_str(&self) -> Option<&str> { ... }
```

Huh, it looks like not every "operating system string" can be converted to a UTF-8 string. You're not sure why,
but you learned something new today. Weird that C# allows this, if that's the case...

Back on track! You re-write your condition to remove the allocation because you heard that premature
optimization is bad and you feel like being bad today:

> Rust Code
```rust
let ext: Option<&str> = img.extension().and_then(|ext: &OsStr| ext.to_str());
if ext == Some("png")) {
    
}
```

FINALLY, it is done! All that's left is to output our message, and now you have your final code:

> Rust Code
```rust
let dir: &Path = Path::new("/Users/ChevyRay/Pictures");
let img: PathBuf = dir.join("image1.png");
if img.exists() {
    let ext: Option<&str> = img.extension().and_then(|ext: &OsStr| ext.to_str());
    if ext == Some("png") {
        println!("{} is a PNG file!", img);
    }
}
```

Wait wh&mdash;

```
error[E0277]: `PathBuf` doesn't implement `std::fmt::Display`
  |
6 |    println!("{} is a PNG file!", img);
  |                                  ^^^ `PathBuf` cannot be formatted with the default formatter; call `.display()` on it
  |
```

*twitches*

> Rust Code
```rust
let dir: &Path = Path::new("/Users/ChevyRay/Pictures");
let img: PathBuf = dir.join("image1.png");
if img.exists() {
    let ext: Option<&str> = img.extension().and_then(|ext: &OsStr| ext.to_str());
    if ext == Some("png") {
        println!("{} is a PNG file!", img.display());
    }
}
```

And NOW you have your final code! It's not as nice as the C# version but you got there, and if you take
advantage of type inference and a couple tricks, you manage to get:

> Rust Code
```rust
let dir = Path::new("/Users/ChevyRay/Pictures");
let img = dir.join("image1.png");
if img.exists() {
    let ext = img.extension().and_then(OsStr::to_str);
    if ext == Some("png") {
        println!("{} is a PNG file!", img.display());
    }
}
```

That's not so bad, and hardly different from the C# version. But you had to jump through a lot of hoops to
get this result, and when you're in the thick of it, it sure feels like a lot of *busywork*, doesn't it?

## Why Is It Like This?

That `OsStr` we encountered is our best clue, and helps us understand why this API is shaped the way it is.
When we talk about *paths*, we're also talking about *strings*, and so to understand one we have to make
sure we understand the other.

One of the first things you'll learn in Rust is that there are two main string types, `String` and `&str`.
These are [UTF-8](https://en.wikipedia.org/wiki/UTF-8) strings, where `String` is an entire heap-allocated
string, and `&str` is a reference to a *slice* of UTF-8 text (not necessarily a whole string). There are many
tutorials about Rust strings, so I won't cover them in great detail here, but I think those are the most
important things to know.

Just like we have `String` and `&str`, we also have two other types: `OsString` and `&OsStr`. The Rust docs
explain their purpose very clearly:

> **OsString**
> 
> A type that can represent owned, mutable platform-native strings, but is cheaply inter-convertible with Rust strings.
> 
> The need for this type arises from the fact that:
> - On Unix systems, strings are often arbitrary sequences of non-zero bytes, in many cases interpreted as UTF-8.
> - On Windows, strings are often arbitrary sequences of non-zero 16-bit values, interpreted as UTF-16 when it is valid to do so.
> - In Rust, strings are always valid UTF-8, which may contain zeros.

And there it is. Because Rust strings are UTF-8, when we want to send or receive strings from the OS, we need
to use these special OS-strings. If you look at the above facts, you can see that while any UTF-8 string can be
losslessly converted to any OS string, the reverse may not be true. If an OS string is, as the docs say, an
"arbitrary sequence of non-zero bytes", there's absolutely no guarantee that it is UTF-8 compatible.

Rust is very concerned with being *correct*, and so if something could not be true, it makes sure we handle that
case. This is why we can create an `OsStr::new()` from a string, but `OsStr::to_str()` returns an `Option<&str>`
instead of a `&str`. That's the rules.

## What About Paths, Though?

You then might ask, "why are paths not simply `OsString` values in Rust?"

I have good news for you:

> path.rs
```rust
pub struct PathBuf {
    inner: OsString,
}
```

They are! This is the definition of `PathBuf` in the standard library, which shows us that it is merely a
*newtype* wrapper over `OsString`. The standard library could very well have been written with just OS-strings
as paths, and it wouldn't worked *fine*.

But Rust has a powerful type system, and types aren't just there to describe data, they exist to express
*meaning* and *intent*. Imagine if `PathBuf` didn't exist, and instead of `PathBuf::join()`, instead there
was an `OsString::join()`. If someone was working with operating system strings and not paths, what would
they expect this function to do? There's no indication that this string is a path, and yet we're calling a
function on it that expects it to look and act like a path.

Despite our binary being no different (the types would get erased at compile time), our code itself has lost
*meaning*, and that meaning is now pushed somewhere else (either into comments or the documentation itself).

Because our type is a `PathBuf`, we know what it represents, and we know that all the methods on it are
methods that expect the contents to be a path, not just some arbitrary string.

Clever readers will probably have surmised what the type declaration of `Path` looks like:

> path.rs
```rust
pub struct Path {
    inner: OsStr,
}
```

## Okay But These Conversions Are Still Annoying!

It's not that bad. But I feel you.

For a lot of us, the existence of non-UTF-8 paths is often irrelevant, and having to constantly match/unwrap
path-to-string conversations is a pain. There are a plethora of libraries that work with strings: UI systems,
string comparison algorithms, stack-allocated string types, regular expression tools, etc. These things are
extremely useful, but whenever we want to use them on paths, we always have to fallibly convert them to strings
first.

The truth of the matter (at least in my opinion, your mileage may vary) is that while not all paths are strings,
and strings can be things that are not paths... almost all practical usage of paths for high level users expect
them to be human readable UTF-8 strings.

Rust's path API is the way it is because Rust is a systems language that wants to be able to correctly interact
with operating systems, and so that's the way it should be. But that doesn't mean we can't create our own API
that makes our life easier, right?

If we know we only care about UTF-8 paths, let's use a library for just that.

## UTF-8 Paths With `camino`

The [`camino`](https://crates.io/crates/camino) crate is a library that gives us two main types: `Utf8PathBuf`
and `Utf8Path`, which are direct counterparts to `PathBuf` and `Path` respectively. In fact, the documentation
describes our problem and solution quite clearly, so I'll just quote it here directly:

> The `std::path` types are not guaranteed to be valid UTF-8. This is the right decision for the standard library,
> since it must be as general as possible. However, on all platforms, non-Unicode paths are vanishingly uncommon for a
> number of reasons:
> 
> - Unicode won. There are still some legacy codebases that store paths in encodings like [Shift JIS], but most
>   have been converted to Unicode at this point.
> - Unicode is the common subset of supported paths across Windows and Unix platforms. (On Windows, Rust stores paths
>   as [an extension to UTF-8](https://simonsapin.github.io/wtf-8/), and converts them to UTF-16 at Win32
>   API boundaries.)
> - There are already many systems, such as Cargo, that only support UTF-8 paths. If your own tool interacts with any such
>   system, you can assume that paths are valid UTF-8 without creating any additional burdens on consumers.
> - The ["makefile problem"](https://www.mercurial-scm.org/wiki/EncodingStrategy#The_.22makefile_problem.22) asks: given a
>   Makefile or other metadata file (such as `Cargo.toml`) that lists the names of other files, how should the names in
>   the Makefile be matched with the ones on disk? This has _no general, cross-platform solution_ in systems that support
>   non-UTF-8 paths. However, restricting paths to UTF-8 eliminates this problem.
> 
> [Shift JIS]: https://en.wikipedia.org/wiki/Shift_JIS
> 
> Therefore, many programs that want to manipulate paths _do_ assume they contain UTF-8 data, and convert them to `str`s
> as necessary. However, because this invariant is not encoded in the `Path` type, conversions such as
> `path.to_str().unwrap()` need to be repeated again and again, creating a frustrating experience.
> 
> Instead, `camino` allows you to check that your paths are UTF-8 _once_, and then manipulate them
> as valid UTF-8 from there on, avoiding repeated lossy and confusing conversions.

Well there you have it. I think it's a wonderful crate, and gives us a solution to our problem without
"hiding" the truth, which is that paths are *complicated*, and a systems programming language like Rust
does itself and its users no favors by pretending otherwise.

With that in mind, let's re-write our original function:

> Rust Code
```rust
let dir = Utf8Path::new("/Users/ChevyRay/Pictures");
let img = dir.join("image1.png");
if img.exists() {
    let ext = img.extension();
    if ext == Some("png") {
        println!("{} is a PNG file!", img);
    }
}
```

These paths can be used normally with Rust's filesystem API, and so your code barely needs to change. But
now, our paths can be converted from/to strings directly without unwrapping, and unnecessary allocations
can be easily avoided.

## When Not To Use UTF-8 Paths?

If you are writing a library that interacts with the filesystem and you want it to be as generic as possible,
I would recommend using the standard path API instead of UTF-8 paths. Doing otherwise limits the use of your
library, and if you want other people to use it, you're not forcing them into a decision they may not want
to make.

If they want to use UTF-8 paths, they can happily use them with your methods if you use the standard API.

But if you're writing your own tool or software and you not only want but may *require* that all paths
used by it are UTF-8, and also want the cleanliness UTF-8 paths provide? Go for it.
