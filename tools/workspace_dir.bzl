# see https://docs.aspect.build/rulesets/aspect_bazel_lib/docs/stamping/
load("@aspect_bazel_lib//lib:stamping.bzl", "STAMP_ATTRS", "maybe_stamp")

# see https://stackoverflow.com/a/65129568/1930352
def _write_workspace_dir_impl(ctx):
    src = ctx.files._src[0]
    out = ctx.actions.declare_file(ctx.label.name)
    ctx.actions.run_shell(
        inputs = ctx.files._src,
        outputs = [out],
        command = """
          full_path="$(readlink -f -- "{src_full}")"
          # Trim the src.short_path suffix from full_path. Double braces to
          # output literal brace for shell.
          echo "${{full_path%/{src_short}}}" >> {out_full}
        """.format(src_full = src.path, src_short = src.short_path, out_full = out.path),
        execution_requirements = {
            "no-sandbox": "1",
            "no-remote": "1",
            "local": "1",
        },
    )
    return [DefaultInfo(files = depset([out]))]

write_workspace_dir = rule(
    implementation = _write_workspace_dir_impl,
    attrs = {
        "_src": attr.label(allow_files = True, default = "BUILD.bazel"),
    },
    doc = "Writes the full path of the current workspace dir to a file.",
)

def _write_tsconfig_with_source_root_impl(ctx):
    src_full = ctx.files.src[0].path
    src = src_full.rsplit("/src")[0]
    out = ctx.actions.declare_file(ctx.label.name)
    prefix = ctx.attr.prefix;
    stamp = maybe_stamp(ctx)
    if stamp:
      prefix = stamp.stable_status_file.path

    ctx.actions.run_shell(
        inputs = ctx.files.src,
        outputs = [out],
        command = """
          if [ "{stamp}" == "None" ]; then
              if [ -z "{prefix}" ]; then
                  prefix="$(readlink -f -- "{src}")"
              else
                  prefix="{prefix}"
              fi
          else
              prefix=$(cat {prefix} | awk '$1 == "STABLE_GIT_COMMIT" {{ print "https://github.com/omedym/etk/blob/" $2 "/{src}"}}')
          fi
          echo '{{ "compilerOptions": {{ "sourceRoot": ' >> {out_full}
          echo "\\"${{prefix}}/src\\"" >> {out_full}
          echo '}} }}' >> {out_full}
        """.format(src = src, src_full = src_full, out_full = out.path, prefix = prefix, stamp = stamp),
        execution_requirements = {
            "no-sandbox": "1",
            "no-remote": "1",
            "local": "1",
        },
    )
    return [DefaultInfo(files = depset([out]))]

write_tsconfig_with_source_root = rule(
    implementation = _write_tsconfig_with_source_root_impl,
    attrs = dict({
        "src": attr.label(allow_files = True, default = "src"),
        "prefix": attr.string(default = ""),
    }, **STAMP_ATTRS)
)
