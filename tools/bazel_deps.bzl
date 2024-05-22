# Third-party dependencies fetched by Bazel
# Unlike WORKSPACE, the content of this file is unordered.
# We keep them separate to make the WORKSPACE file more maintainable.

# Install the nodejs "bootstrap" package
# This provides the basic tools for running and packaging nodejs programs in Bazel
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

def fetch_dependencies():
    http_archive(
        name = "rules_nodejs",
        sha256 = "a50986c7d2f2dc43a5b9b81a6245fd89bdc4866f1d5e316d9cef2782dd859292",
        strip_prefix = "rules_nodejs-6.0.5",
        url = "https://github.com/bazelbuild/rules_nodejs/releases/download/v6.0.5/rules_nodejs-v6.0.5.tar.gz",
    )

    http_archive(
        name = "aspect_rules_js",
        sha256 = "63cf42b07aae34904447c74f5b41652c4933984cc325726673a5e4561d9789e7",
        strip_prefix = "rules_js-1.39.1",
        url = "https://github.com/aspect-build/rules_js/releases/download/v1.39.1/rules_js-v1.39.1.tar.gz",
    )

    http_archive(
        name = "aspect_rules_ts",
        sha256 = "c77f0dfa78c407893806491223c1264c289074feefbf706721743a3556fa7cea",
        strip_prefix = "rules_ts-2.2.0",
        url = "https://github.com/aspect-build/rules_ts/releases/download/v2.2.0/rules_ts-v2.2.0.tar.gz",
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
        name = "aspect_rules_rollup",
        sha256 = "6694a42c99b8b46a8788575597419d31cdf6c163fe77354730eb1ab4007fb6aa",
        strip_prefix = "rules_rollup-1.0.2",
        url = "https://github.com/aspect-build/rules_rollup/releases/download/v1.0.2/rules_rollup-v1.0.2.tar.gz",
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
        name = "io_bazel_rules_go",
        sha256 = "099a9fb96a376ccbbb7d291ed4ecbdfd42f6bc822ab77ae6f1b5cb9e914e94fa",
        urls = [
            "https://mirror.bazel.build/github.com/bazelbuild/rules_go/releases/download/v0.35.0/rules_go-v0.35.0.zip",
            "https://github.com/bazelbuild/rules_go/releases/download/v0.35.0/rules_go-v0.35.0.zip",
        ],
    )

    http_archive(
        name = "bazel_gazelle",
        sha256 = "efbbba6ac1a4fd342d5122cbdfdb82aeb2cf2862e35022c752eaddffada7c3f3",
        urls = [
            "https://mirror.bazel.build/github.com/bazelbuild/bazel-gazelle/releases/download/v0.27.0/bazel-gazelle-v0.27.0.tar.gz",
            "https://github.com/bazelbuild/bazel-gazelle/releases/download/v0.27.0/bazel-gazelle-v0.27.0.tar.gz",
        ],
    )

    http_archive(
        name = "aspect_bazel_lib",
        sha256 = "f6ef68871d206cf8f5f4eea83d26a366563a631b020afe1da2f838a9bff035c0",
        strip_prefix = "bazel-lib-1.40.0",
        url = "https://github.com/aspect-build/bazel-lib/releases/download/v1.40.0/bazel-lib-v1.40.0.tar.gz",
    )

    http_archive(
        name = "typesense_instantsearch_adapter",
        sha256 = "a9ca9162f24b57b4348d31c2b6639a419939f7eb76397ca4b522d56ef3629cd6",
        build_file = "//tools:external/typesense-instantsearch-adapter/BUILD.bazel",
        strip_prefix = "typesense-instantsearch-adapter-2.8.0",
        url = "https://github.com/typesense/typesense-instantsearch-adapter/archive/refs/tags/v2.8.0.tar.gz",
    )
