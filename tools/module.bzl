load("@aspect_bazel_lib//lib:jq.bzl", "jq")
load("@aspect_rules_jest//jest:defs.bzl", "jest_test")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@aspect_rules_swc//swc:defs.bzl", "swc")
load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("@bazel_skylib//lib:partial.bzl", "partial")

load("//tools:workspace_dir.bzl", "write_tsconfig_with_source_root")


def local_module(
  name,
  deps = [],
  test_deps = [],
  with_integration_test = False,
  integration_test_deps = [],
  version = "0.1.0"
):
  write_tsconfig_with_source_root(
    name = "source_root",
    src = "src/index.ts",
  )

  jq(
    name = "with_source_root",
    srcs = ["tsconfig.bazel.json", ":source_root"],
    filter = ".[0] * .[1]",
    args = ["--slurp"],
    out = "tsconfig.bazel.with_source_root.json",
  )

  ts_config(
    name = "tsconfig",
    src = ":with_source_root",
    deps = ["//:tsconfig"],
  )

  ts_project(
    name = "ts",
    srcs = native.glob(["src/**/*.ts", "src/**/*.tsx"], exclude = ["**/*.test.ts"]),
    declaration = True,
    incremental = True,
    root_dir = "src",
    tags = ["ts"],
    tsconfig = ":tsconfig",
    transpiler = partial.make(swc, swcrc = "//:.swcrc"),
    validate = False,
    deps = deps,
  )

  PACKAGE_JSON = """{{
  "name": "@omedym/{name}",
  "version": "{version}",
  "publishConfig": {{
    "registry": "https://npm.pkg.github.com"
  }},
  "main": "index.js",
  "typings": "index.d.ts"
}}
""".format(name = name, version = version)

  native.genrule(
    name = "package_json",
    outs = ["package.json"],
    cmd = "echo '{package_json}' > $@".format(package_json = PACKAGE_JSON),
)

  npm_package(
    name = "js",
    srcs = [":ts", ":package_json"],
    data = deps + ["//:node_modules/@swc/helpers"],
    package = "@omedym/{name}".format(name = name),
    replace_prefixes = {
        "src/": "",
    },
  )

  jest_test(
    name = "test",
    config = "//:jest_config_unit",
    data = deps + test_deps
        + native.glob(["src/**/*.ts", "src/**/*.tsx"], exclude = ["src/**/*.integration.test.ts"])
        + ["//:test_unit_deps", ":tsconfig"],
    log_level = "info",
    node_modules = "//:node_modules",
    tags = ["unit"],
    timeout = "short",
    fixed_args = ["--logHeapUsage", "--workerIdleMemoryLimit=2048MB"],
    node_options = ["--expose-gc", "--max-old-space-size=16384", "--experimental-vm-modules"],
  )

  if with_integration_test:
    jest_test(
        name = "integration_test",
        config = "//:jest_config_integration",
        data = deps + integration_test_deps
            + native.glob(["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts"])
            + ["//:test_integration_deps", ":tsconfig"],
        log_level = "info",
        node_modules = "//:node_modules",
        tags = ["integration"],
        timeout = "long",
        fixed_args = ["--logHeapUsage", "--workerIdleMemoryLimit=1024MB"],
        node_options = ["--expose-gc", "--max-old-space-size=16384"],
    )