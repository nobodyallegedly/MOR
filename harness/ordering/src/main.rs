//! Runs many random worlds through the checks and prints the tally.
//!
//! `cargo run --release -p mor-ordering-sim -- [runs] [first-seed]`

use mor_ordering_sim::check::{check, Tally};

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
    println!("{t:#?}");
    println!(
        "wrong answers of the rule tested (option α): {}",
        t.failures()
    );
    if t.failures() > 0 {
        std::process::exit(1);
    }
}
