defmodule Smaoc.SmartCell do
  use Kino.JS, assets_path: "assets/smart_cell"
  use Kino.JS.Live
  use Kino.SmartCell, name: "Smart Advent of Code"

  @impl true
  def init(attrs, ctx) do
    year = attrs["year"]
    day = attrs["day"]
    source = attrs["source"] || ""
    input = attrs["input"] || ""
    example_input = attrs["example_input"] || ""
    run_config = attrs["run_config"] || ["part1", "example"]

    default_source =
      quote do
        solution_module = Smaoc.Solution.DayX

        defmodule solution_module do
          defp parse_input(input) do
            input
            |> String.split("\n")
            |> Enum.reject(&(&1 == ""))
            |> Enum.count()
          end

          def solve(:part1, input) do
            parse_input(input)
          end

          def solve(:part2, input) do
            parse_input(input)
          end
        end
      end
      |> Kino.SmartCell.quoted_to_string()

    {:ok,
     assign(ctx,
       year: year,
       day: day,
       source: source,
       example_input: example_input,
       input: input,
       run_config: run_config
     ),
     editor: [
       attribute: "source",
       language: "elixir",
       default_source: default_source
     ]}
  end

  @impl true
  def handle_connect(ctx) do
    {:ok, ctx.assigns, ctx}
  end

  defp handle_fetch({:ok, %{status: 404}}, ctx, _params) do
    broadcast_event(ctx, "error", "Error: This puzzle is not available")
    {:noreply, ctx}
  end

  defp handle_fetch({:ok, %{body: body}}, ctx, %{"year" => year, "day" => day}) do
    {:ok, %{body: input}} =
      Req.get("https://adventofcode.com/#{year}/day/#{day}/input",
        headers: [{"cookie", "session=#{System.fetch_env!("LB_AOC_SESSION")}"}]
      )

    articles =
      body
      |> Floki.parse_document!()
      |> Floki.find("article.day-desc")
      |> Enum.map(fn {"article", _, [{_, _, title} | content]} ->
        %{"title" => title, "content" => Floki.raw_html(content)}
      end)

    comments =
      body
      |> Floki.parse_document!()
      |> Floki.find("main > p")
      |> handle_comments()
      |> Enum.map(&Floki.raw_html/1)

    broadcast_event(ctx, "load_articles", %{articles: articles, comments: comments})

    {:noreply, assign(ctx, year: year, day: day, input: input)}
  end

  @impl true
  def handle_event("fetch_puzzle", %{"year" => year, "day" => day} = params, ctx) do
    "https://adventofcode.com/#{year}/day/#{day}"
    |> Req.get(headers: [{"cookie", "session=#{System.fetch_env!("LB_AOC_SESSION")}"}])
    |> handle_fetch(ctx, params)
  rescue
    error ->
      message =
        case error do
          %System.EnvError{env: "LB_AOC_SESSION"} ->
            "Error fetching puzzle. Please define the 'AOC_SESSION' Livebook secret."

          m ->
            "Error: " <> Kernel.inspect(m)
        end

      broadcast_event(ctx, "error", message)
      {:noreply, ctx}
  end

  @impl true
  def handle_event("update", %{"example_input" => example_input}, ctx) do
    {:noreply, assign(ctx, example_input: example_input)}
  end

  @impl true
  def handle_event("update", %{"run_config" => run_config}, ctx) do
    {:noreply, assign(ctx, run_config: run_config)}
  end

  @impl true
  def to_attrs(ctx) do
    %{
      "year" => ctx.assigns.year,
      "day" => ctx.assigns.day,
      "source" => ctx.assigns.source,
      "input" => ctx.assigns.input,
      "example_input" => ctx.assigns.example_input,
      "run_config" => ctx.assigns.run_config
    }
  end

  @impl true
  def to_source(attrs) do
    default_mod =
      quote do
        solution_module = Smaoc.Solution
      end
      |> Kino.SmartCell.quoted_to_string()

    module_execution =
      quote do
        year = unquote(attrs["year"])
        day = unquote(attrs["day"])
        run_config = unquote(attrs["run_config"])

        inputs = %{
          "puzzle" => unquote(attrs["input"]),
          "example" => unquote(attrs["example_input"])
        }

        response =
          for part <- ["part1", "part2"],
              input_key <- ["puzzle", "example"],
              do: {part, input_key}

        response =
          response
          |> Enum.filter(fn {part, input_key} ->
            part in run_config and input_key in run_config
          end)
          |> Enum.map(fn {part, input_key} ->
            [part, input_key, solution_module.solve(String.to_atom(part), inputs[input_key])]
          end)

        Smaoc.Response.new(%{
          response: response,
          run_config: run_config,
          year: year,
          day: day
        })
      end
      |> Kino.SmartCell.quoted_to_string()

    """
    #{default_mod}
    #{attrs["source"]}
    #{module_execution}
    """
  end

  defp handle_comments([
         {"p", _, ["Your puzzle answer was " | _]} = answer1,
         {"p", _, ["Your puzzle answer was " | _]} = answer2,
         {"p", _, ["Both parts of this" <> _]} = stars | _
       ]),
       do: [[answer1], [answer2, stars]]

  defp handle_comments([
         {"p", _, ["Your puzzle answer was " | _]} = answer1,
         {"p", _, ["The first half of" <> _]} = stars | _
       ]),
       do: [[answer1, stars], [{"p", [], ["Part 2 is unsolved."]}]]

  defp handle_comments(_), do: [[{"p", [], ["This puzzle is unsolved."]}], []]
end
