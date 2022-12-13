
export function init(ctx, assigns) {
  ctx.importCSS("https://adventofcode.com/static/style.css");
  ctx.importCSS("main.css");
  
  fetch("main.html")
    .then(r => r.text())
    .then(html => mount(ctx, html, assigns))
    .catch(console.error)
}

function mount(ctx, html, {response, run_config, year, day}) {
  ctx.root.innerHTML = html

  ctx.root.querySelector("#result-part1").style.display =
    run_config.includes("part1") ? "block" : "none";
  ctx.root.querySelector("#result-part2").style.display =
    run_config.includes("part2") ? "block" : "none";

  response.forEach(([part,input,value]) => {
    ctx.root.querySelector(`#p-${part}-${input}`).style.display = "block";
    ctx.root.querySelector(`#code-${part}-${input}`).innerHTML = value;
  })

  const publishPart1 = ctx.root.querySelector("#publish-part1");
  const publishPart2 = ctx.root.querySelector("#publish-part2");

  publishPart1.addEventListener("click", () => {
    const value = ctx.root.querySelector("#code-part1-puzzle").innerHTML;
    ctx.pushEvent("publish", { value, level: 1, year, day });
  });
  publishPart2.addEventListener("click", () => {
    const value = ctx.root.querySelector("#code-part2-puzzle").innerHTML;
    ctx.pushEvent("publish", { value, level: 2, year, day });
  });

  ctx.handleEvent("render-result", ({level, result}) => {
    ctx.root.querySelector(`#result-${level}`).innerHTML = result;
  });
}