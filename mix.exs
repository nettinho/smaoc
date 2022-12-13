defmodule Smaoc.MixProject do
  use Mix.Project

  def project do
    [
      app: :smaoc,
      version: "0.1.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {Smaoc.Application, []},
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:kino, "~> 0.8.0"},
      {:req, "~> 0.3.3"},
      {:floki, "~> 0.34.0"},
    ]
  end
end
