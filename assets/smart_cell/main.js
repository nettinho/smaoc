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

  const title1 = ctx.root.querySelector("#title-1");
  const content1 = ctx.root.querySelector("#content-1");
  const comments1 = ctx.root.querySelector("#comments-1");
  const title2 = ctx.root.querySelector("#title-2");
  const content2 = ctx.root.querySelector("#content-2");
  const comments2 = ctx.root.querySelector("#comments-2");

  const exampleElem = ctx.root.querySelector("#example-input");

  const addRefetchEvent = (year, day) => {
    ctx.root.querySelector("#refetch-puzzle").addEventListener("click", () =>
      ctx.pushEvent("fetch_puzzle", { year, day })
    );
    ctx.root.querySelector("#show-year").innerHTML = year;
    ctx.root.querySelector("#show-day").innerHTML = day;
    ctx.root.querySelector("#show-year-short").innerHTML = year;
    ctx.root.querySelector("#show-day-short").innerHTML = day;
  };

  if (day && year) {
    ctx.pushEvent("fetch_puzzle", { year, day });
    addRefetchEvent(year, day);
  } else
      ctx.root.querySelector("#fetch-puzzle").addEventListener("click", () => {
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
      ctx.pushEvent("update", { run_config });
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

  ctx.root.querySelector("#hide-puzzle").addEventListener("click", () => {
    ctx.root.querySelector("#puzzle-short").style.display = "block";
    ctx.root.querySelector("#puzzle-body").style.display = "none";
  });
  ctx.root.querySelector("#show-puzzle").addEventListener("click", () => {
    ctx.root.querySelector("#puzzle-short").style.display = "none";
    ctx.root.querySelector("#puzzle-body").style.display = "block";
  });

  ctx.handleEvent("error", message => {
    const errorElem = ctx.root.querySelector("#submit-error");
    errorElem.innerHTML = message;
    errorElem.style.display = "block";
  });
  ctx.handleEvent("console.log", console.log)

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

      if(comm2.includes("Both parts")){
        ctx.root.querySelector("#puzzle-body").style.display = "none";
        ctx.root.querySelector("#puzzle-short").style.display = "block";
      }else{
        ctx.root.querySelector("#puzzle-body").style.display = "block";
        ctx.root.querySelector("#puzzle-short").style.display = "none";
      }
    }
  );

  ctx.root.querySelector("#header-selection").style.display = "block";
}
