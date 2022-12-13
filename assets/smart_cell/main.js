export function init(ctx, assigns) {
  ctx.importCSS("https://adventofcode.com/static/style.css");
  ctx.importCSS("main.css");

  fetch("main.html")
    .then((r) => r.text())
    .then((html) => mount(ctx, html, assigns))
    .catch(console.error);
}

function mount(ctx, html, { day, year, example_input, run_config }) {
  ctx.root.innerHTML = html;

  const fetchButton = ctx.root.querySelector("#fetch-puzzle");
  const refetchButton = ctx.root.querySelector("#refetch-puzzle");
  const title1 = ctx.root.querySelector("#title-1");
  const content1 = ctx.root.querySelector("#content-1");
  const comments1 = ctx.root.querySelector("#comments-1");
  const title2 = ctx.root.querySelector("#title-2");
  const content2 = ctx.root.querySelector("#content-2");
  const comments2 = ctx.root.querySelector("#comments-2");

  const exampleElem = ctx.root.querySelector("#example-input");
  //const cb_example = ctx.root.querySelector("#cb_example");

  const addRefetchEvent = (year, day) => {
    refetchButton.addEventListener("click", () =>
      ctx.pushEvent("fetch_puzzle", { year, day })
    );
    ctx.root.querySelector("#show-year").innerHTML = year;
    ctx.root.querySelector("#show-day").innerHTML = day;
  };

  if (day && year) {
    ctx.pushEvent("fetch_puzzle", { year, day });
    addRefetchEvent(year, day);
  } else
    fetchButton.addEventListener("click", () => {
      const year = ctx.root.querySelector("#year").value;
      const day = ctx.root.querySelector("#day").value;
      ctx.pushEvent("fetch_puzzle", { year, day });
      addRefetchEvent(year, day);
    });

  exampleElem.value = example_input;
  exampleElem.addEventListener("input", (event) => {
    ctx.pushEvent("update", { example_input: event.target.value });
  });

  const runConfigCbs = Array.from(document.getElementsByName("run_config"));
  runConfigCbs.forEach((cb) => {
    cb.addEventListener("change", () => {
      const run_config = runConfigCbs
        .filter((i) => i.checked)
        .map((i) => i.value);
      console.log("pushing run_config", run_config);
      ctx.pushEvent("update", { run_config });
    });
    console.log({
      value: cb.value,
      run_config,
      invalue: cb.value in run_config,
    });
    cb.checked = run_config.includes(cb.value);
  });

  const toggleArticle = (part) => {
    const content = part == 1 ? content1 : content2;
    const title = part == 1 ? title1 : title2;
    const isOpened = content.style.display == "block";

    if (isOpened) {
      content.style.display = "none";
      title.innerHTML = title.innerHTML.replace("⬆️", "⬇️");
    } else {
      content.style.display = "block";
      title.innerHTML = title.innerHTML.replace("⬇️", "⬆️");
    }
  };

  title1.addEventListener("click", () => toggleArticle(1));
  title2.addEventListener("click", () => toggleArticle(2));

  ctx.handleEvent("error", console.error);

  ctx.handleEvent(
    "load_articles",
    ({ articles: [article1, article2], comments: [comm1, comm2] }) => {
      title1.innerHTML = "⬇️ " + article1.title;
      title1.style.display = "block";
      content1.innerHTML = article1.content;

      comments1.innerHTML = comm1;
      comments2.innerHTML = comm2;

      if (article2) {
        title2.innerHTML = "⬇️ " + article2.title;
        title2.style.display = "block";
        content2.innerHTML = article2.content;
      } else {
        title2.innerHTML = "";
        title2.style.display = "none";
        content2.innerHTML = "";
      }

      ctx.root.querySelector("#header-selection").style.display = "none";
      ctx.root.querySelector("#puzzle-body").style.display = "block";
    }
  );
}
