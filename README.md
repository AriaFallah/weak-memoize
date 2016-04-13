# Weak Memoize

A cache that invalidates itself on a per key basis depending on the frequency of cache hits, and a
configurable expiration delay.

## How it works

Every time a key is added to the cache a debounced function to delete that key will be created and
stored in a Map. Then every time there's a cache hit that debounced function will be called again,
delaying the destruction of the key. If there hasn't been a hit on the cache for a while, the timer
on the debounced function runs out, and the key will be delete from the cache and the Map holding
the timers.
