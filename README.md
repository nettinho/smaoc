# Smaoc

This project has a SmartCell for fetching Advent of Code puzzles and solve them in a Livebook

## Installation

On the Livebook dependencies, 
```elixir
Mix.install([
  {:smaoc, git: "https://github.com/nettinho/smaoc"}
])
```

First you need to set up the livebook secret `AOC_SESSION` with the session value found in the browser local storage when login on adventofcode.com.

Then select the SmartCell, choose the date and fetch the puzzle.
You can fill in the example textarea copying and pasting from the problem description.
Implement the `&Smaoc.Solution.solve/2` functions and then choose which part and with which inputs you want to run.

If you return the answer, your may submit it directly from the livebook.

