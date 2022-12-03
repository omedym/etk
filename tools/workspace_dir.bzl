# See: https://stackoverflow.com/a/65129568/1930352

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
