# Public submodule k2.hx

This repo presents complete SDK, API, and the demo HTML for my hobby project Stellar Help Exchange (<b>hX</b>).
It also contains all the unit and integration tests for you to run locally. The demo runs these integration tests globally.

## Dev  ➡️  Test  ➡️  Demo

The demo use case is based on [this YouTube video](https://www.youtube.com/watch?v=y4TELgx28D4). It uses 3 actors - Ann, Bob, and Cyn.
Ann is associated with the demo user and runs in a browser when running globally. Bob and Cyn are associated with the demo agents.

Four demo users - Abe, Al, Ava, and Aza - request the demo, but only one demo at a time is allowed to run.
To let a demo user access the demo, I use what I call Stellar TESTNET Monitor (TM). The TM use case wraps the demo use case.
The following sequence diagram gives a bird's-eye view on the TM use case:

```
+-----+   +------+    +-----+   +-----+         +----+   +------+
| Ann |   | demo |    | Bob |   | Cyn |         | TM |   | cron |
+-----+   +------+    +-----+   +-----+         +----+   +------+
   |         |           |         |              |    reset |
   |         |           |         |              |<---------|
   |         |           |         |              |          |
   |         |           |         |              | use      |
   |                     |         |              |----\      
   | buy MA 1@1          |         |              |    |      
   |-------------------->|         |              |<---/      
   |         |           |                        |           
   |         |           |      sell MA 1@1       |           
   |         |           |<-----------------------|<---\      
   | trade: grant access | trade: buy MA 2@2      |    |      
   |<--------------------|-------------------\    |    |      
   |         |           |<------------------/    |    |      
   | run     |           |                        |    |      
   |-------->|           |         |              |    |      
   |         |           |         |              |    |      
   |         | demo                |              |    |      
   |         | done: sell MA 2@2   |              |    |      
   |         |-------------------->| trade: ----->|----/      
   |         |           |         |              | on trade or TM timeout
   =         =           |         |              |           
```

The TM makes use of [Stellar Decentralized Exchange (SDEX)](https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools).
When running globally, it gets reset by `cron` at 3am daily and runs on Stellar TESTNET until the next reset. When in use, it makes Bob sell Monitor Asset (MA) for XLM
(sell MA 1@1). And each of the 4 demo users - Abe, Al, Ava, and Aza - request the demo by buying MA 1@1. A demo user is associated with Ann.

When the trade happens, Ann is granted access to run the demo, and Bob wants to buy MA 2@2. When the demo is done, it makes Cyn sell MA 2@2,
and when the TM is notified of the trade, it makes Bob to re-sell MA 1@1 again. If more demo users want to buy MA 1@1, one of them is notified of the trade.
If running globally and the demo user is not online at this moment, nothing happens and everything hangs until the TM timeout fires and the show goes on.

### Dev

The codebase has [SDK](lib/sdk.mjs), [API](lib/api.js), and the entry points for:
- [the demo user](src/demoit/demouser.js);
- [the demo agents](src/demoit/job.js#L8);
- [TM reset](src/demoit/job.js#L43); and
- [TM use](src/demoit/job.js#L78).

### Test

All tests are `ava`-based. Run unit tests with `npm test`. Run integration tests with `make`,
supported test cases are:
- `DEMO=mock TM=mock make`;
- `DEMO=mock TM=skip make`;
- `TM=skip make`;
- `DEMO=mock make`; [sample output](demoit/output/DEMOmock.out)
- `make`.

