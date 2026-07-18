# Public submodule k2.hx

This repo presents complete SDK, API, and the demo HTML for my hobby project Stellar Help Exchange (<b>hX</b>).
It also contains all the unit and integration tests for you to run locally. The demo runs the integration tests globally.

## Dev  ➡️   Test  ➡️   Demo

The demo use case is based on [this YouTube video](https://www.youtube.com/watch?v=y4TELgx28D4). It has 3 actors - Ann, Bob, and Cyn.
Ann is associated with the demo user and runs in a browser when running globally. Bob and Cyn are associated with the demo agents.

Four demo users - Abe, Al, Ava, and Aza - request the demo, but only one demo at a time is allowed to run.
To let a demo user access the demo, I employ what I call Stellar TESTNET Monitor (TM). The TM use case wraps the demo use case.
The following sequence diagram outlines the core of the TM use case:

```
+-----+   +------+    +-----+   +-----+         +----+   +------+
| A*  |   | demo |    | Bob |   | Cyn |         | TM |   | cron |
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

The following sequence diagram outlines the core of the demo use case:

```
+-----+                                    +----+    +-----+           +-----+
| Ann |                                    | hX |    | Cyn |           | Bob |
+-----+                                    +----+    +-----+           +-----+
   | makeRequest                              |         |       makeOffer |
   |----------------------------------------->|<--------------------------|
   | Red snapper for 4 persons GGS. HEXA 1000 | Red snapper 4lb. HEXA 800 |
   |                                          |         |                 |
   |                                          |         |                 |
   |                                          | effects |                 |
   |                                          |<--------|                 |
   |                                          |    take | take            |
   |<---------------------------------------------------|---------------->|
   | deal                                     |         |            deal |
   |--------------------------------------------------->|<----------------|
   |                                          |         |                 |
   |                                          |  convert ClawableHEXA 800 |
   |                                          |<--------------------------|
   |                                          | made HEXA 800 unclawable  |
   |                                          |-------------------------->|
   |                                          |         |                 |
   | breakDeal                                |         |
   |----------------------------------------->| clawback ClawableHEXA 1000
   |                                          |-------->|
   |                                   repaid |         |
   |<-----------------------------------------|         |
   |                                          |         |
   |                                  disputeBrokenDeal |
   |                                          |<--------|
   |                                          |         |
```

### Dev

The codebase has [SDK](lib/sdk.mjs), [API](lib/api.js), and the entry points for:
- [the demo user](src/demoit/demouser.js);
- [the demo agents](src/demoit/job.js#L14);
- [TM reset](src/demoit/job.js#L64); and
- [TM use](src/demoit/job.js#L99).

### Test

All tests are `ava`-based. Run unit tests with `npm test` ([sample output](demoit/output/npmtest.out)). Run integration tests with `make`,
supported test cases are:
- `DEMO=mock TM=mock make`; [sample output](demoit/output/DEMOmockTMmock.out)
- `DEMO=mock TM=skip make`; [sample output](demoit/output/DEMOmockTMskip.out)
- `DEMO=mock make`; [sample output](demoit/output/DEMOmock.out)
- `TM=skip make`; [sample output](demoit/output/TMskip.out)
- `make`. [sample output](demoit/output/DEMO.out)

