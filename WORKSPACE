# Bazel workspace created by @bazel/create 5.1.0

# Declares that this directory is the root of a Bazel workspace.
# See https://docs.bazel.build/versions/main/build-ref.html#workspace
workspace(
  # How this workspace would be referenced with absolute labels from another workspace
  name = "nestjs-dmq",
)

load("//tools:bazel_deps.bzl", "fetch_dependencies")
fetch_dependencies()

# Import toolchain repositories for remote executions, but register the
# toolchains using --extra_toolchains on the command line to get precedence.
local_repository(
  name = "remote_config_cc",
  path = "tools/remote-toolchains/ubuntu-act-22-04/local_config_cc",
)

local_repository(
  name = "remote_config_sh",
  path = "tools/remote-toolchains/ubuntu-act-22-04/local_config_sh",
)

load("@aspect_bazel_lib//lib:repositories.bzl", "aspect_bazel_lib_dependencies")
aspect_bazel_lib_dependencies()

# "Aspect bazelrc presets; see https://docs.aspect.build/guides/bazelrc"
#load("@aspect_bazel_lib//lib:bazelrc_presets.bzl", "write_aspect_bazelrc_presets")
#write_aspect_bazelrc_presets(name = "update_aspect_bazelrc_presets")

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")
rules_js_dependencies()

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")
rules_ts_dependencies(
    # This keeps the TypeScript version in-sync with the editor, which is typically best.
    ts_version_from = "//:package.json",

    # Alternatively, you could pick a specific version, or use
    # load("@aspect_rules_ts//ts:repositories.bzl", "LATEST_TYPESCRIPT_VERSION")
    # ts_version = LATEST_TYPESCRIPT_VERSION
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")
npm_translate_lock(
  name = "npm",
  bins = {
    # Derived from "bin" attribute in node_modules/prisma/package.json
    "prisma": {
        "prisma": "./build/index.js"
    },
    # Derived from "bin" attribute in node_modules/typescript/package.json
    "typescript": {
        "tsc": "./bin/tsc",
        "tsserver": "./bin/tsserver",
    },
  },
  npmrc = "@//:.npmrc",
  pnpm_lock = "//:pnpm-lock.yaml",
  verify_node_modules_ignored = "//:.bazelignore",
  lifecycle_hooks = {
    # This is needed to disable postinstall lifecycle hook from firing for 'cpu-features'
    # package (which is an optional package), otherwise a node-gyp error is thrown.
    "cpu-features": [],
  },
)

######################
# rules_esbuild setup #
######################

# Fetches the rules_esbuild dependencies.
# If you want to have a different version of some dependency,
# you should fetch it *before* calling this.
# Alternatively, you can skip calling this function, so long as you've
# already fetched all the dependencies.
load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")
rules_esbuild_dependencies()

####################
# rules_jest setup #
####################
# Fetches the rules_jest dependencies.
# If you want to have a different version of some dependency,
# you should fetch it *before* calling this.
# Alternatively, you can skip calling this function, so long as you've
# already fetched all the dependencies.
load("@aspect_rules_jest//jest:dependencies.bzl", "rules_jest_dependencies")
rules_jest_dependencies()

####################

load("@npm//:repositories.bzl", "npm_repositories")
npm_repositories()

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")
rules_pkg_dependencies()

############################
# Register NodeJs Toolchains
############################

# If you didn't already register a toolchain providing nodejs, do that:
load("@rules_nodejs//nodejs:repositories.bzl", "DEFAULT_NODE_VERSION", "nodejs_register_toolchains")

nodejs_register_toolchains(
  name = "node",
  node_version = DEFAULT_NODE_VERSION,
)

nodejs_register_toolchains(
  name = "nodejs",
  node_version = DEFAULT_NODE_VERSION,
)

# Register a toolchain containing esbuild npm package and native bindings
load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_ESBUILD_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
  name = "esbuild",
  esbuild_version = LATEST_ESBUILD_VERSION,
)
