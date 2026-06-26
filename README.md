# Public submodule k2.hx

This repo presents complete SDK, API, and the demo HTML for my hobby project Stellar Help Exchange (<b>hX</b>).
It also contains all the unit and integration tests for you to run locally. The demo runs
these integration tests globally.

## Dev  ➡️  Test  ➡️  Demo

### Dev

The codebase has [SDK](lib/sdk.mjs), [API](lib/api.js), and the entry points for:
- [the demo user](src/demoit/demouser.js);
- [the agents](src/demoit/job.js#L8);
- [the demo reset process](src/demoit/job.js#L43); and
- [the demo access control process](src/demoit/job.js#L78).

### Test

All tests are `ava`-based. Run unit tests with `npm test`. Run integration tests with `make`,
supported test cases are:
- `DEMO=mock TM=mock make`;
- `DEMO=mock TM=skip make`;
- `TM=skip make`;
- `DEMO=mock make`;
- `make`.

=== OLD STUFF ===
Local testing is `make`-based. Start with `make mock` - the output will look similar to this:

```
3339352 mock started on Sun Jun 14 08:17:25 PM UTC 2026
3339354 3339355 3339357 3339359 Abe requested demo...
Ava requested demo...
Al requested demo...
Aza requested demo...
3339366 3339369 3339372 Bob started demo for Abe
Ann started demo for Abe
Cyn started demo for Abe
+3 Bob demo DONE for Abe
+3 Cyn demo DONE for Abe
+4 Ann demo DONE for Abe
3339402 3339406 3339407 Ann started demo for Aza
Cyn started demo for Aza
Bob started demo for Aza
+2 Cyn demo DONE for Aza
+4 Bob demo DONE for Aza
+5 Ann demo DONE for Aza
3339440 3339441 3339444 Ann started demo for Ava
Cyn started demo for Ava
Bob started demo for Ava
+4 Bob demo DONE for Ava
+5 Ann demo DONE for Ava
+5 Cyn demo DONE for Ava
3339472 3339473 3339475 Ann started demo for Al
Cyn started demo for Al
Bob started demo for Al
+1 Bob demo DONE for Al
+4 Ann demo DONE for Al
+5 Cyn demo DONE for Al
3339352 mock DONE on Sun Jun 14 08:17:48 PM UTC 2026
```

Here, we mock our demo for 4 demo users: Abe, Al, Ava, and Aza. Only one demo at a time is allowed to run.
Once started, 3 actors are involved in the demo - Ann, Bob, and Cyn (see also [this YouTube video](https://www.youtube.com/watch?v=y4TELgx28D4)).

To test the demo only, run `make demo`.

For a demo user to access the demo, I use what I call Stellar TESTNET Monitor. Run `DEMO=mock make` to test it.

To test the whole thing, run `make`.
