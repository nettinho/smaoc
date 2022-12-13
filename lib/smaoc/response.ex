defmodule Smaoc.Response do
  use Kino.JS, assets_path: "assets/response"
  use Kino.JS.Live

  def new(assigns) do
    Kino.JS.Live.new(__MODULE__, assigns)
  end

  @impl true
  def init(assigns, ctx), do: {:ok, assign(ctx, assigns)}

  @impl true
  def handle_connect(ctx), do: {:ok, ctx.assigns, ctx}

  @impl true
  def handle_event("publish", %{"year" => year, "day" => day, "level" => level, "value" => value}, ctx) do

    {:ok, %{body: body}} =
      Req.post("https://adventofcode.com/#{year}/day/#{day}/answer",
        follow_redirects: false,
        body: "level=#{level}&answer=#{value}",
        headers: [
          {"cookie", "session=#{System.fetch_env!("LB_AOC_SESSION")}"},
          {"content-type", "application/x-www-form-urlencoded"}
        ]
      )
    result = body
      |> Floki.parse_document!()
      |> Floki.find("article")
      |> Floki.raw_html()

    broadcast_event(ctx, "render-result", %{level: level, result: result})
    {:noreply, ctx}
  end
end
