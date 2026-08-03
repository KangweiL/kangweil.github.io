# LaTeX rendering fix for kangweil.github.io

## Files to replace

Copy these files into the same paths in the repository:

- `blog/index.html`
- `blog/js/blog.js`

## What was fixed

1. `window.MathJax` is now configured before the MathJax library loads. This enables `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` delimiters.
2. TeX expressions are temporarily protected while Marked converts Markdown to HTML. This prevents Markdown from removing the backslashes in `\[` and `\]`.
3. The code waits for MathJax startup and calls `typesetPromise()` after the selected post has been inserted into the page.
4. Previous MathJax state is cleared before a different post is rendered.

## Deploy

From the repository root, after replacing the files:

```bash
git add blog/index.html blog/js/blog.js
git commit -m "Fix LaTeX rendering in blog posts"
git push origin main
```

GitHub Pages should redeploy from the `main` branch automatically. After deployment, hard-refresh the blog page to avoid a cached JavaScript file.
