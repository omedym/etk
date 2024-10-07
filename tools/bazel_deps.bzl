load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def fetch_dependencies():

  http_archive(
    name = "rules_nodejs",
    sha256 = "dddd60acc3f2f30359bef502c9d788f67e33814b0ddd99aa27c5a15eb7a41b8c",
    strip_prefix = "rules_nodejs-6.1.0",
    url = "https://github.com/bazelbuild/rules_nodejs/releases/download/v6.1.0/rules_nodejs-v6.1.0.tar.gz",
  )

  http_archive(
    name = "aspect_rules_js",
    sha256 = "5a00869efaeb308245f8132a671fe86524bdfc4f8bfd1976d26f862b316dc3c9",
    strip_prefix = "rules_js-1.42.0",
    url = "https://github.com/aspect-build/rules_js/releases/download/v1.42.0/rules_js-v1.42.0.tar.gz",
  )

  http_archive(
    name = "aspect_rules_ts",
    sha256 = "b11f5bd59983a58826842029b99240fd0eeb6f1291d710db10f744b327701646",
    strip_prefix = "rules_ts-2.3.0",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v2.3.0/rules_ts-v2.3.0.tar.gz",
  )

  http_archive(
    name = "aspect_rules_swc",
    sha256 = "cde09df7dea773adaed896612434559f8955d2dfb2cfd6429ee333f30299ed34",
    strip_prefix = "rules_swc-1.2.2",
    url = "https://github.com/aspect-build/rules_swc/releases/download/v1.2.2/rules_swc-v1.2.2.tar.gz",
  )

  http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "999349afef62875301f45ec8515189ceaf2e85b1e67a17e2d28b95b30e1d6c0b",
    strip_prefix = "rules_esbuild-0.18.0",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.18.0/rules_esbuild-v0.18.0.tar.gz",
  )

  http_archive(
    name = "aspect_rules_jest",
    sha256 = "49c688e3838c855a9acf3b77bc25cfb18bdd70b03ff0810fbfd6353dd6055feb",
    strip_prefix = "rules_jest-0.20.0",
    url = "https://github.com/aspect-build/rules_jest/releases/download/v0.20.0/rules_jest-v0.20.0.tar.gz",
  )

  # TODO: upgrade to latest only after migrating to rules_oci
  # see https://github.com/bazelbuild/rules_docker/issues/2024
  http_archive(
    name = "rules_pkg",
    sha256 = "451e08a4d78988c06fa3f9306ec813b836b1d076d0f055595444ba4ff22b867f",
    urls = [
      "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.7.1/rules_pkg-0.7.1.tar.gz",
      "https://github.com/bazelbuild/rules_pkg/releases/download/0.7.1/rules_pkg-0.7.1.tar.gz",
    ],
  )

  # http_archive(
  #     name = "rules_pkg",
  #     urls = [
  #         "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.9.1/rules_pkg-0.9.1.tar.gz",
  #         "https://github.com/bazelbuild/rules_pkg/releases/download/0.9.1/rules_pkg-0.9.1.tar.gz",
  #     ],
  #     sha256 = "8f9ee2dc10c1ae514ee599a8b42ed99fa262b757058f65ad3c384289ff70c4b8",
  # )

  http_archive(
    name = "rules_oci",
    sha256 = "6ae66ccc6261d3d297fef1d830a9bb852ddedd3920bbd131021193ea5cb5af77",
    strip_prefix = "rules_oci-1.7.0",
    url = "https://github.com/bazel-contrib/rules_oci/releases/download/v1.7.0/rules_oci-v1.7.0.tar.gz",
  )

  http_archive(
    name = "aspect_bazel_lib",
    sha256 = "a8a92645e7298bbf538aa880131c6adb4cf6239bbd27230f077a00414d58e4ce",
    strip_prefix = "bazel-lib-2.7.2",
    url = "https://github.com/aspect-build/bazel-lib/releases/download/v2.7.2/bazel-lib-v2.7.2.tar.gz",
  )

