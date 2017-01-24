# Weak Memoize

Memoizes async functions, caching the returned promise, but later deleting the promise
from the cache once it resolves.

## Why

I made this to address the problem I encountered here:
> [Prevent multiple async calls from all attempting to refresh an expired OAuth token][1]

[1]: http://codereview.stackexchange.com/q/125601/69082
