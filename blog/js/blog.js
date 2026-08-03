(function () {
  "use strict";

  marked.setOptions({ gfm: true, breaks: false });

  const gridView = document.getElementById("grid-view");
  const postView = document.getElementById("post-view");
  const cardGrid = document.getElementById("card-grid");
  const postBody = document.getElementById("post-body");
  const backBtn = document.getElementById("back-btn");
  const searchBox = document.getElementById("search");
  const noResults = document.getElementById("no-results");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let activeFilter = "all";
  let activeSearch = "";

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return {
      short: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      full: d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    };
  }

  function tagHtml(tags) {
    return tags.map((tag) => `<span class="tag ${tag}">${tag}</span>`).join("");
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /*
   * Marked follows Markdown escaping rules, so delimiters such as \[ and \]
   * can lose their backslashes before MathJax sees them. Replace formulas with
   * plain placeholders during Markdown parsing and restore them afterward.
   */
  function protectMath(markdown) {
    const formulas = [];

    function stash(formula) {
      const token = `MATHJAXPLACEHOLDER${formulas.length}END`;
      formulas.push(formula);
      return token;
    }

    let protectedMarkdown = markdown
      .replace(/\$\$[\s\S]*?\$\$/g, stash)
      .replace(/\\\[[\s\S]*?\\\]/g, stash)
      .replace(/\\\([\s\S]*?\\\)/g, stash)
      .replace(
        /(^|[^\\$])\$([^$\n]+?)\$/gm,
        (match, prefix, body) => `${prefix}${stash(`$${body}$`)}`
      );

    return {
      markdown: protectedMarkdown,
      restore(html) {
        return html.replace(
          /MATHJAXPLACEHOLDER(\d+)END/g,
          (match, index) => escapeHtml(formulas[Number(index)])
        );
      }
    };
  }

  async function typesetMath(element) {
    if (!window.MathJax) return;

    if (window.MathJax.startup && window.MathJax.startup.promise) {
      await window.MathJax.startup.promise;
    }

    if (typeof window.MathJax.typesetPromise === "function") {
      await window.MathJax.typesetPromise([element]);
    }
  }

  function getVisible() {
    let list = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activeFilter !== "all") {
      list = list.filter((post) => post.tags.includes(activeFilter));
    }

    if (activeSearch) {
      const query = activeSearch.toLowerCase();
      list = list.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.includes(query))
      );
    }

    return list;
  }

  function renderCards() {
    const posts = getVisible();
    cardGrid.innerHTML = "";

    if (!posts.length) {
      noResults.classList.remove("hidden");
      return;
    }

    noResults.classList.add("hidden");

    posts.forEach((post) => {
      const date = formatDate(post.date);
      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <div class="card-top">
          <span class="card-date">${date.short}</span>
          <div class="card-tags">${tagHtml(post.tags)}</div>
        </div>
        <div class="card-title">${post.title}</div>
        <div class="card-excerpt">${post.excerpt}</div>
        <div class="card-footer">
          <span class="card-read-more">Read more</span>
        </div>
      `;
      card.addEventListener("click", () => openPost(post));
      cardGrid.appendChild(card);
    });
  }

  async function openPost(meta) {
    if (window.MathJax && typeof window.MathJax.typesetClear === "function") {
      window.MathJax.typesetClear([postBody]);
    }

    postBody.innerHTML =
      '<p style="color:var(--muted);font-size:0.85rem;">Loading...</p>';
    gridView.classList.add("hidden");
    postView.classList.remove("hidden");
    window.scrollTo(0, 0);

    try {
      const response = await fetch(meta.file);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let markdown = await response.text();
      markdown = markdown.replace(/^---[\s\S]*?---\n?/, "");

      const protectedMath = protectMath(markdown);
      const postHtml = protectedMath.restore(marked.parse(protectedMath.markdown));
      const date = formatDate(meta.date);

      postBody.innerHTML = `
        <div class="post-meta-header">
          <div class="post-meta-date">${date.full}</div>
          <h1 class="post-meta-title">${meta.title}</h1>
          <div class="post-meta-tags">${tagHtml(meta.tags)}</div>
        </div>
        ${postHtml}
      `;

      try {
        await typesetMath(postBody);
      } catch (mathError) {
        console.error("MathJax could not typeset this post:", mathError);
      }
    } catch (error) {
      console.error("Could not load post:", error);
      postBody.innerHTML = `<p style="color:var(--muted)">Could not load post. Make sure <code>${meta.file}</code> exists.</p>`;
    }
  }

  backBtn.addEventListener("click", () => {
    postView.classList.add("hidden");
    gridView.classList.remove("hidden");
    window.scrollTo(0, 0);
  });

  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      filterBtns.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      renderCards();
    });
  });

  searchBox.addEventListener("input", () => {
    activeSearch = searchBox.value.trim();
    renderCards();
  });

  renderCards();
})();
