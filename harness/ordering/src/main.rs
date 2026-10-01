//! Runs many random worlds through the checks and prints the tally.
//!
//! `cargo run --release -p mor-ordering-sim -- [runs] [first-seed]`

use mor_ordering_sim::check::{check, check_written, Tally, WrittenTally};

fn main() {
    if let Ok(s) = std::env::var("SIM_EXPLAIN") {
        mor_ordering_sim::check::explain_unstable(
            s.parse().unwrap(),
            mor_ordering_sim::check::ALPHA,
        );
        return;
    }
    let mut args = std::env::args().skip(1);
    let runs: u64 = args.next().and_then(|a| a.parse().ok()).unwrap_or(20_000);
    let first: u64 = args.next().and_then(|a| a.parse().ok()).unwrap_or(1);
    let mut t = Tally::default();
    for seed in first..first + runs {
        check(seed, &mut t);
    }
    let mut wt = WrittenTally::default();
    for seed in first..first + runs {
        check_written(seed, &mut wt);
    }
    println!("{t:#?}");
    println!(
        "wrong answers of the rule tested (option α): {}",
        t.failures()
    );
    println!("{wt:#?}");
    println!(
        "wrong answers of the rules as Law draft 8 now writes them: {}",
        wt.failures()
    );
    if t.failures() > 0 || wt.failures() > 0 {
        std::process::exit(1);
    }
}
