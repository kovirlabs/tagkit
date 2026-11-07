# shipit

shipit deploys a folder of static files with one command. It works with any host that accepts uploads over SFTP or S3.

## Why shipit

- One command, no configuration for the common case.
- Only changed files are uploaded.[^1]
- Works offline until the upload.

## Next steps

Read [Install](guide/install.md), then [Configure](guide/configure.md).

[^1]: Files are compared by content hash, not by date.
