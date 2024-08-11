This is the source code for [chevyray.dev](https://chevyray.dev/), my personal blog
where I write about game development and Rust, as well as various other things.

This website is built using [Zola 0.19.1](https://www.getzola.org/), an open source
static site generator built in Rust. For more information about how the website is
designed, I actually wrote a blog post all about it!

- [How this Site is Made](https://chevyray.dev/blog/how-this-site-is-made/)

The content for the website is located in the [`content/blog`](https://github.com/ChevyRay/chevyray.dev/tree/main/content/blog) folder. But using Zola's templating system, I actually made it so that at the
end of each post on the site, there is a direct link to that post's source file. If
you spot any errors in a post, information that is incorrect, typos, or broken
links, you can click the link at the bottom and should be able to submit a fix to
it easily from there.

If you're interested in learning Zola and want to just fool around with this site's
source code and change things around, you can clone the site, [install Zola 0.19.1](https://github.com/getzola/zola/releases/tag/v0.19.1), and then live test the site with:

```
> zola serve
```

Once this runs, you will see something like...

```
Building site...
Checking all internal links with anchors.
> Successfully checked 2 internal link(s) with anchors.
-> Creating 5 pages (0 orphan) and 1 sections
Done in 277ms.

Listening for changes in /websites/chevyray.dev/{config.toml,content,sass,static,templates}
Press Ctrl+C to stop

Web server is available at http://127.0.0.1:1111 (bound to 127.0.0.1:1111)
```

Once zola is running, live changes to the site should refresh and be viewable at that link.

If you want to take the theme and modify it to use for your own blog, that is perfectly fine. I
created it using mostly free and open source resources, so I am happy to continue that train.